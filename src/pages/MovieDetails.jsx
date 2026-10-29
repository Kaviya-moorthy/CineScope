import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck, CheckCircle2, Clock, Heart, Languages, PlayCircle, Star } from 'lucide-react';
import useAsync from '../hooks/useAsync';
import { useUser } from '../context/UserData';
import { getMovieDetails, getSimilar } from '../services/movieService';
import { formatDate, formatRating, formatRuntime, genreNames, languageName } from '../utils/movieHelpers';
import { Poster } from '../components/MovieCard';
import MovieGrid from '../components/MovieGrid';
import WhereToWatch from '../components/WhereToWatch';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import Section from '../components/Section';

export default function MovieDetails() {
  const { movieId } = useParams();
  const { isFav, toggleFav, inWatchlist, toggleWatchlist, isWatched, toggleWatched, addRecent } = useUser();
  const movie = useAsync((s) => getMovieDetails(movieId, s), [movieId]);
  const similar = useAsync((s) => getSimilar(movieId, s), [movieId]);
  const m = movie.data;
  const [trailerOpen, setTrailerOpen] = useState(false);
  useEffect(() => { setTrailerOpen(false); }, [movieId]);

  useEffect(() => { if (m) addRecent(m); }, [m, addRecent]);
  useEffect(() => { document.title = m ? `${m.title} · CineScope` : 'CineScope'; }, [m]);

  if (movie.loading) return <div className="container page"><LoadingState label="Loading movie…" /></div>;
  if (movie.error) {
    const missing = movie.error.status === 404;
    return (
      <div className="container page">
        <ErrorState title={missing ? 'Movie not found' : 'Could not load this movie'} message={movie.error.message} onRetry={missing ? undefined : movie.retry} />
        <div className="center"><Link to="/explore" className="btn">Back to Explore</Link></div>
      </div>
    );
  }

  const rating = formatRating(m.rating);
  const runtime = formatRuntime(m.runtime);
  const date = formatDate(m.releaseDate);
  const genres = genreNames(m.genreIds);
  const saved = inWatchlist(m.id);
  const fav = isFav(m.id);

  return (
    <>
      <section className="details-hero">
        {m.backdrop && <img className="hero-img" src={m.backdrop} alt="" />}
        <div className="hero-shade" />
        <div className="container details-grid">
          <div className="details-poster"><Poster movie={m} large /></div>
          <div className="details-info">
            <h1>{m.title}</h1>
            {m.tagline && <p className="muted"><em>{m.tagline}</em></p>}
            <p className="hero-meta">
              {rating && <span className="rating"><Star size={15} aria-hidden="true" /> {rating}</span>}
              {date && <span>{date}</span>}
              {runtime && <span><Clock size={14} aria-hidden="true" /> {runtime}</span>}
              {m.language && <span><Languages size={14} aria-hidden="true" /> Original language: {languageName(m.language)}</span>}
            </p>
            {genres.length > 0 && <div className="chips">{genres.map((g) => <span key={g} className="chip static">{g}</span>)}</div>}
            {m.overview ? <p className="hero-overview">{m.overview}</p> : <p className="muted">No overview is available.</p>}
            <div className="hero-actions">
              <button type="button" className={`btn ${saved ? 'btn-primary' : ''}`} aria-pressed={saved} onClick={() => toggleWatchlist(m)}>
                {saved ? <BookmarkCheck size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}
                {saved ? 'In watchlist' : 'Add to watchlist'}
              </button>
              <button type="button" className={`btn ${fav ? 'btn-primary' : ''}`} aria-pressed={fav} onClick={() => toggleFav(m)}>
                <Heart size={16} fill={fav ? 'currentColor' : 'none'} aria-hidden="true" /> {fav ? 'In favourites' : 'Add to favourites'}
              </button>
              {m.trailerKey && (
                <button type="button" className="btn" aria-expanded={trailerOpen} onClick={() => setTrailerOpen(!trailerOpen)}>
                  <PlayCircle size={16} aria-hidden="true" /> {trailerOpen ? 'Hide trailer' : 'Watch trailer'}
                </button>
              )}
              {saved && (
                <button type="button" className="btn" aria-pressed={isWatched(m.id)} onClick={() => toggleWatched(m.id)}>
                  <CheckCircle2 size={16} aria-hidden="true" /> {isWatched(m.id) ? 'Watched' : 'Mark as watched'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container page">
        {trailerOpen && m.trailerKey && (
          <section className="panel" aria-label={`${m.title} trailer`}>
            <div className="video">
              <iframe src={`https://www.youtube-nocookie.com/embed/${m.trailerKey}?autoplay=1`} title={`${m.title} trailer`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
            </div>
          </section>
        )}
        <WhereToWatch movieId={m.id} />

        {(m.director || m.cast?.length > 0) && (
          <Section id="credits" title="Credits">
            {m.director && <p><strong>Director:</strong> {m.director}</p>}
            {m.cast?.length > 0 && (
              <ul className="cast">{m.cast.map((c) => <li key={c.id}><strong>{c.name}</strong>{c.character && <span className="muted"> as {c.character}</span>}</li>)}</ul>
            )}
          </Section>
        )}

        <Section id="similar" title="Similar movies">
          <MovieGrid movies={similar.data || []} loading={similar.loading} error={similar.error} onRetry={similar.retry} emptyTitle="No similar movies found" emptyMessage="" />
        </Section>
      </div>
    </>
  );
}
