import MovieCard from './MovieCard';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

export default function MovieGrid({
  movies = [], loading = false, error = null, onRetry,
  emptyTitle = 'No movies found', emptyMessage = 'Try changing your filters.', emptyAction, renderExtra,
}) {
  if (loading && !movies.length) return <LoadingState label="Loading movies…" />;
  if (error && !movies.length) return <ErrorState title="Could not load movies" message={error.message} onRetry={onRetry} />;
  if (!movies.length) return <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  return (
    <>
      {error && <ErrorState title="Could not load more" message={error.message} onRetry={onRetry} />}
      <div className="grid">
        {movies.map((m) => <MovieCard key={m.id} movie={m} extra={renderExtra?.(m)} />)}
      </div>
    </>
  );
}
