// Central data layer. UI components never call fetch directly.
// All data comes from the live TMDB API. There is no sample or fallback data.
import { sameId } from '../utils/movieHelpers';

const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/';
const KEY = import.meta.env.VITE_TMDB_API_KEY;
const TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;
export const isConfigured = Boolean(KEY || TOKEN);

export class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.name = 'ApiError'; this.status = status; }
}

const cache = new Map();

async function api(path, params = {}, signal) {
  if (!isConfigured) throw new ApiError('No TMDB API credential is configured. Add one to your .env file.', 401);
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  if (KEY && !TOKEN) url.searchParams.set('api_key', KEY);
  const href = url.toString();
  if (cache.has(href)) return cache.get(href);

  let res;
  try {
    res = await fetch(href, { signal, headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : undefined });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError('Could not reach TMDB. Check your internet connection and try again.');
  }
  if (!res.ok) {
    if (res.status === 401) throw new ApiError('TMDB rejected the API credential. Check the value in your .env file.', 401);
    if (res.status === 404) throw new ApiError('That movie could not be found.', 404);
    if (res.status === 429) throw new ApiError('TMDB is rate limiting requests. Wait a moment and retry.', 429);
    throw new ApiError(`TMDB returned an unexpected response (${res.status}).`, res.status);
  }
  let data;
  try { data = await res.json(); } catch { throw new ApiError('TMDB sent a response that could not be read.', res.status); }
  cache.set(href, data);
  return data;
}

const norm = (m) => ({
  id: m.id,
  title: m.title || m.name || 'Untitled',
  overview: m.overview || '',
  releaseDate: m.release_date || '',
  year: (m.release_date || '').slice(0, 4),
  rating: m.vote_count ? Math.round((m.vote_average || 0) * 10) / 10 : null,
  poster: m.poster_path ? `${IMG}w500${m.poster_path}` : null,
  posterLarge: m.poster_path ? `${IMG}w780${m.poster_path}` : null,
  backdrop: m.backdrop_path ? `${IMG}w1280${m.backdrop_path}` : null,
  language: m.original_language || '',
  genreIds: m.genre_ids || (m.genres || []).map((g) => g.id),
  runtime: m.runtime || null,
});

const list = (data) => (Array.isArray(data?.results) ? data.results.filter((m) => m && m.id).map(norm) : []);

const day = (offset = 0) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);

export const CATEGORIES = {
  trending: 'Trending',
  popular: 'Popular',
  top_rated: 'Top rated',
  upcoming: 'Upcoming',
  recent: 'Recently released',
};

function categoryParams(cat) {
  switch (cat) {
    case 'top_rated': return { sort_by: 'vote_average.desc', 'vote_count.gte': 300 };
    case 'upcoming': return { sort_by: 'popularity.desc', 'primary_release_date.gte': day(1), with_release_type: '2|3' };
    case 'recent': return { sort_by: 'popularity.desc', 'primary_release_date.gte': day(-60), 'primary_release_date.lte': day(0), 'vote_count.gte': 3 };
    default: return { sort_by: 'popularity.desc' };
  }
}

/* ---------- Lists, search and filters (one entry point) ---------- */
export async function queryMovies(f = {}, page = 1, signal) {
  const { q, genre, year, minRating, language, provider, type, region = 'IN', sort, cat } = f;
  const filtered = Boolean(genre || year || minRating || language || provider || type);
  let data;
  let notice = '';

  if (q) {
    data = await api('/search/movie', { query: q, page, primary_release_year: year, include_adult: false }, signal);
    if (provider || type) notice = 'Provider and availability filters cannot be combined with a title search. Clear the search to use them.';
  } else if (cat === 'trending' && !filtered && (!sort || sort === 'popular')) {
    data = await api('/trending/movie/week', { page }, signal);
  } else {
    const base = categoryParams(cat);
    const sortBy = { rating: 'vote_average.desc', newest: 'primary_release_date.desc', oldest: 'primary_release_date.asc' }[sort];
    const hasAvail = Boolean(provider || type);
    data = await api('/discover/movie', {
      page,
      ...base,
      sort_by: sortBy || base.sort_by,
      'vote_count.gte': base['vote_count.gte'] || (sort === 'rating' ? 200 : 5),
      'primary_release_date.lte': base['primary_release_date.lte'] || (sort === 'newest' ? day(0) : undefined),
      with_genres: genre,
      primary_release_year: year,
      'vote_average.gte': minRating,
      with_original_language: language,
      with_watch_providers: provider,
      with_watch_monetization_types: type,
      watch_region: hasAvail ? region : undefined,
      include_adult: false,
    }, signal);
  }

  let results = list(data);
  if (q) {
    // TMDB search cannot filter these server-side, so apply them to the returned page.
    results = results.filter((m) => (!genre || m.genreIds.includes(Number(genre)))
      && (!minRating || (m.rating || 0) >= Number(minRating))
      && (!language || m.language === language));
  }
  return { results, totalPages: Math.min(data?.total_pages || 1, 500), notice };
}

/* ---------- Details ---------- */
export async function getMovieDetails(id, signal) {
  if (!/^\d+$/.test(String(id))) throw new ApiError('That movie could not be found.', 404);
  const d = await api(`/movie/${id}`, { append_to_response: 'credits,videos' }, signal);
  const m = norm(d);
  m.tagline = d.tagline || '';
  m.cast = (d.credits?.cast || []).slice(0, 10).map((c) => ({ id: c.id, name: c.name, character: c.character || '' }));
  m.director = (d.credits?.crew || []).find((c) => c.job === 'Director')?.name || null;
  const vids = (d.videos?.results || []).filter((v) => v.site === 'YouTube' && v.type === 'Trailer');
  m.trailerKey = (vids.find((v) => v.official) || vids[0])?.key || null;
  return m;
}

export async function getSimilar(id, signal) {
  return list(await api(`/movie/${id}/similar`, {}, signal)).slice(0, 12);
}

/* ---------- Providers & availability ---------- */
export async function getProviders(region = 'IN', signal) {
  const data = await api('/watch/providers/movie', { watch_region: region }, signal);
  return (data.results || [])
    .map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: p.logo_path ? `${IMG}w92${p.logo_path}` : null,
      priority: p.display_priorities?.[region] ?? 999,
    }))
    .sort((a, b) => a.priority - b.priority);
}

// Returns null when TMDB reports nothing for this region.
export async function getAvailability(movieId, region = 'IN', signal) {
  const data = await api(`/movie/${movieId}/watch/providers`, {}, signal);
  const entry = data?.results?.[region];
  if (!entry) return null;
  const groups = {};
  ['flatrate', 'free', 'ads', 'rent', 'buy'].forEach((type) => {
    const arr = (entry[type] || []).map((p) => ({
      id: p.provider_id, name: p.provider_name, logo: p.logo_path ? `${IMG}w92${p.logo_path}` : null,
    }));
    if (arr.length) groups[type] = arr;
  });
  if (!Object.keys(groups).length) return null;
  return { link: entry.link || null, groups };
}

export { sameId };
