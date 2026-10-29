import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useUser } from '../context/UserData';
import MovieGrid from '../components/MovieGrid';
import EmptyState from '../components/EmptyState';

const cmp = {
  saved: (a, b) => (b.savedAt || 0) - (a.savedAt || 0),
  title: (a, b) => a.title.localeCompare(b.title),
  rating: (a, b) => (b.rating || 0) - (a.rating || 0),
  year: (a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''),
};

export default function Favourites() {
  const { favourites } = useUser();
  const [sort, setSort] = useState('saved');
  const shown = useMemo(() => [...favourites].sort(cmp[sort]), [favourites, sort]);
  return (
    <div className="container page">
      <h1>Favourites</h1>
      {favourites.length === 0 ? (
        <EmptyState icon={Heart} title="No favourites yet" message="Tap the heart on any movie card to save it here."
          action={<Link to="/explore" className="btn btn-primary">Browse movies</Link>} />
      ) : (
        <>
          <div className="toolbar">
            <p role="status">{favourites.length} favourite{favourites.length === 1 ? '' : 's'}</p>
            <div className="field field-inline"><label htmlFor="fav-sort">Sort by</label>
              <select id="fav-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="saved">Recently saved</option><option value="title">Title</option><option value="rating">Rating</option><option value="year">Release date</option>
              </select></div>
          </div>
          <MovieGrid movies={shown} />
        </>
      )}
    </div>
  );
}
