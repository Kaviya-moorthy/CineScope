import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState title="Page not found" message="That address does not match any page in CineScope." action={<Link to="/" className="btn btn-primary">Go home</Link>} />
    </div>
  );
}
