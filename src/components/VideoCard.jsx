export const VideoCard = ({ video, onClick }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return '03:45';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const formatViews = (views) => {
    if (!views && views !== 0) return '1.2K views';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  return (
    <div className="video-card" onClick={() => onClick(video)}>
      <div className="thumbnail-box">
        <img 
          src={video.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'} 
          alt={video.title} 
          className="thumbnail-img"
        />
        <span className="duration-badge">{formatDuration(video.duration)}</span>
      </div>

      <div className="video-info">
        <img 
          src={video.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
          alt={video.owner?.username || 'Creator'} 
          className="channel-avatar"
        />
        <div className="meta-details">
          <h3 className="video-card-title">{video.title}</h3>
          <p className="channel-name">{video.owner?.fullname || video.owner?.username || 'Unknown Creator'}</p>
          <p className="video-submeta">
            {formatViews(video.views)} • {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Recently'}
          </p>
        </div>
      </div>
    </div>
  );
};
