import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  createVideoComment,
  getVideoComments,
  createPostComment,
  getPostComments,
  updateComment,
  deleteComment,
} from '../../api/commentApi';
import {
  toggleCommentLike,
  getCommentLikeCount,
  getCommentLikeStatus,
} from '../../api/likeApi';
import { formatDate, getInitials } from '../../utils/formatters';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';

const CommentItem = ({ comment, currentUser, onUpdated, onDeleted }) => {
  const addToast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const isOwner = currentUser && comment.owner?._id === currentUser._id;

  useEffect(() => {
    getCommentLikeCount(comment._id).then(({ data }) => {
      if (data) setLikeCount(data.count ?? 0);
    });
    if (currentUser) {
      getCommentLikeStatus(comment._id).then(({ data }) => {
        if (data) setLiked(data.liked);
      });
    }
  }, [comment._id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) { addToast('Sign in to like comments', 'info'); return; }
    const prev = { liked, likeCount };
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    const { error } = await toggleCommentLike(comment._id);
    if (error) {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
      addToast(error, 'error');
    }
  };

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    const { error } = await updateComment(comment._id, editContent.trim());
    setSaving(false);
    if (error) { addToast(error, 'error'); return; }
    setIsEditing(false);
    onUpdated({ ...comment, content: editContent.trim() });
    addToast('Comment updated', 'success');
  };

  const handleDelete = async () => {
    const { error } = await deleteComment(comment._id);
    if (error) { addToast(error, 'error'); return; }
    onDeleted(comment._id);
    addToast('Comment deleted', 'success');
  };

  const owner = comment.owner || {};

  return (
    <div className="comment-item" id={`comment-${comment._id}`}>
      <div className="comment-avatar">
        {owner.avatar ? (
          <img src={owner.avatar} alt={owner.username} className="avatar avatar-sm" loading="lazy" />
        ) : (
          <div className="avatar avatar-sm avatar-placeholder">{getInitials(owner.username)}</div>
        )}
      </div>
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">@{owner.username}</span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>

        {isEditing ? (
          <div className="comment-edit-form">
            <textarea
              className="comment-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
            />
            <div className="comment-edit-actions">
              <button className="btn btn-ghost btn-xs" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary btn-xs" onClick={handleSave} disabled={saving || !editContent.trim()}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-content">{comment.content}</p>
        )}

        <div className="comment-actions">
          <button
            className={`icon-btn ${liked ? 'icon-btn-active' : ''}`}
            onClick={handleLike}
            aria-label="Like comment"
            aria-pressed={liked}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            <span>{likeCount}</span>
          </button>

          {isOwner && !isEditing && (
            <>
              <button className="icon-btn" onClick={() => setIsEditing(true)} aria-label="Edit comment">Edit</button>
              <button className="icon-btn icon-btn-danger" onClick={() => setConfirmDelete(true)} aria-label="Delete comment">Delete</button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export const CommentsSection = ({ entityType, entityId }) => {
  const { user, isAuthenticated } = useAuth();
  const addToast = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadInitialComments = async () => {
      setLoading(true);
      const fetcher = entityType === 'video' ? getVideoComments : getPostComments;
      const { data, error } = await fetcher(entityId, { page: 1, limit: 10 });
      if (!isMounted) return;
      setLoading(false);
      if (error) {
        addToast(error, 'error');
        return;
      }
      const list = data?.comments || [];
      setComments(list);
      setPage(1);
      setHasMore(list.length === 10);
    };

    loadInitialComments();
    return () => {
      isMounted = false;
    };
  }, [entityType, entityId, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    const fn = entityType === 'video' ? createVideoComment : createPostComment;
    const { data, error } = await fn(entityId, newComment.trim());
    setSubmitting(false);
    if (error) { addToast(error, 'error'); return; }
    // Newly created comment doesn't have populated owner — stitch it in
    const enriched = { ...data, owner: { _id: user._id, username: user.username, avatar: user.avatar } };
    setComments((prev) => [enriched, ...prev]);
    setNewComment('');
    addToast('Comment posted', 'success');
  };

  const handleLoadMore = async () => {
    const next = page + 1;
    setLoading(true);
    const fetcher = entityType === 'video' ? getVideoComments : getPostComments;
    const { data, error } = await fetcher(entityId, { page: next, limit: 10 });
    setLoading(false);
    if (error) { addToast(error, 'error'); return; }
    const list = data?.comments || [];
    setComments((prev) => [...prev, ...list]);
    setPage(next);
    setHasMore(list.length === 10);
  };

  return (
    <section className="comments-section" aria-labelledby="comments-heading">
      <h3 id="comments-heading" className="section-heading">
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h3>

      {isAuthenticated ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullname} className="avatar avatar-sm" />
            ) : (
              <div className="avatar avatar-sm avatar-placeholder">{getInitials(user?.fullname)}</div>
            )}
          </div>
          <div className="comment-input-wrapper">
            <textarea
              id={`comment-input-${entityId}`}
              className="comment-textarea"
              placeholder="Add a comment…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              maxLength={500}
            />
            <div className="comment-form-actions">
              <span className="char-count">{newComment.length}/500</span>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting || !newComment.trim()}
                id="post-comment-btn"
              >
                {submitting ? 'Posting…' : 'Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="comments-login-prompt">
          <a href="/login" className="link">Sign in</a> to comment.
        </p>
      )}

      {loading && comments.length === 0 && (
        <div className="comments-loading">
          <div className="spinner" />
        </div>
      )}

      {!loading && comments.length === 0 && (
        <EmptyState icon="💬" title="No comments yet" description="Be the first to share your thoughts!" />
      )}

      <div className="comments-list">
        {comments.map((c) => (
          <CommentItem
            key={c._id}
            comment={c}
            currentUser={user}
            onUpdated={(updated) => setComments((prev) => prev.map((x) => x._id === updated._id ? updated : x))}
            onDeleted={(id) => setComments((prev) => prev.filter((x) => x._id !== id))}
          />
        ))}
      </div>

      {hasMore && (
        <button className="btn btn-ghost btn-sm load-more-btn" onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading…' : 'Load more comments'}
        </button>
      )}
    </section>
  );
};
