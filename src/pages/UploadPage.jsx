import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { publishVideo } from '../api/videoApi';

export default function UploadPage() {
  const { isAuthenticated } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const [videoDrag, setVideoDrag] = useState(false);
  const [thumbDrag, setThumbDrag] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="error-banner">You must be signed in to upload videos.</div>
      </div>
    );
  }

  const handleVideoFile = (file) => {
    if (!file || !file.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleThumbnailFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file for the thumbnail.');
      return;
    }
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (!description.trim()) { setError('Description is required'); return; }
    if (!videoFile) { setError('Video file is required'); return; }
    if (!thumbnail) { setError('Thumbnail is required'); return; }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnail);

    setLoading(true);
    setProgress(10);

    // Simulate progress during upload
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 5, 90));
    }, 800);

    const { data, error: err } = await publishVideo(formData);
    clearInterval(progressInterval);
    setProgress(100);
    setLoading(false);

    if (err) { setError(err); setProgress(0); return; }
    addToast('Video uploaded successfully!', 'success');
    navigate(`/watch/${data._id}`);
  };

  return (
    <div className="page-container upload-page">
      <h1 className="page-title">Upload Video</h1>

      {error && <div className="form-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Video Drop Zone */}
        <div
          className={`drop-zone ${videoDrag ? 'drag-over' : ''} ${videoFile ? 'drop-zone-filled' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setVideoDrag(true); }}
          onDragLeave={() => setVideoDrag(false)}
          onDrop={(e) => { e.preventDefault(); setVideoDrag(false); handleVideoFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('video-file-input').click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('video-file-input').click(); }}
          aria-label="Upload video file"
        >
          {videoPreview ? (
            <video src={videoPreview} className="upload-video-preview" controls onClick={(e) => e.stopPropagation()} />
          ) : (
            <div className="drop-zone-content">
              <div className="drop-zone-icon">🎬</div>
              <p className="drop-zone-text">Drag & drop your video here</p>
              <p className="drop-zone-subtext">or click to browse files</p>
              <p className="drop-zone-hint">MP4, WebM, MOV supported</p>
            </div>
          )}
          <input
            id="video-file-input"
            type="file"
            accept="video/*"
            onChange={(e) => handleVideoFile(e.target.files[0])}
            hidden
          />
        </div>

        {videoFile && (
          <p className="file-selected-name">
            📹 {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
          </p>
        )}

        {/* Form Fields */}
        <div className="form-group">
          <label htmlFor="upload-title" className="form-label">Title *</label>
          <input
            id="upload-title"
            type="text"
            className="input"
            placeholder="Enter video title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            maxLength={200}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="upload-description" className="form-label">Description *</label>
          <textarea
            id="upload-description"
            className="input textarea"
            placeholder="Describe your video…"
            value={description}
            onChange={(e) => { setDescription(e.target.value); setError(''); }}
            rows={4}
            maxLength={5000}
            required
          />
        </div>

        {/* Thumbnail */}
        <div className="form-group">
          <label className="form-label">Thumbnail *</label>
          <div
            className={`thumbnail-drop-zone ${thumbDrag ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setThumbDrag(true); }}
            onDragLeave={() => setThumbDrag(false)}
            onDrop={(e) => { e.preventDefault(); setThumbDrag(false); handleThumbnailFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById('thumbnail-input').click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('thumbnail-input').click(); }}
            aria-label="Upload thumbnail"
          >
            {thumbnailPreview ? (
              <img src={thumbnailPreview} alt="Thumbnail preview" className="thumbnail-preview-img" />
            ) : (
              <div className="drop-zone-content">
                <div className="drop-zone-icon">🖼️</div>
                <p className="drop-zone-text">Upload a thumbnail</p>
                <p className="drop-zone-subtext">JPG, PNG, WebP</p>
              </div>
            )}
            <input
              id="thumbnail-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleThumbnailFile(e.target.files[0])}
              hidden
            />
          </div>
        </div>

        {loading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-label">{progress < 100 ? `Uploading… ${progress}%` : 'Processing…'}</p>
          </div>
        )}

        <div className="upload-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !videoFile || !thumbnail || !title.trim() || !description.trim()}
            id="upload-submit-btn"
          >
            {loading ? 'Publishing…' : 'Publish Video'}
          </button>
        </div>
      </form>
    </div>
  );
}
