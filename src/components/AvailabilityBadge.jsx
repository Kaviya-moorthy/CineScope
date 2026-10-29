import { Gift, Megaphone, ShoppingBag, Ticket, Tv } from 'lucide-react';
import { ACCESS } from '../utils/movieHelpers';

const ICONS = { flatrate: Tv, free: Gift, ads: Megaphone, rent: Ticket, buy: ShoppingBag };

// Icon + text label, so meaning never depends on colour alone.
export default function AvailabilityBadge({ type }) {
  const Icon = ICONS[type];
  if (!Icon) return null;
  return (
    <span className={`badge badge-${type}`}>
      <Icon size={12} aria-hidden="true" />
      {ACCESS[type].label}
    </span>
  );
}
