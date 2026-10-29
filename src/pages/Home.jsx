import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Info, Star } from 'lucide-react';
import useMovieQuery from '../hooks/useMovieQuery';
import { useUser } from '../context/UserData';
import { HOME_GENRE_IDS, formatRating, genreNames, languageName, recommend } from '../utils/movieHelpers';
import GenreFilter from '../components/GenreFilter';
import MovieGrid from '../components/MovieGrid';
import MovieRow from '../components/MovieRow';
import Section from '../components/Section';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

function Hero() {
  const q = useMovieQuery({ cat: 'trending' });
  const movie = q.results.find((m) => m.backdrop);
  if (q.error && !movie) return <section className="hero hero-plain"><div className="container"><ErrorState title="Could not load the featured movie" message={q.error.message} onRetry={q.retry} /></div></section>;
  if (!movie) return <section className="hero hero-plain"><LoadingState label="Loading featured movie…" /></section>;
  const genres = genreNames(movie.genreIds).slice(0, 3);
  return (
    <section className="hero" aria-label="Featured movie">
      <img className="hero-img" src={movie.backdrop} alt="" />
      <div className="hero-shade" />
      <div className="container hero-content">
        <p className="muted">Trending this week</p>
        <h1>{movie.title}</h1>
        <p className="hero-meta">
          {formatRating(movie.rating) && <span className="rating"><Star size={15} aria-hidden="true" /> {formatRating(movie.rating)}</span>}
          {movie.year && <span>{movie.year}</span>}
          {movie.language && <span>{languageName(movie.language)}</span>}
          {genres.length > 0 && <span>{genres.join(', ')}</span>}
        </p>
        {movie.overview && <p className="hero-overview">{movie.overview}</p>}
        <div className="hero-actions">
          <Link to="/explore" className="btn btn-primary"><Compass size={16} aria-hidden="true" /> Explore movies</Link>
          <Link to={`/movie/${movie.id}`} className="btn">View details</Link>
        </div>
      </div>
    </section>
  );
}

const LANG_ROWS = [['ta', 'Tamil'], ['te', 'Telugu'], ['hi', 'Hindi'], ['ml', 'Malayalam'], ['kn', 'Kannada'], ['en', 'English'], ['ko', 'Korean'], ['ja', 'Japanese']];

function RecList({ genres, favourites, wl }) {
  const q = useMovieQuery({ genre: genres.join('|'), cat: 'popular' });
  const recs = useMemo(() => recommend(q.results.filter((m) => m.poster), favourites, wl, 12), [q.results, favourites, wl]);
  return <MovieGrid movies={recs} loading={q.loading} error={q.error} onRetry={q.retry} emptyTitle="No recommendations yet" emptyMessage="Nothing new matched your favourite genres." />;
}

function Recommended() {
  const { favourites, watchlist } = useUser();
  const wl = useMemo(() => watchlist.map((e) => e.movie), [watchlist]);
  const topGenres = useMemo(() => {
    const w = new Map();
    favourites.forEach((m) => (m.genreIds || []).forEach((g) => w.set(g, (w.get(g) || 0) + 2)));
    wl.forEach((m) => (m.genreIds || []).forEach((g) => w.set(g, (w.get(g) || 0) + 1)));
    return [...w.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g);
  }, [favourites, wl]);
  return (
    <Section id="recs" title="Recommended for you">
      {topGenres.length
        ? <RecList genres={topGenres} favourites={favourites} wl={wl} />
        : <EmptyState title="Favourite a few movies first" message="Recommendations use the genres of your favourites and watchlist." />}
    </Section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { myProviders, region, recent } = useUser();
  return (
    <>
      <Hero />
      <div className="container">
        <MovieRow id="trending" title="Trending movies" filters={{ cat: 'trending' }} viewAll="/explore?cat=trending" />
        <MovieRow id="popular" title="Popular movies" filters={{ cat: 'popular' }} viewAll="/explore?cat=popular" />
        <MovieRow id="top" title="Top rated movies" filters={{ cat: 'top_rated' }} viewAll="/explore?cat=top_rated" />
        <MovieRow id="upcoming" title="Upcoming movies" filters={{ cat: 'upcoming' }} viewAll="/explore?cat=upcoming" empty="No upcoming releases were returned." />
        <MovieRow id="recent" title="Recently released" filters={{ cat: 'recent' }} viewAll="/explore?cat=recent" />

        <Section id="genres" title="Browse by genre">
          <GenreFilter ids={HOME_GENRE_IDS} selected="" onSelect={(id) => id && navigate(`/explore?genre=${id}`)} />
        </Section>

        {LANG_ROWS.map(([code, name]) => (
          <MovieRow key={code} id={`lang-${code}`} title={`Popular ${name} movies`} filters={{ language: code, cat: 'popular' }} viewAll={`/explore?lang=${code}&cat=popular`} />
        ))}

        <MovieRow id="free" title="Free to watch" filters={{ type: 'free', region }} viewAll="/free-movies" empty="No free titles were reported for this country right now." />
        <MovieRow id="ads" title="Free with ads" filters={{ type: 'ads', region }} viewAll="/free-movies" empty="No ad-supported titles were reported for this country right now." />

        {myProviders.length === 0 ? (
          <Section id="mine" title="Available on your platforms">
            <EmptyState icon={Info} title="Choose your streaming services" message="Pick the services you already use and matching subscription titles appear here."
              action={<Link to="/platforms" className="btn btn-primary">Choose services</Link>} />
          </Section>
        ) : (
          <MovieRow id="mine" title="Available on your platforms" filters={{ provider: myProviders.join('|'), type: 'flatrate', region }} />
        )}

        <Recommended />

        {recent.length > 0 && (
          <Section id="recent-views" title="Recently viewed"><MovieGrid movies={recent.slice(0, 6)} /></Section>
        )}
      </div>
    </>
  );
}
