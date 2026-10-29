import { Check, Compass, Tv } from 'lucide-react';

export default function StreamingProviderCard({ provider, selected, active, onToggle, onExplore }) {
  return (
    <article className={`provider-card ${active ? 'active' : ''}`}>
      <div className="provider-head">
        {provider.logo
          ? <img src={provider.logo} alt="" className="provider-logo" loading="lazy" />
          : <span className="provider-logo provider-logo-fallback" aria-hidden="true"><Tv size={22} /></span>}
        <div>
          <h3>{provider.name}</h3>
        </div>
      </div>
      <div className="provider-actions">
        <button type="button" className={`btn btn-small ${selected ? 'btn-primary' : ''}`} aria-pressed={selected} onClick={onToggle}>
          {selected ? <Check size={14} aria-hidden="true" /> : null}
          {selected ? 'I use this' : 'Add to my services'}
        </button>
        <button type="button" className="btn btn-small" aria-pressed={active} onClick={onExplore}>
          <Compass size={14} aria-hidden="true" /> Explore movies
        </button>
      </div>
    </article>
  );
}
