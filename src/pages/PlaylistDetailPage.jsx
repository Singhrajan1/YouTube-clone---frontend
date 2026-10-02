import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getPlaylistById, updatePlaylist, deletePlaylist, removeVideoFromPlaylist } from '../api/playlistApi';
import { VideoCard } from '../components/video/VideoCard';
import { VideoCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removingVideoId, setRemovingVideoId] = useState(null);

  const loadPlaylist = useCallback(async () => {
    if (!playlistId) return;
    const { data, error: err } = await getPlaylistById(playlistId);
    setLoading(false);
    if (err) { setError(err); return; }
    setPlaylist(data);
    setName(data?.name || '');
    setDescription(data?.description || '');
  }, [playlistId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!ignore) await loadPlaylist();
    })();
    return () => { ignore = true; };
  }, [loadPlaylist]);

  const isOwner = isAuthenticated && user && playlist && (playlist.owner?._id === user._id || playlist.owner === user._id);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const { error: err } = await updatePlaylist(playlistId, { name: name.trim(), description: description.trim() });
    setSaving(false);
    if (err) { addToast(err, 'error'); return; }
    setPlaylist((prev) => ({ ...prev, name: name.trim(), description: description.trim() }));
    setIsEditing(false);
    addToast('Playlist updated', 'success');
  };

  const handleDeletePlaylist = async () => {
    const { error: err } = await deletePlaylist(playlistId);
    if (err) { addToast(err, 'error'); setConfirmDelete(false); return; }
    addToast('Playlist deleted', 'success');
    navigate('/playlists');
  };

  const handleRemoveVideo = async (videoId) => {
    setRemovingVideoId(videoId);
    const { error: err } = await removeVideoFromPlaylist(playlistId, videoId);
    setRemovingVideoId(null);
    if (err) { addToast(err, 'error'); return; }
    setPlaylist((prev) => ({
      ...prev,
      videos: prev.videos.filter((v) => (typeof v === 'string' ? v : v._id) !== videoId),
    }));
    addToast('Video removed from playlist', 'success');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: 120, borderRadius: 12, marginBottom: 24 }} />
        <div className="video-grid">
          {Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-banner">{error}</div>
        <Link to="/playlists" className="btn btn-outline" style={{ marginTop: 16 }}>Back to Playlists</Link>
      </div>
    );
  }

  if (!playlist) return null;

  const videos = playlist.videos || [];

  return (
    <div className="page-container">
      {/* Playlist Header */}
      <div className="playlist-detail-header">
        {isEditing ? (
          <form className="playlist-edit-form" onSubmit={handleUpdate}>
            <div className="form-group">
              <label htmlFor="pl-edit-name" className="form-label">Title</label>
              <input
                id="pl-edit-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="pl-edit-desc" className="form-label">Description</label>
              <textarea
                id="pl-edit-desc"
                className="input textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="playlist-edit-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving || !name.trim()}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="playlist-title-row">
              <h1 className="page-title">{playlist.name}</h1>
              {isOwner && (
                <div className="playlist-header-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>Delete</button>
                </div>
              )}
            </div>
            <p className="playlist-desc-text">{playlist.description || 'No description provided.'}</p>
            <p className="muted-text">{videos.length} videos</p>
          </div>
        )}
      </div>

      {/* Videos List */}
      {videos.length === 0 ? (
        <EmptyState
          icon="📹"
          title="No videos in this playlist"
          description="Browse videos and click 'Save' on any video page to add it here."
          action={<Link to="/" className="btn btn-primary">Discover Videos</Link>}
        />
      ) : (
        <div className="playlist-videos-list">
          {videos.map((video) => {
            const v = typeof video === 'string' ? { _id: video, title: 'Video' } : video;
            return (
              <div key={v._id} className="playlist-video-item">
                <VideoCard video={v} />
                {isOwner && (
                  <button
                    className="btn btn-ghost btn-xs icon-btn-danger remove-video-btn"
                    onClick={() => handleRemoveVideo(v._id)}
                    disabled={removingVideoId === v._id}
                    title="Remove from playlist"
                  >
                    {removingVideoId === v._id ? 'Removing…' : 'Remove'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist?"
        confirmLabel="Delete"
        danger
        onConfirm={handleDeletePlaylist}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
