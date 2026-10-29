import { Film } from 'lucide-react';

export default function EmptyState({ icon: Icon = Film, title, message, action }) {
  return (
    <div className="state">
      <Icon size={36} aria-hidden="true" />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
