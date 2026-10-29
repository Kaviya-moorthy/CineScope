import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { sameId } from '../utils/movieHelpers';

const Ctx = createContext(null);
export const useUser = () => useContext(Ctx);

// Keep only what is needed to render a card, so saved items work offline.
const slim = (m) => ({
  id: m.id, title: m.title, year: m.year, releaseDate: m.releaseDate, rating: m.rating,
  poster: m.poster, backdrop: m.backdrop, language: m.language, genreIds: m.genreIds || [],
  overview: m.overview,
});
// Also drops any entries saved by an older build that used sample data.
const arr = (v) => (Array.isArray(v) ? v.filter((x) => x && x.id !== undefined && !String(x.id).startsWith('demo-')) : []);
const RECENT_LIMIT = 12;

export function UserProvider({ children }) {
  const [favRaw, setFav] = useLocalStorage('cinescope:favourites', []);
  const [wlRaw, setWl] = useLocalStorage('cinescope:watchlist', []);
  const [provRaw, setProviders] = useLocalStorage('cinescope:providers', []);
  const [recentRaw, setRecent] = useLocalStorage('cinescope:recent', []);
  const [theme, setTheme] = useLocalStorage('cinescope:theme', 'dark');
  const [regionRaw, setRegion] = useLocalStorage('cinescope:region', 'IN');

  const favourites = useMemo(() => arr(favRaw), [favRaw]);
  // Watchlist entry: { id, movie, watched, addedAt }
  const watchlist = useMemo(() => arr(wlRaw).filter((e) => e.movie), [wlRaw]);
  const myProviders = useMemo(() => (Array.isArray(provRaw) ? provRaw : []), [provRaw]);
  const recent = useMemo(() => arr(recentRaw), [recentRaw]);
  const region = typeof regionRaw === 'string' ? regionRaw : 'IN';
  const currentTheme = theme === 'light' ? 'light' : 'dark';

  useEffect(() => { document.documentElement.dataset.theme = currentTheme; }, [currentTheme]);

  const isFav = useCallback((id) => favourites.some((m) => sameId(m.id, id)), [favourites]);
  const toggleFav = useCallback((movie) => {
    setFav((prev) => {
      const list = arr(prev);
      return list.some((m) => sameId(m.id, movie.id))
        ? list.filter((m) => !sameId(m.id, movie.id))
        : [{ ...slim(movie), savedAt: Date.now() }, ...list];
    });
  }, [setFav]);

  const inWatchlist = useCallback((id) => watchlist.some((e) => sameId(e.id, id)), [watchlist]);
  const isWatched = useCallback((id) => watchlist.find((e) => sameId(e.id, id))?.watched || false, [watchlist]);
  const toggleWatchlist = useCallback((movie) => {
    setWl((prev) => {
      const list = arr(prev);
      return list.some((e) => sameId(e.id, movie.id))
        ? list.filter((e) => !sameId(e.id, movie.id))
        : [{ id: movie.id, movie: slim(movie), watched: false, addedAt: Date.now() }, ...list];
    });
  }, [setWl]);
  const toggleWatched = useCallback((id) => {
    setWl((prev) => arr(prev).map((e) => (sameId(e.id, id) ? { ...e, watched: !e.watched } : e)));
  }, [setWl]);

  const toggleProvider = useCallback((id) => {
    setProviders((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      return list.some((p) => sameId(p, id)) ? list.filter((p) => !sameId(p, id)) : [...list, id];
    });
  }, [setProviders]);

  const addRecent = useCallback((movie) => {
    setRecent((prev) => [slim(movie), ...arr(prev).filter((m) => !sameId(m.id, movie.id))].slice(0, RECENT_LIMIT));
  }, [setRecent]);

  const value = {
    favourites, isFav, toggleFav,
    watchlist, inWatchlist, isWatched, toggleWatchlist, toggleWatched,
    myProviders, toggleProvider,
    recent, addRecent,
    theme: currentTheme, toggleTheme: () => setTheme(currentTheme === 'dark' ? 'light' : 'dark'),
    region, setRegion,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
