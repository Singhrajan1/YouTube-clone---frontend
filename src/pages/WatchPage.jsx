import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getVideoById, deleteVideo } from '../api/videoApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addToWatchHistory } from '../api/authApi';
import { toggleVideoLike, getVideoLikeCount, getVideoLikeStatus } from '../api/likeApi';
import { toggleSubscription } from '../api/subscriptionApi';
import { getUserChannelProfile } from '../api/authApi';
import { CommentsSection } from '../components/comments/CommentsSection';
import { PlaylistModal } from '../components/playlist/PlaylistModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatViews, formatDate, getInitials } from '../utils/formatters';
import { Skeleton } from '../components/ui/Skeleton';

export default function WatchPage() {
  const { videoId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Like state
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  // Subscribe state
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  // UI state
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const historyAdded = useRef(false);

  const loadVideo = useCallback(async () => {
    historyAdded.current = false;
    if (!videoId) return;
    const { data, error: err } = await getVideoById(videoId);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setVideo(data);

    getVideoLikeCount(videoId).then(({ data: ld }) => {
      if (ld) setLikeCount(ld.count ?? 0);
    });

    if (isAuthenticated && data?.owner?.username) {
      getVideoLikeStatus(videoId).then(({ data: ls }) => {
        if (ls) setLiked(ls.liked);
      });
      getUserChannelProfile(data.owner.username).then(({ data: ch }) => {
        if (ch) {
          setIsSubscribed(ch.isSubscribed);
          setSubscribersCount(ch.subscribersCount);
        }
      });
    }
  }, [videoId, isAuthenticated]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!ignore) await loadVideo();
    })();
    return () => { ignore = true; };
  }, [loadVideo]);

  // Add to watch history once per video load, after 5s of watching
  useEffect(() => {
    if (!isAuthenticated || !video || historyAdded.current) return;
    const timer = setTimeout(async () => {
      if (!historyAdded.current) {
        historyAdded.current = true;
        await addToWatchHistory(videoId);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [video, isAuthenticated, videoId]);

  const handleLike = async () => {
    if (!isAuthenticated) { addToast('Sign in to like videos', 'info'); return; }
    const prev = { liked, likeCount };
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    const { error } = await toggleVideoLike(videoId);
    if (error) {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
      addToast(error, 'error');
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) { addToast('Sign in to subscribe', 'info'); return; }
    const prev = { isSubscribed, subscribersCount };
    setIsSubscribed(!isSubscribed);
    setSubscribersCount((c) => isSubscribed ? c - 1 : c + 1);
    const { error } = await toggleSubscription(video.owner._id);
    if (error) {
      setIsSubscribed(prev.isSubscribed);
      setSubscribersCount(prev.subscribersCount);
      addToast(error, 'error');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await deleteVideo(videoId);
    setDeleting(false);
    if (error) { addToast(error, 'error'); setConfirmDelete(false); return; }
    addToast('Video deleted successfully', 'success');
    navigate('/');
  };

  const isOwner = isAuthenticated && user?._id === video?.owner?._id;

  if (loading) {
    return (
      <div className="watch-page">
        <div className="watch-player-wrapper">
          <Skeleton className="skeleton-video-player" />
        </div>
        <div className="watch-info">
          <Skeleton style={{ height: 24, marginBottom: 12 }} />
          <Skeleton style={{ height: 14, width: '50%', marginBottom: 8 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-banner">{error}</div>
        <Link to="/" className="btn btn-outline" style={{ marginTop: 16 }}>Go Home</Link>
      </div>
    );
  }

  if (!video) return null;

  const owner = video.owner || {};

  return (
    <div className="watch-page">
      {/* Video Player */}
      <div className="watch-player-section">
        <div className="watch-player-wrapper">
          <video
            key={videoId}
            className="video-player"
            controls
            src={video.videoFile}
            poster={video.thumbnail}
            id="main-video-player"
            aria-label={video.title}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Meta */}
        <div className="watch-meta">
          <h1 className="watch-title">{video.title}</h1>

          <div className="watch-actions-row">
            <div className="watch-stats">
              <span>{formatViews(video.views)} views</span>
              <span>·</span>
              <span>{formatDate(video.createdAt)}</span>
            </div>

            <div className="watch-action-btns">
              <button
                className={`btn btn-sm ${liked ? 'btn-primary' : 'btn-outline'}`}
                onClick={handleLike}
                id="like-video-btn"
                aria-pressed={liked}
                aria-label={liked ? 'Unlike video' : 'Like video'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                  <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
                <span>{likeCount}</span>
              </button>

              {isAuthenticated && (
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setShowPlaylistModal(true)}
                  id="save-to-playlist-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  Save
                </button>
              )}

              {isOwner && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => setConfirmDelete(true)}
                  id="delete-video-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Channel Info */}
          <div className="watch-channel-row">
            <Link to={`/channel/${owner.username}`} className="watch-channel-link" id="watch-channel-link">
              {owner.avatar ? (
                <img src={owner.avatar} alt={owner.fullname} className="avatar avatar-md" />
              ) : (
                <div className="avatar avatar-md avatar-placeholder">{getInitials(owner.fullname)}</div>
              )}
              <div>
                <p className="watch-channel-name">{owner.fullname}</p>
                <p className="watch-channel-username">@{owner.username} · {subscribersCount} subscribers</p>
              </div>
            </Link>

            {isAuthenticated && !isOwner && (
              <button
                className={`btn btn-sm ${isSubscribed ? 'btn-outline' : 'btn-primary'}`}
                onClick={handleSubscribe}
                id="subscribe-btn"
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          {/* Description */}
          <div className={`watch-description ${descExpanded ? 'expanded' : ''}`}>
            <p>{video.description}</p>
            {video.description && video.description.length > 150 && (
              <button className="btn-link show-more-btn" onClick={() => setDescExpanded(!descExpanded)}>
                {descExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>

        {/* Comments */}
        <CommentsSection entityType="video" entityId={videoId} />
      </div>

      {showPlaylistModal && (
        <PlaylistModal videoId={videoId} onClose={() => setShowPlaylistModal(false)} />
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Video"
        message="Are you sure you want to permanently delete this video? This action cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
