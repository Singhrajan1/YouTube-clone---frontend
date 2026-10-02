import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { updatePost, deletePost } from '../../api/postApi';
import { togglePostLike, getPostLikeCount, getPostLikeStatus } from '../../api/likeApi';
import { formatDate, getInitials } from '../../utils/formatters';
import { CommentsSection } from '../comments/CommentsSection';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export default function PostCard({ post, currentUser, onUpdated, onDeleted }) {
  const addToast = useToast();

  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(post.image || null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const owner = post.owner || {};
  const isOwner = currentUser && owner._id === currentUser._id;

  useEffect(() => {
    getPostLikeCount(post._id).then(({ data }) => {
      if (data) setLikeCount(data.count ?? 0);
    });
    if (currentUser) {
      getPostLikeStatus(post._id).then(({ data }) => {
        if (data) setLiked(data.liked);
      });
    }
  }, [post._id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) { addToast('Sign in to like posts', 'info'); return; }
    const prev = { liked, likeCount };
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    const { error } = await togglePostLike(post._id);
    if (error) {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
      addToast(error, 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) { addToast('Post content cannot be empty', 'error'); return; }

    const formData = new FormData();
    formData.append('content', editContent.trim());
    if (editImage) formData.append('image', editImage);

    setSaving(true);
    const { data, error } = await updatePost(post._id, formData);
    setSaving(false);
    if (error) { addToast(error, 'error'); return; }
    setIsEditing(false);
    if (onUpdated) onUpdated(data);
    addToast('Post updated successfully', 'success');
  };

  const handleDelete = async () => {
    const { error } = await deletePost(post._id);
    if (error) { addToast(error, 'error'); return; }
    if (onDeleted) onDeleted(post._id);
    addToast('Post deleted', 'success');
  };

  return (
    <article className="post-card" id={`post-${post._id}`}>
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author-avatar">
          {owner.avatar ? (
            <img src={owner.avatar} alt={owner.fullname} className="avatar avatar-sm" />
          ) : (
            <div className="avatar avatar-sm avatar-placeholder">{getInitials(owner.fullname)}</div>
          )}
        </div>
        <div className="post-author-info">
          <span className="post-author-name">{owner.fullname || owner.username}</span>
          <span className="post-author-username">@{owner.username}</span>
          <span className="post-date">· {formatDate(post.createdAt)}</span>
        </div>
        {isOwner && !isEditing && (
          <div className="post-owner-actions">
            <button className="btn btn-ghost btn-xs" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="btn btn-ghost btn-xs icon-btn-danger" onClick={() => setConfirmDelete(true)}>Delete</button>
          </div>
        )}
      </div>

      {/* Post Content / Edit Form */}
      {isEditing ? (
        <form className="post-edit-form" onSubmit={handleSaveEdit}>
          <textarea
            className="input textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={500}
            rows={3}
            required
          />
          <div className="post-edit-image-upload">
            {editImagePreview && (
              <div className="edit-image-preview-wrapper">
                <img src={editImagePreview} alt="Preview" className="edit-image-preview" />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => { setEditImage(null); setEditImagePreview(null); }}
                >
                  Remove image
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) { setEditImage(f); setEditImagePreview(URL.createObjectURL(f)); }
              }}
            />
          </div>
          <div className="post-edit-actions">
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-xs" disabled={saving || !editContent.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="post-content">{post.content}</p>
          {post.image && (
            <div className="post-image-wrapper">
              <img
                src={typeof post.image === 'string' ? post.image : post.image?.url}
                alt="Post attachment"
                className="post-image"
                loading="lazy"
              />
            </div>
          )}
        </>
      )}

      {/* Post Actions */}
      <div className="post-actions">
        <button
          className={`icon-btn ${liked ? 'icon-btn-active' : ''}`}
          onClick={handleLike}
          aria-label="Like post"
          aria-pressed={liked}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
          <span>{likeCount}</span>
        </button>

        <button
          className="icon-btn"
          onClick={() => setShowComments(!showComments)}
          aria-label="Toggle comments"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>{showComments ? 'Hide comments' : 'Comments'}</span>
        </button>
      </div>

      {/* Post Comments */}
      {showComments && (
        <div className="post-comments-container">
          <CommentsSection entityType="post" entityId={post._id} />
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this community post?"
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </article>
  );
}
