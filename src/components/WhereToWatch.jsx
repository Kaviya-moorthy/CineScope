import { ExternalLink } from 'lucide-react';
import { Tv } from 'lucide-react';
import useAsync from '../hooks/useAsync';
import { useUser } from '../context/UserData';
import { getAvailability } from '../services/movieService';
import { ACCESS, ACCESS_ORDER, REGIONS, sameId } from '../utils/movieHelpers';
import AvailabilityBadge from './AvailabilityBadge';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import RegionSelect from './RegionSelect';

export default function WhereToWatch({ movieId }) {
  const { region, myProviders } = useUser();
  const { loading, error, data, retry } = useAsync((s) => getAvailability(movieId, region, s), [movieId, region]);
  const regionName = REGIONS.find(([c]) => c === region)?.[1] || region;

  return (
    <section className="panel" aria-labelledby="wtw-title">
      <div className="panel-head">
        <h2 id="wtw-title">Where to watch</h2>
        <RegionSelect />
      </div>

      {loading && <LoadingState label="Checking availability…" />}
      {error && <ErrorState title="Could not load availability" message={error.message} onRetry={retry} />}

      {!loading && !error && !data && (
        <p className="muted">
          <strong>Streaming availability not available</strong> for {regionName}. TMDB reported no subscription, free, rent or buy options for this title in that country.
        </p>
      )}

      {!loading && !error && data && (
        <>
          {ACCESS_ORDER.filter((t) => data.groups[t]).map((type) => (
            <div key={type} className="wtw-group">
              <h3><AvailabilityBadge type={type} /> <span className="muted small">{ACCESS[type].help}</span></h3>
              <ul className="wtw-list">
                {data.groups[type].map((p) => {
                  const mine = myProviders.some((id) => sameId(id, p.id));
                  return (
                    <li key={`${type}-${p.id}`} className="wtw-item">
                      {p.logo ? <img src={p.logo} alt="" className="provider-logo sm" loading="lazy" /> : <span className="provider-logo sm provider-logo-fallback" aria-hidden="true"><Tv size={16} /></span>}
                      <span>{p.name}</span>
                      {mine && <span className="tag">Your service</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {data.link && (
            <a className="btn" href={data.link} target="_blank" rel="noopener noreferrer">
              Open the {regionName} watch page <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </>
      )}

      <ul className="fineprint">
        <li>Availability changes often and differs by country. Confirm on the service before you subscribe, rent or buy.</li>
        <li>Prices are not provided by the data source, so none are shown. Check the service for current pricing.</li>
        <li>Subscription titles need an active plan. Rent and buy options cost extra, even on a service you subscribe to.</li>
        <li>Audio and subtitle languages are not part of this data. Check the service for those.</li>
        <li>TMDB does not supply direct links to each service, so only its regional watch page is linked. Availability data is provided by JustWatch.</li>
      </ul>
    </section>
  );
}
