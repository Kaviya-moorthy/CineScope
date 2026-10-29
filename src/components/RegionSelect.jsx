import { useId } from 'react';
import { Globe } from 'lucide-react';
import { useUser } from '../context/UserData';
import { REGIONS } from '../utils/movieHelpers';

export default function RegionSelect({ compact = false }) {
  const { region, setRegion } = useUser();
  const id = useId();
  return (
    <div className={`field field-inline ${compact ? 'region-compact' : ''}`}>
      <label htmlFor={id} className={compact ? 'sr-only' : ''}>{compact ? 'Streaming region' : 'Country'}</label>
      {compact && <Globe size={15} aria-hidden="true" />}
      <select id={id} value={region} onChange={(e) => setRegion(e.target.value)}>
        {REGIONS.map(([code, name]) => <option key={code} value={code}>{compact ? code : name}</option>)}
      </select>
    </div>
  );
}
