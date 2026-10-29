import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useUser } from '../context/UserData';
import { formatRating, languageName } from '../utils/movieHelpers';
import CardStreaming from './CardStreaming';

const FALLBACK = '/images/no-poster.svg';

export function Poster({ movie, large = false, className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = (large ? movie.posterLarge : null) || movie.poster;
  const missing = !src || failed;
  return (
    <img
      className={`poster ${missing ? 'poster-missing' : ''} ${className}`}
      src={missing ? FALLBACK : src}
      alt={missing ? `Poster not available for ${movie.title}` : `Poster for ${movie.title}`}
      width="500" height="750"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export default function MovieCard({ movie, extra, showStreaming = true }) {
  const { isFav, toggleFav } = useUser();
  const fav = isFav(movie.id);
  const rating = formatRating(movie.rating);
  const lang = languageName(movie.language);
  return (
    <article className="card">
      <Link to={`/movie/${movie.id}`} className="card-poster" aria-label={`View details for ${movie.title}`}>
        <Poster movie={movie} />
      </Link>
      <button
        type="button"
        className={`icon-btn card-fav ${fav ? 'on' : ''}`}
        aria-pressed={fav}
        aria-label={fav ? `Remove ${movie.title} from favourites` : `Add ${movie.title} to favourites`}
        onClick={() => toggleFav(movie)}
      >
        <Heart size={18} fill={fav ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
      <div className="card-body">
        <h3 className="card-title"><Link to={`/movie/${movie.id}`}>{movie.title}</Link></h3>
        <p className="card-meta">
          <span>{movie.year || 'TBA'}{lang ? ` · ${lang}` : ''}</span>
          <span className="rating"><Star size={13} aria-hidden="true" /> {rating || 'NR'}</span>
        </p>
        {movie.reason && <p className="card-reason">{movie.reason}</p>}
        {showStreaming && <CardStreaming movieId={movie.id} />}
        {extra}
      </div>
    </article>
  );
}
