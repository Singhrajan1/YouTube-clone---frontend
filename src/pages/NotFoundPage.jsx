import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';

export default function NotFoundPage() {
  return (
    <div className="page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <EmptyState
        icon="4️⃣0️⃣4️⃣"
        title="Page Not Found"
        description="The page you are looking for doesn't exist or has been moved."
        action={<Link to="/" className="btn btn-primary">Return Home</Link>}
      />
    </div>
  );
}
