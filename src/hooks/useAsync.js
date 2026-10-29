import { useEffect, useState } from 'react';

// Runs fn(signal) whenever deps change; outdated requests are aborted/ignored.
export default function useAsync(fn, deps) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const ac = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fn(ac.signal)
      .then((data) => { if (!ac.signal.aborted) setState({ loading: false, error: null, data }); })
      .catch((error) => { if (!ac.signal.aborted && error.name !== 'AbortError') setState({ loading: false, error, data: null }); });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);
  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
