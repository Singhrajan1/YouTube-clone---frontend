import { useState } from 'react';
import { XIcon } from './Icons';
import api from '../api/axios';

export const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = usernameOrEmail.includes('@')
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password };

      const response = await api.post('/users/login', payload);
      if (response.data?.data?.user) {
        onSuccess(response.data.data.user);
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
      const serverError = err.response?.data?.message || err.response?.data || err.message;
      setError(typeof serverError === 'string' ? serverError : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Welcome Back</h2>
          <button className="close-btn" onClick={onClose}><XIcon /></button>
        </div>

        {error && <div className="alert-toast alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. rajan or rajan@example.com"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
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

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
