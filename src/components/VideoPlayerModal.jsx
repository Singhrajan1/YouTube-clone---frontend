import { useState, useEffect } from 'react';
import { XIcon, HeartIcon, MessageSquareIcon } from './Icons';
import api from '../api/axios';

export const VideoPlayerModal = ({ video, user, onClose }) => {
  const [likesCount, setLikesCount] = useState(video?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  useEffect(() => {
    if (!video?._id) return;

    // Fetch Likes count
    api.get(`/likes/count/video/${video._id}`)
      .then(res => setLikesCount(res.data?.data?.likesCount || 0))
      .catch(() => {});

    // Fetch Like status if user is logged in
    if (user) {
      api.get(`/likes/status/video/${video._id}`)
        .then(res => setIsLiked(res.data?.data?.isLiked || false))
        .catch(() => {});

      if (video.owner?.username) {
        api.get(`/users/c/${video.owner.username}`)
          .then(res => setIsSubscribed(res.data?.data?.isSubscribed || false))
          .catch(() => {});
      }
    }

    // Fetch Comments
    api.get(`/comments/video/${video._id}`)
      .then(res => {
        const commentData = res.data?.data;
        if (Array.isArray(commentData)) setComments(commentData);
        else if (commentData?.docs) setComments(commentData.docs);
      })
      .catch(() => {});
  }, [video, user]);

  if (!video) return null;

  const handleToggleLike = async () => {
    if (!user) {
      alert('Please log in to like videos');
      return;
    }
    try {
      await api.post(`/likes/toggle/video/${video._id}`);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!user) {
      alert('Please log in to subscribe to channels');
      return;
    }
    if (!video.owner?._id) {
      alert('Cannot subscribe to dummy or missing channel data.');
      return;
    }
    try {
      await api.post(`/subscriptions/toggle/${video.owner._id}`);
      setIsSubscribed(!isSubscribed);
    } catch (err) {
      console.error('Subscription toggle failed:', err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to post comments');
      return;
    }
    if (!newComment.trim()) return;

    setLoadingComment(true);
    try {
      const res = await api.post(`/comments/video/${video._id}`, { content: newComment.trim() });
      if (res.data?.data) {
        setComments(prev => [res.data.data, ...prev]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Comment failed:', err);
    } finally {
      setLoadingComment(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card player-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ position: 'relative' }}>
          <button 
            className="close-btn" 
            onClick={onClose}
            style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(0,0,0,0.6)' }}
          >
            <XIcon />
          </button>
          
          <div className="player-container">
            <video 
              controls 
              autoPlay 
              src={video.videoFile} 
              poster={video.thumbnail} 
              className="video-player-element"
            />
          </div>
        </div>

        <div className="player-details">
          <h2 className="player-title">{video.title}</h2>

          <div className="player-bar">
            <div className="creator-info">
              <img 
                src={video.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
                alt={video.owner?.username} 
                className="channel-avatar" 
              />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  {video.owner?.fullname || video.owner?.username || 'Creator'}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  @{video.owner?.username || 'creator'}
                </p>
              </div>
              
              <button 
                className={`btn btn-sm ${isSubscribed ? 'btn-secondary' : 'btn-primary'}`}
                style={{ marginLeft: '1rem' }}
                onClick={handleToggleSubscribe}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            <div className="action-buttons">
              <button 
                className={`btn btn-sm ${isLiked ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleToggleLike}
              >
                <HeartIcon size={16} filled={isLiked} />
                <span>{likesCount}</span>
              </button>
            </div>
          </div>

          <div className="video-desc-box">
            <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>Description</p>
            <p>{video.description || 'No description provided.'}</p>
          </div>

          <div className="comments-section">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquareIcon size={18} />
              <span>Comments ({comments.length})</span>
            </h3>

            {user ? (
              <form onSubmit={handlePostComment} className="comment-input-box">
                <img src={user.avatar} alt="Me" className="channel-avatar" style={{ width: 32, height: 32 }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={loadingComment}>
                  {loadingComment ? 'Posting...' : 'Comment'}
                </button>
              </form>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Please sign in to leave a comment.
              </p>
            )}

            <div className="comment-list">
              {comments.map((comment, index) => (
                <div key={comment._id || index} className="comment-item">
                  <img 
                    src={comment.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
                    alt="avatar" 
                    className="channel-avatar" 
                    style={{ width: 32, height: 32 }}
                  />
                  <div className="comment-content">
                    <p className="comment-author">@{comment.owner?.username || 'user'}</p>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontStyle: 'italic' }}>
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
