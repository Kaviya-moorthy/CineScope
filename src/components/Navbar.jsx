import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useUser } from '../context/UserData';
import SearchBar from './SearchBar';
import RegionSelect from './RegionSelect';

const LINKS = [
  ['/', 'Home'], ['/explore', 'Explore'], ['/free-movies', 'Free Movies'],
  ['/platforms', 'Streaming Platforms'], ['/watchlist', 'Watchlist'], ['/favourites', 'Favourites'],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme, watchlist, favourites } = useUser();
  const close = () => setOpen(false);
  const count = { '/watchlist': watchlist.length, '/favourites': favourites.length };
  return (
    <header className="navbar">
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={close} aria-label="CineScope home">
          <span className="logo-mark" aria-hidden="true" />CineScope
        </Link>
        <nav id="site-nav" className={`nav ${open ? 'open' : ''}`} aria-label="Main">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={close} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {label}{count[to] > 0 && <span className="count"> {count[to]}</span>}
            </NavLink>
          ))}
          <div className="nav-search"><SearchBar onDone={close} /></div>
        </nav>
        <div className="nav-actions">
          <RegionSelect compact />
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-controls="site-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
