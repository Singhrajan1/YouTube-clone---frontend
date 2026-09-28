import React, { useState } from 'react';
import { XIcon, UploadIcon } from './Icons';
import api from '../api/axios';

export const RegisterModal = ({ isOpen, onClose, onSuccess }) => {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!avatar) {
      setError('Please select an Avatar image.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('avatar', avatar);
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      const response = await api.post('/users/register', formData);

      if (response.data?.data) {
        // Auto-login after registration
        try {
          const loginRes = await api.post('/users/login', { username, password });
          if (loginRes.data?.data?.user) {
            onSuccess(loginRes.data.data.user);
          }
        } catch (loginErr) {
          console.warn('Auto-login post registration failed:', loginErr);
        }
        onClose();
      }
    } catch (err) {
      console.error('Registration API error:', err);
      const serverError = err.response?.data?.message || err.response?.data || err.message;
      setError(typeof serverError === 'string' ? serverError : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create your Account</h2>
          <button className="close-btn" onClick={onClose}><XIcon /></button>
        </div>

        {error && <div className="alert-toast alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Rajan Kumar"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. rajan123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="rajan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Profile Avatar (Required)</label>
            <input 
              type="file" 
              accept="image/*" 
              className="form-control"
              onChange={(e) => setAvatar(e.target.files[0])}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              className="form-control"
              onChange={(e) => setCoverImage(e.target.files[0])}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account & Uploading...' : 'Register Now'}
          </button>
        </form>
      </div>
    </div>
  );
};
