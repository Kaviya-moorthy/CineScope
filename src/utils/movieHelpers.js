// TMDB movie genre IDs are stable; keeping them local avoids an extra request.
export const GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' }, { id: 37, name: 'Western' },
];
export const HOME_GENRE_IDS = [28, 12, 35, 18, 27, 10749, 53, 878, 16];

export const LANGUAGE_GROUPS = [
  ['Indian languages', [
    ['ta', 'Tamil'], ['te', 'Telugu'], ['hi', 'Hindi'], ['ml', 'Malayalam'], ['kn', 'Kannada'],
    ['bn', 'Bengali'], ['mr', 'Marathi'], ['pa', 'Punjabi'], ['gu', 'Gujarati'], ['or', 'Odia'],
  ]],
  ['International languages', [
    ['en', 'English'], ['ko', 'Korean'], ['ja', 'Japanese'], ['zh', 'Chinese'], ['es', 'Spanish'],
    ['fr', 'French'], ['de', 'German'], ['it', 'Italian'], ['pt', 'Portuguese'], ['tr', 'Turkish'],
    ['th', 'Thai'], ['id', 'Indonesian'], ['ar', 'Arabic'],
  ]],
];
export const LANGUAGES = LANGUAGE_GROUPS.flatMap(([, l]) => l);

export const REGIONS = [
  ['IN', 'India'], ['US', 'United States'], ['GB', 'United Kingdom'], ['CA', 'Canada'],
  ['AU', 'Australia'], ['SG', 'Singapore'], ['AE', 'United Arab Emirates'], ['MY', 'Malaysia'],
  ['LK', 'Sri Lanka'], ['NZ', 'New Zealand'], ['DE', 'Germany'], ['FR', 'France'], ['JP', 'Japan'],
];

// Access categories. Keys match TMDB's watch-provider groups.
export const ACCESS = {
  flatrate: { label: 'Subscription', help: 'Included with a subscription' },
  free: { label: 'Free', help: 'Free to watch' },
  ads: { label: 'Free with ads', help: 'Free, supported by advertisements' },
  rent: { label: 'Rent', help: 'Pay per title; time-limited rental' },
  buy: { label: 'Buy', help: 'Pay once for a digital copy' },
};
export const ACCESS_ORDER = ['flatrate', 'free', 'ads', 'rent', 'buy'];

export const genreName = (id) => GENRES.find((g) => g.id === Number(id))?.name;
export const genreNames = (ids = []) => ids.map(genreName).filter(Boolean);
export const languageName = (code) => LANGUAGES.find(([c]) => c === code)?.[1] || (code ? code.toUpperCase() : '');
export const sameId = (a, b) => String(a) === String(b);

export const formatRuntime = (min) => (min ? `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m` : null);
export const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};
export const formatRating = (r) => (typeof r === 'number' && r > 0 ? r.toFixed(1) : null);

export function hueFromText(text = '') {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) % 360;
  return h;
}

export function sortMovies(list, sort) {
  const arr = [...list];
  const date = (m) => m.releaseDate || '';
  switch (sort) {
    case 'rating': return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'newest': return arr.sort((a, b) => date(b).localeCompare(date(a)));
    case 'oldest': return arr.sort((a, b) => (date(a) || '9').localeCompare(date(b) || '9'));
    case 'az': return arr.sort((a, b) => a.title.localeCompare(b.title));
    default: return arr;
  }
}

// Rule-based recommendations: score = genre weight overlap + small rating bonus.
// Favourites weigh 2 per genre, watchlist entries 1. Saved titles are excluded.
export function recommend(candidates, favourites, watchlistMovies, limit = 8) {
  const weights = new Map();
  favourites.forEach((m) => (m.genreIds || []).forEach((g) => weights.set(g, (weights.get(g) || 0) + 2)));
  watchlistMovies.forEach((m) => (m.genreIds || []).forEach((g) => weights.set(g, (weights.get(g) || 0) + 1)));
  if (!weights.size) return [];
  const saved = new Set([...favourites, ...watchlistMovies].map((m) => String(m.id)));
  const seen = new Set();
  return candidates
    .filter((m) => !saved.has(String(m.id)) && !seen.has(m.id) && seen.add(m.id))
    .map((m) => {
      const matched = (m.genreIds || []).filter((g) => weights.has(g));
      const score = matched.reduce((s, g) => s + weights.get(g), 0) + (m.rating || 0) / 10;
      return { movie: m, matched, score };
    })
    .filter((x) => x.matched.length)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => ({ ...x.movie, reason: `Because you like ${genreNames(x.matched.slice(0, 2)).join(' and ')}` }));
}
