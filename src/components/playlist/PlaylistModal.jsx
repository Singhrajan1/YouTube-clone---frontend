import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getUserPlaylists, createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist } from '../../api/playlistApi';

export const PlaylistModal = ({ videoId, onClose }) => {
  const { user } = useAuth();
  const addToast = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [savingId, setSavingId] = useState(null);
  // Track which playlists already contain the video
  const [videoInPlaylist, setVideoInPlaylist] = useState({});

  useEffect(() => {
    if (!user) return;
    loadPlaylists();
  }, [user]);

  const loadPlaylists = async () => {
    setLoading(true);
    const { data, error } = await getUserPlaylists(user._id);
    setLoading(false);
    if (error) { addToast(error, 'error'); return; }
    const list = Array.isArray(data) ? data : [];
    setPlaylists(list);
    // Determine which playlists already contain this video
    const inPlaylist = {};
    list.forEach((pl) => {
      inPlaylist[pl._id] = Array.isArray(pl.videos) && pl.videos.some(
        (v) => (typeof v === 'string' ? v : v?._id) === videoId
      );
    });
    setVideoInPlaylist(inPlaylist);
  };

  const handleToggle = async (playlistId) => {
    setSavingId(playlistId);
    const isIn = videoInPlaylist[playlistId];
    if (isIn) {
      const { error } = await removeVideoFromPlaylist(playlistId, videoId);
      if (error) { addToast(error, 'error'); }
      else {
        setVideoInPlaylist((prev) => ({ ...prev, [playlistId]: false }));
        addToast('Removed from playlist', 'success');
      }
    } else {
      const { error } = await addVideoToPlaylist(playlistId, videoId);
      if (error) { addToast(error, 'error'); }
      else {
        setVideoInPlaylist((prev) => ({ ...prev, [playlistId]: true }));
        addToast('Saved to playlist', 'success');
      }
    }
    setSavingId(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const { data, error } = await createPlaylist({ name: newName.trim(), description: newDesc.trim() });
    setCreating(false);
    if (error) { addToast(error, 'error'); return; }
    addToast('Playlist created', 'success');
    setNewName('');
    setNewDesc('');
    setShowCreate(false);
    await loadPlaylists();
    // Auto-add the video to the newly created playlist
    if (data?._id) {
      await addVideoToPlaylist(data._id, videoId);
      setVideoInPlaylist((prev) => ({ ...prev, [data._id]: true }));
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="playlist-modal-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 id="playlist-modal-title" className="modal-title">Save to playlist</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {loading ? (
          <div className="modal-loading"><div className="spinner" /></div>
        ) : (
          <div className="playlist-list">
            {playlists.map((pl) => (
              <label key={pl._id} className="playlist-item" htmlFor={`pl-${pl._id}`}>
                <input
                  type="checkbox"
                  id={`pl-${pl._id}`}
                  checked={!!videoInPlaylist[pl._id]}
                  onChange={() => handleToggle(pl._id)}
                  disabled={savingId === pl._id}
                />
                <span className="playlist-name">{pl.name}</span>
                <span className="playlist-video-count">{pl.videos?.length ?? 0} videos</span>
              </label>
            ))}
            {playlists.length === 0 && <p className="playlist-empty">No playlists yet.</p>}
          </div>
        )}

        {showCreate ? (
          <form className="playlist-create-form" onSubmit={handleCreate}>
            <input
              className="input"
              placeholder="Playlist name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              autoFocus
              maxLength={100}
              id="new-playlist-name"
            />
            <input
              className="input"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              maxLength={200}
              id="new-playlist-desc"
            />
            <div className="playlist-create-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={creating || !newName.trim()} id="create-playlist-submit">
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        ) : (
          <button className="btn btn-ghost btn-sm playlist-new-btn" onClick={() => setShowCreate(true)} id="new-playlist-btn">
            + New playlist
          </button>
        )}
      </div>
    </div>
  );
};
