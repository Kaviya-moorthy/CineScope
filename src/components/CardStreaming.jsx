import { useEffect, useState } from 'react';
import useInView from '../hooks/useInView';
import { useUser } from '../context/UserData';
import { getAvailability } from '../services/movieService';
import { ACCESS_ORDER } from '../utils/movieHelpers';
import AvailabilityBadge from './AvailabilityBadge';

// Real per-movie availability for the selected region, fetched when the card scrolls into view.
export default function CardStreaming({ movieId }) {
  const { region } = useUser();
  const [ref, seen] = useInView();
  const [state, setState] = useState({ status: 'idle', data: null });

  useEffect(() => {
    if (!seen) return undefined;
    const ac = new AbortController();
    setState({ status: 'loading', data: null });
    getAvailability(movieId, region, ac.signal)
      .then((data) => { if (!ac.signal.aborted) setState({ status: 'done', data }); })
      .catch((e) => { if (!ac.signal.aborted && e.name !== 'AbortError') setState({ status: 'error', data: null }); });
    return () => ac.abort();
  }, [seen, movieId, region]);

  const { status, data } = state;
  const types = data ? ACCESS_ORDER.filter((t) => data.groups[t]) : [];
  const first = types.length ? data.groups[types[0]] : [];
  return (
    <div className="card-stream" ref={ref} aria-live="polite">
      {status === 'loading' && <span className="muted small">Checking where to watch…</span>}
      {status === 'error' && <span className="muted small">Streaming info could not be loaded</span>}
      {status === 'done' && !data && <span className="muted small">Streaming availability not available</span>}
      {status === 'done' && data && (
        <>
          <div className="badges">{types.slice(0, 3).map((t) => <AvailabilityBadge key={t} type={t} />)}</div>
          <span className="muted small">
            {first.slice(0, 2).map((p) => p.name).join(', ')}{first.length > 2 ? ` +${first.length - 2}` : ''}
          </span>
        </>
      )}
    </div>
  );
}
