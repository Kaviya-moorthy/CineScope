import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export default function SearchBar({ onDone }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const id = useId();
  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/explore?q=${encodeURIComponent(term)}` : '/explore');
    onDone?.();
  };
  return (
    <form className="searchbar" role="search" onSubmit={submit}>
      <label htmlFor={id} className="sr-only">Search movies by title</label>
      <Search size={16} aria-hidden="true" />
      <input id={id} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies" />
      {q && (
        <button type="button" className="icon-btn" aria-label="Clear search" onClick={() => setQ('')}><X size={16} aria-hidden="true" /></button>
      )}
    </form>
  );
}
