import { Link } from 'react-router-dom';
import useMovieQuery from '../hooks/useMovieQuery';
import Carousel from './Carousel';
import MovieCard from './MovieCard';
import Section from './Section';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

// A titled horizontal row of real movies. Titles without a poster are left out of curated rows.
export default function MovieRow({ id, title, filters, viewAll, transform, empty = 'No movies were returned for this row.' }) {
  const q = useMovieQuery(filters);
  const movies = (transform ? transform(q.results) : q.results).filter((m) => m.poster).slice(0, 15);
  return (
    <Section id={id} title={title} action={viewAll && <Link to={viewAll} className="btn btn-small">View all</Link>}>
      {q.loading && !movies.length && <LoadingState label={`Loading ${title.toLowerCase()}…`} />}
      {q.error && !movies.length && <ErrorState title={`Could not load ${title.toLowerCase()}`} message={q.error.message} onRetry={q.retry} />}
      {!q.loading && !q.error && !movies.length && <p className="muted">{empty}</p>}
      {movies.length > 0 && (
        <Carousel label={title}>
          {movies.map((m) => <div className="carousel-item" key={m.id}><MovieCard movie={m} /></div>)}
        </Carousel>
      )}
    </Section>
  );
}
