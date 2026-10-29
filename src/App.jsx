import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { isConfigured } from './services/movieService';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SetupRequired from './components/SetupRequired';
import Home from './pages/Home';
import Explore from './pages/Explore';
import MovieDetails from './pages/MovieDetails';
import FreeMovies from './pages/FreeMovies';
import StreamingPlatforms from './pages/StreamingPlatforms';
import Watchlist from './pages/Watchlist';
import Favourites from './pages/Favourites';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main id="main">
        {!isConfigured ? <SetupRequired /> : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/movie/:movieId" element={<MovieDetails />} />
            <Route path="/free-movies" element={<FreeMovies />} />
            <Route path="/platforms" element={<StreamingPlatforms />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>
      <Footer />
    </>
  );
}
