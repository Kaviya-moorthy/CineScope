import { useMemo, useState } from 'react';
import useAsync from '../hooks/useAsync';
import useMovieQuery from '../hooks/useMovieQuery';
import { useUser } from '../context/UserData';
import { getProviders } from '../services/movieService';
import { LANGUAGE_GROUPS, sortMovies } from '../utils/movieHelpers';
import GenreFilter from '../components/GenreFilter';
import MovieGrid from '../components/MovieGrid';
import RegionSelect from '../components/RegionSelect';

export default function FreeMovies() {
  const { region } = useUser();
  const [type, setType] = useState('free');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [provider, setProvider] = useState('');
  const [sort, setSort] = useState('popular');
  const providers = useAsync((s) => getProviders(region, s), [region]);
  const q = useMovieQuery({ type, genre, language, provider, region });
  const shown = useMemo(() => sortMovies(q.results, sort), [q.results, sort]);

  return (
    <div className="container page">
      <h1>Free movies</h1>
      <p className="muted">Titles reported as free to watch. A service having a free plan or trial does not make a title free, so only titles flagged as free in the data appear here.</p>

      <div className="tabs" role="group" aria-label="Kind of free access">
        {[['free', 'Free'], ['ads', 'Free with ads']].map(([k, label]) => (
          <button key={k} type="button" className={`tab ${type === k ? 'on' : ''}`} aria-pressed={type === k} onClick={() => setType(k)}>{label}</button>
        ))}
      </div>

      <div className="filters panel">
        <div className="field"><label htmlFor="f-lang">Language</label>
          <select id="f-lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">Any language</option>
            {LANGUAGE_GROUPS.map(([g, langs]) => <optgroup key={g} label={g}>{langs.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</optgroup>)}
          </select></div>
        <div className="field"><label htmlFor="f-prov">Provider</label>
          <select id="f-prov" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="">Any provider</option>{(providers.data || []).slice(0, 60).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select></div>
        <div className="field"><label htmlFor="f-sort">Sort by</label>
          <select id="f-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="popular">Most popular</option><option value="rating">Highest rating</option>
          </select></div>
        <RegionSelect />
      </div>
      <GenreFilter selected={genre} onSelect={setGenre} />

      <p className="toolbar" role="status" aria-live="polite">{shown.length} movie{shown.length === 1 ? '' : 's'}{q.hasMore ? ' loaded so far' : ''}</p>
      <MovieGrid movies={shown} loading={q.loading} error={q.error} onRetry={q.retry}
        emptyTitle="No free movies found" emptyMessage="TMDB did not report any titles with this kind of free access for these filters and this country. Free listings change often, so check back later." />
      {q.hasMore && shown.length > 0 && <div className="center"><button type="button" className="btn" onClick={q.loadMore} disabled={q.loading}>Load more</button></div>}
    </div>
  );
}
