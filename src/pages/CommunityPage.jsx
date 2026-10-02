import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAllPosts, createPost } from '../api/postApi';
import PostCard from '../components/post/PostCard';
import { PostCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { getInitials } from '../utils/formatters';

export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const addToast = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create post form
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    const { data, error: err } = await getAllPosts();
    setLoading(false);
    if (err) { setError(err); return; }
    setPosts(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!ignore) await fetchPosts();
    })();
    return () => { ignore = true; };
  }, [fetchPosts]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { addToast('Post content is required', 'error'); return; }

    const formData = new FormData();
    formData.append('content', content.trim());
    if (image) formData.append('image', image);

    setSubmitting(true);
    const { data, error: err } = await createPost(formData);
    setSubmitting(false);

    if (err) { addToast(err, 'error'); return; }

    // Backend returns newly created post
    const enriched = {
      ...data,
      owner: { _id: user._id, username: user.username, fullname: user.fullname, avatar: user.avatar },
    };
    setPosts((prev) => [enriched, ...prev]);
    setContent('');
    setImage(null);
    setImagePreview(null);
    addToast('Post published!', 'success');
  };

  return (
    <div className="page-container community-page">
      <h1 className="page-title">Community Feed</h1>

      {/* Create Post Form */}
      {isAuthenticated && (
        <form className="create-post-card" onSubmit={handleSubmit}>
          <div className="create-post-header">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullname} className="avatar avatar-sm" />
            ) : (
              <div className="avatar avatar-sm avatar-placeholder">{getInitials(user?.fullname)}</div>
            )}
            <span className="create-post-prompt">Share an update with your community</span>
          </div>

          <textarea
            className="input textarea post-input"
            placeholder="What's on your mind? (max 500 characters)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={3}
            required
            id="community-post-content"
          />

          {imagePreview && (
            <div className="post-image-preview-container">
              <img src={imagePreview} alt="Upload preview" className="post-image-preview" />
              <button type="button" className="btn btn-ghost btn-xs remove-img-btn" onClick={handleRemoveImage}>
                ✕ Remove
              </button>
            </div>
          )}

          <div className="create-post-footer">
            <label htmlFor="post-image-input" className="btn btn-ghost btn-sm upload-img-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Image</span>
              <input id="post-image-input" type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>

            <div className="create-post-submit-group">
              <span className="char-count">{content.length}/500</span>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting || !content.trim()}
                id="post-submit-btn"
              >
                {submitting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      )}

      {error && <div className="error-banner">{error}</div>}

      {/* Feed */}
      {loading ? (
        <div className="posts-feed">
          {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No community posts yet"
          description="Be the first to create a post and start a conversation!"
        />
      ) : (
        <div className="posts-feed">
          {posts.map((p) => (
            <PostCard
              key={p._id}
              post={p}
              currentUser={user}
              onUpdated={(updated) => setPosts((prev) => prev.map((x) => x._id === updated._id ? updated : x))}
              onDeleted={(id) => setPosts((prev) => prev.filter((x) => x._id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
