import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWatchHistory } from '../api/authApi';
import { VideoCard } from '../components/video/VideoCard';
import { VideoCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export default function HistoryPage() {
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    const { data, error: err } = await getWatchHistory();
    setLoading(false);
    if (err) { setError(err); return; }
    setHistory(Array.isArray(data) ? data : []);
  }, [isAuthenticated]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!ignore) await loadHistory();
    })();
    return () => { ignore = true; };
  }, [loadHistory]);

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <EmptyState
          icon="🔒"
          title="Sign in required"
          description="Sign in to view your watch history."
          action={<Link to="/login" className="btn btn-primary">Sign In</Link>}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Watch History</h1>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <div className="video-grid">
          {Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon="📺"
          title="Your watch history is empty"
          description="Videos you watch will appear here."
          action={<Link to="/" className="btn btn-primary">Browse Videos</Link>}
        />
      ) : (
        <div className="video-grid">
          {history.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  );
}
