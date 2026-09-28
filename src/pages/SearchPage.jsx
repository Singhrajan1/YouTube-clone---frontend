import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortType, setSortType] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchResults = useCallback(async (pg = 1) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await getAllVideos({ query, page: pg, limit: 12, sortBy, sortType });
    setLoading(false);
    if (err) { setError(err); return; }
    if (pg === 1) setVideos(data?.videos || []);
    else setVideos((prev) => [...prev, ...(data?.videos || [])]);
    setPagination({ hasNextPage: data?.hasNextPage, totalVideos: data?.totalVideos });
  }, [query, sortBy, sortType]);

  useEffect(() => {
    setPage(1);
    setVideos([]);
    fetchResults(1);
  }, [query, sortBy, sortType]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchResults(next);
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
          <select id="search-sort-select" className="select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSortType((p) => p === 'desc' ? 'asc' : 'desc'); setPage(1); }}>
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
