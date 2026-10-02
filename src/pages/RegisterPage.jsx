import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    if (!form.fullname.trim()) return 'Full name is required';
    if (!form.username.trim()) return 'Username is required';
    if (!form.email.trim()) return 'Email is required';
    if (!form.password) return 'Password is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!avatar) return 'Avatar image is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    const formData = new FormData();
    formData.append('fullname', form.fullname.trim());
    formData.append('username', form.username.trim());
    formData.append('email', form.email.trim());
    formData.append('password', form.password);
    formData.append('avatar', avatar);
    if (coverImage) formData.append('coverImage', coverImage);

    setLoading(true);
    const { error: err } = await register(formData);
    setLoading(false);
    if (err) { setError(err); return; }
    addToast('Account created! Please sign in.', 'success');
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-brand">
          <div className="brand-logo-lg">▶</div>
          <h1 className="auth-title">Create your account</h1>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate encType="multipart/form-data">
          {/* Cover image preview at the top */}
          <div className="cover-upload-section">
            <div
              className="cover-preview-wrapper"
              style={{ backgroundImage: coverPreview ? `url(${coverPreview})` : 'none' }}
            >
              {!coverPreview && <span className="cover-placeholder-text">Cover Image (optional)</span>}
              <label htmlFor="register-cover" className="cover-upload-label" title="Upload cover image">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </label>
              <input id="register-cover" type="file" accept="image/*" onChange={handleCoverChange} hidden />
            </div>

            {/* Avatar overlapping the cover */}
            <div className="avatar-upload-section">
              <div className="avatar-preview-wrapper">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
                ) : (
                  <div className="avatar-placeholder-circle">
                    <span>📷</span>
                  </div>
                )}
                <label htmlFor="register-avatar" className="avatar-upload-label" title="Upload avatar (required)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </label>
                <input id="register-avatar" type="file" accept="image/*" onChange={handleAvatarChange} hidden required />
              </div>
              <p className="avatar-hint">Avatar *</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="reg-fullname" className="form-label">Full Name *</label>
              <input id="reg-fullname" name="fullname" type="text" className="input" placeholder="John Doe" value={form.fullname} onChange={handleChange} autoComplete="name" />
            </div>
            <div className="form-group">
              <label htmlFor="reg-username" className="form-label">Username *</label>
              <input id="reg-username" name="username" type="text" className="input" placeholder="john_doe" value={form.username} onChange={handleChange} autoComplete="username" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email *</label>
            <input id="reg-email" name="email" type="email" className="input" placeholder="john@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">Password *</label>
              <input id="reg-password" name="password" type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={handleChange} autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label htmlFor="reg-confirm" className="form-label">Confirm Password *</label>
              <input id="reg-confirm" name="confirmPassword" type="password" className="input" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} id="register-submit-btn">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
