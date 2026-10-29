import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, Search, X } from 'lucide-react';
import useAsync from '../hooks/useAsync';
import useMovieQuery from '../hooks/useMovieQuery';
import { useUser } from '../context/UserData';
import { CATEGORIES, getProviders } from '../services/movieService';
import { ACCESS, LANGUAGE_GROUPS, sortMovies } from '../utils/movieHelpers';
import GenreFilter from '../components/GenreFilter';
import LanguageFilter from '../components/LanguageFilter';
import MovieGrid from '../components/MovieGrid';
import RegionSelect from '../components/RegionSelect';

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1949 }, (_, i) => THIS_YEAR + 1 - i);
const SORTS = [['popular', 'Popularity'], ['rating', 'Rating'], ['newest', 'Release date: newest'], ['oldest', 'Release date: oldest']];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const { region } = useUser();
  const get = (k) => params.get(k) || '';
  const f = {
    q: get('q'), genre: get('genre'), year: get('year'), minRating: get('rating'), language: get('lang'),
    provider: get('provider'), type: get('type'), sort: get('sort') || 'popular', cat: get('cat'),
    region: get('provider') || get('type') ? region : undefined,
  };
  const providers = useAsync((s) => getProviders(region, s), [region]);
  // minResults keeps fetching pages until at least 7 real matches exist (when more are available).
  const query = useMovieQuery(f, { minResults: 7 });
  const sorted = useMemo(() => (f.q ? sortMovies(query.results, f.sort) : query.results), [query.results, f.q, f.sort]);

  const setFilter = (k, v) => setParams((p) => {
    const n = new URLSearchParams(p);
    if (v) n.set(k, v); else n.delete(k);
    return n;
  }, { replace: true });

  // Debounced title search. lastSent avoids overwriting text the user is still typing.
  const [qInput, setQInput] = useState(f.q);
  const lastSent = useRef(f.q);
  useEffect(() => {
    if (qInput === lastSent.current) return undefined;
    const t = setTimeout(() => { lastSent.current = qInput; setFilter('q', qInput.trim()); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);
  useEffect(() => {
    if (f.q !== lastSent.current) { lastSent.current = f.q; setQInput(f.q); }
  }, [f.q]);

  const reset = () => { lastSent.current = ''; setQInput(''); setParams({}, { replace: true }); };
  const anyFilter = ['q', 'genre', 'year', 'minRating', 'language', 'provider', 'type', 'cat'].some((k) => f[k]) || f.sort !== 'popular';
  const heading = f.cat && CATEGORIES[f.cat] ? `${CATEGORIES[f.cat]} movies` : 'Explore movies';

  return (
    <div className="container page">
      <h1>{heading}</h1>

      <div className="filters panel">
        <div className="field field-search">
          <label htmlFor="q">Search by title</label>
          <div className="input-wrap">
            <Search size={16} aria-hidden="true" />
            <input id="q" type="search" value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Try “Vikram”, “Leo” or “Interstellar”" />
            {qInput && <button type="button" className="icon-btn" aria-label="Clear search" onClick={() => setQInput('')}><X size={16} aria-hidden="true" /></button>}
          </div>
        </div>
        <div className="field"><label htmlFor="lang">Original language</label>
          <select id="lang" value={f.language} onChange={(e) => setFilter('lang', e.target.value)}>
            <option value="">Any language</option>
            {LANGUAGE_GROUPS.map(([g, langs]) => (
              <optgroup key={g} label={g}>{langs.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</optgroup>
            ))}
          </select></div>
        <div className="field"><label htmlFor="year">Release year</label>
          <select id="year" value={f.year} onChange={(e) => setFilter('year', e.target.value)}>
            <option value="">Any year</option>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select></div>
        <div className="field"><label htmlFor="rating">Minimum rating</label>
          <select id="rating" value={f.minRating} onChange={(e) => setFilter('rating', e.target.value)}>
            <option value="">Any rating</option>{[5, 6, 7, 8].map((r) => <option key={r} value={r}>{r}+ out of 10</option>)}
          </select></div>
        <div className="field"><label htmlFor="provider">Streaming provider</label>
          <select id="provider" value={f.provider} onChange={(e) => setFilter('provider', e.target.value)}>
            <option value="">Any provider</option>{(providers.data || []).slice(0, 60).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select></div>
        <div className="field"><label htmlFor="type">Availability type</label>
          <select id="type" value={f.type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">Any type</option>{Object.entries(ACCESS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select></div>
        <div className="field"><label htmlFor="sort">Sort by</label>
          <select id="sort" value={f.sort} onChange={(e) => setFilter('sort', e.target.value === 'popular' ? '' : e.target.value)}>
            {SORTS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
          </select></div>
        {(f.provider || f.type) && <RegionSelect />}
      </div>

      <LanguageFilter selected={f.language} onSelect={(c) => setFilter('lang', c)} />
      <GenreFilter selected={f.genre} onSelect={(id) => setFilter('genre', id)} />

      <div className="toolbar">
        <p role="status" aria-live="polite">
          {query.loading && !sorted.length ? 'Loading…' : `${sorted.length} movie${sorted.length === 1 ? '' : 's'} shown`}
          {f.cat && CATEGORIES[f.cat] && <> in <strong>{CATEGORIES[f.cat]}</strong> <button type="button" className="link-btn" onClick={() => setFilter('cat', '')}>clear</button></>}
        </p>
        <button type="button" className="btn btn-small" onClick={reset} disabled={!anyFilter}><RotateCcw size={14} aria-hidden="true" /> Clear all filters</button>
      </div>
      {query.notice && <p className="notice" role="note">{query.notice}</p>}

      <MovieGrid movies={sorted} loading={query.loading} error={query.error} onRetry={query.retry}
        emptyTitle="No movies match" emptyMessage="TMDB returned nothing for this combination. Try a different title or remove a filter."
        emptyAction={<button type="button" className="btn" onClick={reset}>Clear all filters</button>} />

      {query.hasMore && sorted.length > 0 && (
        <div className="center"><button type="button" className="btn" onClick={query.loadMore} disabled={query.loading}>{query.loading ? 'Loading…' : 'Load more'}</button></div>
      )}
    </div>
  );
}
