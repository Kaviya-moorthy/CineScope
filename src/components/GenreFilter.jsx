import { GENRES } from '../utils/movieHelpers';

export default function GenreFilter({ ids, selected, onSelect, label = 'Genres' }) {
  const genres = ids ? ids.map((id) => GENRES.find((g) => g.id === id)).filter(Boolean) : GENRES;
  return (
    <div className="chips" role="group" aria-label={label}>
      {genres.map((g) => {
        const on = String(selected) === String(g.id);
        return (
          <button key={g.id} type="button" className={`chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => onSelect(on ? '' : g.id)}>
            {g.name}
          </button>
        );
      })}
    </div>
  );
}
