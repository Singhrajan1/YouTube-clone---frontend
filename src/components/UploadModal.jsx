import React, { useState } from 'react';
import { XIcon, UploadIcon } from './Icons';
import api from '../api/axios';

export const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!videoFile || !thumbnail) {
      setError('Both video file and thumbnail image are required.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('videoFile', videoFile);
      formData.append('thumbnail', thumbnail);

      const response = await api.post('/videos', formData);

      if (response.data?.data) {
        onSuccess(response.data.data);
        onClose();
        setTitle('');
        setDescription('');
        setVideoFile(null);
        setThumbnail(null);
      }
    } catch (err) {
      console.error('Video upload error:', err);
      const serverError = err.response?.data?.message || err.response?.data || err.message;
      setError(typeof serverError === 'string' ? serverError : 'Video upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Upload Video</h2>
          <button className="close-btn" onClick={onClose}><XIcon /></button>
        </div>

        {error && <div className="alert-toast alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Video Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Give your video a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              placeholder="Tell viewers what your video is about"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Video File (.mp4, .webm)</label>
            <input 
              type="file" 
              accept="video/*" 
              className="form-control"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Thumbnail Image (.jpg, .png)</label>
            <input 
              type="file" 
              accept="image/*" 
              className="form-control"
              onChange={(e) => setThumbnail(e.target.files[0])}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Uploading & Processing on Cloudinary...' : 'Publish Video'}
          </button>
        </form>
      </div>
    </div>
  );
};
