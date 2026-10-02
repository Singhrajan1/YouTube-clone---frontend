import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllVideos } from '../api/videoApi';
import { VideoCard } from '../components/video/VideoCard';
import { VideoCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'views', label: 'Views' },
  { value: 'title', label: 'Title' },
  { value: 'duration', label: 'Duration' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortType = searchParams.get('sortType') || 'desc';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadInitialResults = async () => {
      if (!query.trim()) {
        setVideos([]);
        setPagination({});
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: err } = await getAllVideos({ query, page: 1, limit: 12, sortBy, sortType });
      if (!isMounted) return;
      setLoading(false);
      if (err) { setError(err); return; }
      setVideos(data?.videos || []);
      setPage(1);
      setPagination({ hasNextPage: data?.hasNextPage, totalVideos: data?.totalVideos });
    };

    loadInitialResults();
    return () => {
      isMounted = false;
    };
  }, [query, sortBy, sortType]);

  const handleLoadMore = async () => {
    const next = page + 1;
    setLoading(true);
    const { data, error: err } = await getAllVideos({ query, page: next, limit: 12, sortBy, sortType });
    setLoading(false);
    if (err) { setError(err); return; }
    setVideos((prev) => [...prev, ...(data?.videos || [])]);
    setPage(next);
    setPagination({ hasNextPage: data?.hasNextPage, totalVideos: data?.totalVideos });
  };

  const handleSortChange = (newSortBy) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('sortBy', newSortBy);
      return p;
    });
  };

  const handleSortTypeToggle = () => {
    const nextType = sortType === 'desc' ? 'asc' : 'desc';
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('sortType', nextType);
      return p;
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        {pagination.totalVideos !== undefined && (
          <span className="muted-text">{pagination.totalVideos} videos found</span>
        )}
        <div className="sort-controls">
          <select id="search-sort-select" className="select" value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={handleSortTypeToggle} aria-label={`Sort ${sortType === 'desc' ? 'ascending' : 'descending'}`}>
            {sortType === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {!query && (
        <EmptyState icon="🔍" title="Search for videos" description="Use the search bar above to find videos." />
      )}

      {error && <div className="error-banner">{error}</div>}

      {loading && videos.length === 0 ? (
        <div className="video-grid">
          {Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      ) : !loading && query && videos.length === 0 ? (
        <EmptyState
          icon="😕"
          title="No results found"
          description={`No videos match "${query}". Try a different keyword.`}
        />
      ) : (
        <>
          <div className="video-grid">
            {videos.map((v) => <VideoCard key={v._id} video={v} />)}
            {loading && Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={`sk-${i}`} />)}
          </div>
          {pagination.hasNextPage && !loading && (
            <div className="load-more-wrapper">
              <button className="btn btn-outline" onClick={handleLoadMore} id="search-load-more">Load More</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
