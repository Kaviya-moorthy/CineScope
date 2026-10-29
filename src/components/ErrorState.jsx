import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <AlertTriangle size={32} aria-hidden="true" />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && <button type="button" className="btn" onClick={onRetry}>Try again</button>}
    </div>
  );
}
