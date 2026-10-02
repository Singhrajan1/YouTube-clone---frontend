import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserChannelProfile } from '../api/authApi';
import { getAllVideos } from '../api/videoApi';
import { getUserPosts } from '../api/postApi';
import { toggleSubscription } from '../api/subscriptionApi';
import { VideoCard } from '../components/video/VideoCard';
import { VideoCardSkeleton } from '../components/ui/Skeleton';
import { PostCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { formatViews, getInitials } from '../utils/formatters';
import PostCard from '../components/post/PostCard';

export default function ChannelPage() {
  const { username } = useParams();
  const { user, isAuthenticated } = useAuth();
  const addToast = useToast();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  const loadPosts = useCallback(async (channelId) => {
    if (!channelId) return;
    setPostsLoading(true);
    const { data: pd } = await getUserPosts(channelId);
    setPostsLoading(false);
    setPosts(Array.isArray(pd) ? pd : []);
  }, []);

  const loadChannel = useCallback(async () => {
    if (!username) return;
    const { data, error: err } = await getUserChannelProfile(username);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setChannel(data);
    setIsSubscribed(data.isSubscribed);
    setSubscribersCount(data.subscribersCount);

    // Load videos
    setVideosLoading(true);
    const { data: vd } = await getAllVideos({ userId: data._id, limit: 20 });
    setVideosLoading(false);
    setVideos(vd?.videos || []);

    // Load posts
    await loadPosts(data._id);
  }, [username, loadPosts]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!ignore) await loadChannel();
    })();
    return () => { ignore = true; };
  }, [loadChannel]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) { addToast('Sign in to subscribe', 'info'); return; }
    const prev = { isSubscribed, subscribersCount };
    setIsSubscribed(!isSubscribed);
    setSubscribersCount((c) => isSubscribed ? c - 1 : c + 1);
    const { error: err } = await toggleSubscription(channel._id);
    if (err) {
      setIsSubscribed(prev.isSubscribed);
      setSubscribersCount(prev.subscribersCount);
      addToast(err, 'error');
    }
  };

  const isOwnChannel = isAuthenticated && user?.username === username;

  if (loading) {
    return (
      <div className="page-container">
        <div className="channel-header-skeleton">
          <div className="skeleton" style={{ height: 200, borderRadius: 12, marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 16, padding: '0 24px' }}>
            <div className="skeleton" style={{ width: 90, height: 90, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 8, marginTop: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '25%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  if (!channel) return null;

  return (
    <div className="channel-page">
      {/* Cover Image */}
      <div className="channel-cover">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="Channel cover" className="channel-cover-img" />
        ) : (
          <div className="channel-cover-placeholder" />
        )}
      </div>

      {/* Channel Header */}
      <div className="channel-header">
        <div className="channel-avatar-wrapper">
          {channel.avatar ? (
            <img src={channel.avatar} alt={channel.fullname} className="channel-avatar" />
          ) : (
            <div className="channel-avatar avatar-placeholder">{getInitials(channel.fullname)}</div>
          )}
        </div>
        <div className="channel-info">
          <h1 className="channel-name">{channel.fullname}</h1>
          <p className="channel-username">@{channel.username}</p>
          <p className="channel-stats">
            <span>{formatViews(subscribersCount)} subscribers</span>
            <span>·</span>
            <span>{channel.channelsSubscribedToCount} subscribed</span>
            <span>·</span>
            <span>{videos.length} videos</span>
          </p>
        </div>
        <div className="channel-actions">
          {isOwnChannel ? (
            <Link to="/settings" className="btn btn-outline" id="edit-channel-btn">Edit Channel</Link>
          ) : (
            <button
              className={`btn ${isSubscribed ? 'btn-outline' : 'btn-primary'}`}
              onClick={handleSubscribe}
              id="channel-subscribe-btn"
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="channel-tabs">
        <button
          className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
          id="tab-videos"
        >
          Videos
        </button>
        <button
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
          id="tab-posts"
        >
          Community
        </button>
      </div>

      {/* Tab Content */}
      <div className="channel-content">
        {activeTab === 'videos' && (
          videosLoading ? (
            <div className="video-grid">
              {Array.from({ length: 6 }).map((_, i) => <VideoCardSkeleton key={i} />)}
            </div>
          ) : videos.length === 0 ? (
            <EmptyState icon="📹" title="No videos yet" description={`${channel.fullname} hasn't uploaded any videos.`} />
          ) : (
            <div className="video-grid">
              {videos.map((v) => <VideoCard key={v._id} video={v} />)}
            </div>
          )
        )}

        {activeTab === 'posts' && (
          postsLoading ? (
            <div className="posts-feed">
              {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState icon="📝" title="No posts yet" description={`${channel.fullname} hasn't posted anything.`} />
          ) : (
            <div className="posts-feed">
              {posts.map((p) => (
                <PostCard key={p._id} post={p} currentUser={user} onDeleted={(id) => setPosts((prev) => prev.filter((x) => x._id !== id))} onUpdated={(updated) => setPosts((prev) => prev.map((x) => x._id === updated._id ? updated : x))} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
