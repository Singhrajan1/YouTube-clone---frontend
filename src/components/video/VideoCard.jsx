import React from 'react';
import { Link } from 'react-router-dom';
import { formatDuration, formatViews, formatDate } from '../../utils/formatters';
import { getInitials } from '../../utils/formatters';

export const VideoCard = ({ video, onClick }) => {
  const owner = video.owner || {};

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(video);
    }
  };

  return (
    <Link
      to={`/watch/${video._id}`}
      className="video-card"
      onClick={handleClick}
      id={`video-card-${video._id}`}
      aria-label={`Watch ${video.title}`}
    >
      <div className="video-thumbnail-wrapper">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="video-thumbnail"
            loading="lazy"
          />
        ) : (
          <div className="video-thumbnail video-thumbnail-placeholder">
            <span>▶</span>
          </div>
        )}
        {video.duration !== undefined && (
          <span className="video-duration">{formatDuration(video.duration)}</span>
        )}
      </div>
      <div className="video-card-info">
        <div className="video-card-avatar">
          {owner.avatar ? (
            <img src={owner.avatar} alt={owner.fullname} className="avatar avatar-sm" loading="lazy" />
          ) : (
            <div className="avatar avatar-sm avatar-placeholder">{getInitials(owner.fullname)}</div>
          )}
        </div>
        <div className="video-card-meta">
          <h3 className="video-card-title" title={video.title}>{video.title}</h3>
          <p className="video-card-channel">{owner.fullname || owner.username}</p>
          <p className="video-card-stats">
            {formatViews(video.views)} views · {formatDate(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};
