import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserPlaylists, createPlaylist, deletePlaylist } from '../api/playlistApi';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export default function PlaylistsPage() {
  const { user, isAuthenticated } = useAuth();
  const addToast = useToast();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) { setLoading(false); return; }
    loadPlaylists();
  }, [isAuthenticated, user]);

  const loadPlaylists = async () => {
    setLoading(true);
    const { data, error: err } = await getUserPlaylists(user._id);
    setLoading(false);
    if (err) { setError(err); return; }
    setPlaylists(Array.isArray(data) ? data : []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    const { data, error: err } = await createPlaylist({ name: name.trim(), description: description.trim() });
    setCreating(false);
    if (err) { addToast(err, 'error'); return; }
    addToast('Playlist created!', 'success');
    setName('');
    setDescription('');
    setShowCreateModal(false);
    loadPlaylists();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error: err } = await deletePlaylist(deleteTarget._id);
    setDeleteTarget(null);
    if (err) { addToast(err, 'error'); return; }
    setPlaylists((prev) => prev.filter((p) => p._id !== deleteTarget._id));
    addToast('Playlist deleted', 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <EmptyState
          icon="🔒"
          title="Sign in required"
          description="Sign in to view and create playlists."
          action={<Link to="/login" className="btn btn-primary">Sign In</Link>}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Playlists</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} id="create-playlist-header-btn">
          + Create Playlist
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="playlist-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="playlist-card skeleton-box" style={{ height: 180 }} />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <EmptyState
          icon="🎵"
          title="No playlists yet"
          description="Create your first playlist to organize your favorite videos."
          action={<button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Create Playlist</button>}
        />
      ) : (
        <div className="playlist-grid">
          {playlists.map((pl) => (
            <div key={pl._id} className="playlist-card" id={`playlist-card-${pl._id}`}>
              <div className="playlist-card-thumbnail">
                {pl.videos && pl.videos.length > 0 && pl.videos[0]?.thumbnail ? (
                  <img src={pl.videos[0].thumbnail} alt={pl.name} className="playlist-thumb-img" />
                ) : (
                  <div className="playlist-thumb-placeholder">
                    <span>📑</span>
                  </div>
                )}
                <span className="playlist-badge">{pl.videos?.length || 0} videos</span>
              </div>
              <div className="playlist-card-body">
                <h3 className="playlist-card-name" title={pl.name}>{pl.name}</h3>
                <p className="playlist-card-desc">{pl.description || 'No description'}</p>
                <div className="playlist-card-actions">
                  <Link to={`/playlist/${pl._id}`} className="btn btn-outline btn-xs">View Playlist</Link>
                  <button className="btn btn-ghost btn-xs icon-btn-danger" onClick={() => setDeleteTarget(pl)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Playlist</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="modal-pl-name" className="form-label">Playlist Name *</label>
                <input
                  id="modal-pl-name"
                  type="text"
                  className="input"
                  placeholder="My Awesome Playlist"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label htmlFor="modal-pl-desc" className="form-label">Description (optional)</label>
                <textarea
                  id="modal-pl-desc"
                  className="input textarea"
                  placeholder="Describe your playlist…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={300}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating || !name.trim()} id="save-new-playlist">
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Playlist"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
