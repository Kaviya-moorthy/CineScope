import { useState } from 'react';
import useAsync from '../hooks/useAsync';
import useMovieQuery from '../hooks/useMovieQuery';
import { useUser } from '../context/UserData';
import { getProviders } from '../services/movieService';
import { ACCESS, sameId } from '../utils/movieHelpers';
import StreamingProviderCard from '../components/StreamingProviderCard';
import MovieGrid from '../components/MovieGrid';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import RegionSelect from '../components/RegionSelect';

function ProviderMovies({ provider, region }) {
  const [type, setType] = useState('');
  const q = useMovieQuery({ provider: String(provider.id), type, region });
  return (
    <section className="panel" aria-label={`Movies on ${provider.name}`}>
      <h2>Movies on {provider.name}</h2>
      <div className="chips" role="group" aria-label="Access type">
        {[['', 'All access types'], ...Object.entries(ACCESS).map(([k, v]) => [k, v.label])].map(([k, label]) => (
          <button key={k} type="button" className={`chip ${type === k ? 'on' : ''}`} aria-pressed={type === k} onClick={() => setType(k)}>{label}</button>
        ))}
      </div>
      <p className="muted small">A provider can offer a title in several ways. Subscription, rent, buy and free are shown separately, and this list may not be the provider’s full catalogue.</p>
      <MovieGrid movies={q.results} loading={q.loading} error={q.error} onRetry={q.retry} 
        emptyTitle="No titles reported" emptyMessage="The data source did not report matching titles for this provider and country." />
      {q.hasMore && q.results.length > 0 && <div className="center"><button type="button" className="btn" onClick={q.loadMore} disabled={q.loading}>Load more</button></div>}
    </section>
  );
}

export default function StreamingPlatforms() {
  const { region, myProviders, toggleProvider } = useUser();
  const [activeId, setActiveId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const providers = useAsync((s) => getProviders(region, s), [region]);
  const active = (providers.data || []).find((p) => sameId(p.id, activeId));

  return (
    <div className="container page">
      <h1>Streaming platforms</h1>
      <p className="muted">Mark the services you already use. CineScope never asks for passwords or payment details and does not connect to your accounts.</p>
      <RegionSelect />
      {providers.loading && <LoadingState label="Loading providers…" />}
      {providers.error && <ErrorState message={providers.error.message} onRetry={providers.retry} />}
      {providers.data && (
        <div className="provider-grid">
          {(showAll ? providers.data : providers.data.slice(0, 30)).map((p) => (
            <StreamingProviderCard key={p.id} provider={p} active={sameId(p.id, activeId)}
              selected={myProviders.some((id) => sameId(id, p.id))}
              onToggle={() => toggleProvider(p.id)} onExplore={() => setActiveId(sameId(p.id, activeId) ? null : p.id)} />
          ))}
        </div>
      )}
      {providers.data && providers.data.length > 30 && (
        <div className="center"><button type="button" className="btn btn-small" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show fewer' : `Show all ${providers.data.length} services`}</button></div>
      )}
      <p className="muted small">This list is what TMDB reports for the selected country. Services differ by country.</p>
      {active && <ProviderMovies key={`${active.id}-${region}`} provider={active} region={region} />}
    </div>
  );
}
