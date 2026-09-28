import React from 'react';

export const Skeleton = ({ className = '', style = {} }) => (
  <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
);

export const VideoCardSkeleton = () => (
  <div className="video-card video-card-skeleton" aria-hidden="true">
    <Skeleton className="skeleton-thumbnail" />
    <div className="video-card-info">
      <Skeleton className="skeleton-avatar" style={{ borderRadius: '50%', width: 36, height: 36, flexShrink: 0 }} />
      <div className="video-card-meta" style={{ flex: 1 }}>
        <Skeleton className="skeleton-line" style={{ height: 14, marginBottom: 6 }} />
        <Skeleton className="skeleton-line skeleton-line-short" style={{ height: 12, width: '60%' }} />
      </div>
    </div>
  </div>
);

export const PostCardSkeleton = () => (
  <div className="post-card" aria-hidden="true">
    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
      <Skeleton style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Skeleton style={{ height: 12, marginBottom: 6 }} />
        <Skeleton style={{ height: 10, width: '40%' }} />
      </div>
    </div>
    <Skeleton style={{ height: 14, marginBottom: 6 }} />
    <Skeleton style={{ height: 14, marginBottom: 6, width: '80%' }} />
  </div>
);
