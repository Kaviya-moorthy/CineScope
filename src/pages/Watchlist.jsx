import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Check, Trash2, Undo2 } from 'lucide-react';
import { useUser } from '../context/UserData';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';

const cmp = {
  added: (a, b) => b.addedAt - a.addedAt,
  title: (a, b) => a.movie.title.localeCompare(b.movie.title),
  rating: (a, b) => (b.movie.rating || 0) - (a.movie.rating || 0),
  year: (a, b) => (b.movie.releaseDate || '').localeCompare(a.movie.releaseDate || ''),
};

export default function Watchlist() {
  const { watchlist, toggleWatchlist, toggleWatched } = useUser();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('added');
  const shown = useMemo(
    () => watchlist.filter((e) => filter === 'all' || (filter === 'watched') === Boolean(e.watched)).sort(cmp[sort]),
    [watchlist, filter, sort],
  );
  const watchedCount = watchlist.filter((e) => e.watched).length;

  return (
    <div className="container page">
      <h1>Watchlist</h1>
      {watchlist.length === 0 ? (
        <EmptyState icon={Bookmark} title="Your watchlist is empty" message="Open any movie and choose “Add to watchlist” to keep it here."
          action={<Link to="/explore" className="btn btn-primary">Find something to watch</Link>} />
      ) : (
        <>
          <div className="toolbar">
            <p role="status">{watchlist.length} saved, {watchedCount} watched</p>
            <div className="toolbar-actions">
              <div className="field field-inline"><label htmlFor="wl-filter">Show</label>
                <select id="wl-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All</option><option value="unwatched">Unwatched</option><option value="watched">Watched</option>
                </select></div>
              <div className="field field-inline"><label htmlFor="wl-sort">Sort by</label>
                <select id="wl-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="added">Recently added</option><option value="title">Title</option><option value="rating">Rating</option><option value="year">Release date</option>
                </select></div>
            </div>
          </div>
          {shown.length === 0 ? <EmptyState title="Nothing in this view" message="Change the filter to see other saved movies." /> : (
            <div className="grid">
              {shown.map((e) => (
                <MovieCard key={e.id} movie={e.movie} extra={
                  <div className="card-actions">
                    <button type="button" className="btn btn-small" aria-pressed={Boolean(e.watched)} onClick={() => toggleWatched(e.id)}>
                      {e.watched ? <Undo2 size={14} aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}
                      {e.watched ? 'Mark unwatched' : 'Mark watched'}
                    </button>
                    <button type="button" className="btn btn-small" onClick={() => toggleWatchlist(e.movie)} aria-label={`Remove ${e.movie.title} from watchlist`}>
                      <Trash2 size={14} aria-hidden="true" /> Remove
                    </button>
                  </div>
                } />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
