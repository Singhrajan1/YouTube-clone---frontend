import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [useEmail, setUseEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const credentials = { password: form.password };
    if (useEmail) {
      if (!form.email.trim()) { setError('Email is required'); return; }
      credentials.email = form.email.trim();
    } else {
      if (!form.username.trim()) { setError('Username is required'); return; }
      credentials.username = form.username.trim();
    }
    if (!form.password) { setError('Password is required'); return; }

    setLoading(true);
    const { error: err } = await login(credentials);
    setLoading(false);
    if (err) { setError(err); return; }
    addToast('Welcome back!', 'success');
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-logo-lg">▶</div>
          <h1 className="auth-title">Sign in to PlayPulse</h1>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="login-method-toggle">
            <button
              type="button"
              className={`method-btn ${!useEmail ? 'active' : ''}`}
              onClick={() => setUseEmail(false)}
            >
              Username
            </button>
            <button
              type="button"
              className={`method-btn ${useEmail ? 'active' : ''}`}
              onClick={() => setUseEmail(true)}
            >
              Email
            </button>
          </div>

          {useEmail ? (
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                className="input"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="login-username" className="form-label">Username</label>
              <input
                id="login-username"
                name="username"
                type="text"
                className="input"
                placeholder="your_username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
