import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllVideos } from '../api/videoApi';
import { VideoCard } from '../components/video/VideoCard';
import { VideoCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'views', label: 'Views' },
  { value: 'title', label: 'Title' },
  { value: 'duration', label: 'Duration' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortType, setSortType] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchVideos = useCallback(async () => {
    const { data, error: err } = await getAllVideos({ page: 1, limit: 12, sortBy, sortType });
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setVideos(data?.videos || []);
    setPage(1);
    setPagination({
      totalPages: data?.totalPages,
      hasNextPage: data?.hasNextPage,
      currentPage: data?.currentPage,
    });
  }, [sortBy, sortType]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!ignore) await fetchVideos();
    })();
    return () => { ignore = true; };
  }, [fetchVideos]);

  const handleLoadMore = async () => {
    const next = page + 1;
    setLoading(true);
    const { data, error: err } = await getAllVideos({ page: next, limit: 12, sortBy, sortType });
    setLoading(false);
    if (err) { setError(err); return; }
    setVideos((prev) => [...prev, ...(data?.videos || [])]);
    setPage(next);
    setPagination({
      totalPages: data?.totalPages,
      hasNextPage: data?.hasNextPage,
      currentPage: data?.currentPage,
    });
  };

  const handleSortChange = (e) => {
    setLoading(true);
    setError(null);
    setSortBy(e.target.value);
  };

  const handleSortTypeToggle = () => {
    setLoading(true);
    setError(null);
    setSortType((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Home</h1>
        <div className="sort-controls">
          <label htmlFor="sort-select" className="sort-label">Sort by:</label>
          <select id="sort-select" className="select" value={sortBy} onChange={handleSortChange}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            className="btn btn-ghost btn-sm sort-direction-btn"
            onClick={handleSortTypeToggle}
            aria-label={`Sort ${sortType === 'desc' ? 'ascending' : 'descending'}`}
            title={sortType === 'desc' ? 'Newest first' : 'Oldest first'}
          >
            {sortType === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading && videos.length === 0 ? (
        <div className="video-grid">
          {Array.from({ length: 12 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      ) : !loading && videos.length === 0 ? (
        <EmptyState
          icon="📹"
          title="No videos yet"
          description="Be the first to upload a video!"
          action={isAuthenticated ? (
            <Link to="/upload" className="btn btn-primary">Upload a Video</Link>
          ) : (
            <Link to="/register" className="btn btn-primary">Create an Account</Link>
          )}
        />
      ) : (
        <>
          <div className="video-grid">
            {videos.map((v) => <VideoCard key={v._id} video={v} />)}
            {loading && Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={`sk-${i}`} />)}
          </div>
          {pagination.hasNextPage && !loading && (
            <div className="load-more-wrapper">
              <button className="btn btn-outline" onClick={handleLoadMore} id="load-more-btn">
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
