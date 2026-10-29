import { LANGUAGE_GROUPS } from '../utils/movieHelpers';

export default function LanguageFilter({ selected, onSelect }) {
  return (
    <div className="lang-groups">
      {LANGUAGE_GROUPS.map(([group, langs]) => (
        <div key={group} role="group" aria-label={group}>
          <p className="muted small lang-label">{group} (original language)</p>
          <div className="chips tight">
            {langs.map(([code, name]) => {
              const on = selected === code;
              return <button key={code} type="button" className={`chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => onSelect(on ? '' : code)}>{name}</button>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
