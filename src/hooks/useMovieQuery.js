import { useEffect, useRef, useState } from 'react';
import { queryMovies } from '../services/movieService';

// Paged movie query with Load More. The filters object `f` is the single source of truth.
export default function useMovieQuery(f, { minResults = 0 } = {}) {
  const key = JSON.stringify(f);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ results: [], totalPages: 1, loading: true, error: null, notice: '' });
  const lastKey = useRef(key);

  useEffect(() => {
    if (lastKey.current !== key) {
      lastKey.current = key;
      if (page !== 1) { setPage(1); return undefined; }
    }
    const ac = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    queryMovies(f, page, ac.signal)
      .then((r) => {
        if (ac.signal.aborted) return;
        setState((s) => {
          const merged = page === 1 ? r.results : [...s.results, ...r.results];
          const unique = merged.filter((m, i) => merged.findIndex((x) => x.id === m.id) === i);
          return { results: unique, totalPages: r.totalPages, loading: false, error: null, notice: r.notice || '' };
        });
      })
      .catch((error) => {
        if (!ac.signal.aborted && error.name !== 'AbortError') setState((s) => ({ ...s, loading: false, error }));
      });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, page, attempt]);

  // Keep fetching pages until enough real results exist (e.g. after client-side filtering).
  useEffect(() => {
    if (minResults && !state.loading && !state.error && state.results.length < minResults && page < state.totalPages) {
      setPage((p) => p + 1);
    }
  }, [minResults, state.loading, state.error, state.results.length, state.totalPages, page]);

  return {
    ...state,
    page,
    hasMore: page < state.totalPages,
    loadMore: () => setPage((p) => p + 1),
    retry: () => setAttempt((n) => n + 1),
  };
}
