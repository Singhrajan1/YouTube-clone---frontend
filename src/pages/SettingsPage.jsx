import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateAccount, changePassword, updateAvatar, updateCoverImage } from '../api/authApi';

export default function SettingsPage() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const addToast = useToast();

  const [activeSection, setActiveSection] = useState('account');

  // Account Details
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [accountSaving, setAccountSaving] = useState(false);

  // Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Avatar/Cover
  const [newAvatar, setNewAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const [newCover, setNewCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverSaving, setCoverSaving] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="error-banner">Sign in to access settings.</div>
      </div>
    );
  }

  const handleAccountSave = async (e) => {
    e.preventDefault();
    if (!fullname.trim() && !email.trim()) { addToast('Please provide at least fullname or email', 'error'); return; }
    setAccountSaving(true);
    const { error } = await updateAccount({ fullname: fullname.trim(), email: email.trim() });
    setAccountSaving(false);
    if (error) { addToast(error, 'error'); return; }
    await refreshUser();
    addToast('Account details updated', 'success');
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) { addToast('Fill in all password fields', 'error'); return; }
    if (newPassword !== confirmNew) { addToast('Passwords do not match', 'error'); return; }
    setPasswordSaving(true);
    const { error } = await changePassword({ oldPassword, newPassword });
    setPasswordSaving(false);
    if (error) { addToast(error, 'error'); return; }
    addToast('Password changed successfully', 'success');
    setOldPassword(''); setNewPassword(''); setConfirmNew('');
  };

  const handleAvatarSave = async () => {
    if (!newAvatar) return;
    const fd = new FormData();
    fd.append('avatar', newAvatar);
    setAvatarSaving(true);
    const { error } = await updateAvatar(fd);
    setAvatarSaving(false);
    if (error) { addToast(error, 'error'); return; }
    await refreshUser();
    addToast('Avatar updated', 'success');
    setNewAvatar(null); setAvatarPreview(null);
  };

  const handleCoverSave = async () => {
    if (!newCover) return;
    const fd = new FormData();
    fd.append('coverImage', newCover);
    setCoverSaving(true);
    const { error } = await updateCoverImage(fd);
    setCoverSaving(false);
    if (error) { addToast(error, 'error'); return; }
    await refreshUser();
    addToast('Cover image updated', 'success');
    setNewCover(null); setCoverPreview(null);
  };

  const sections = [
    { id: 'account', label: 'Account Details' },
    { id: 'password', label: 'Change Password' },
    { id: 'avatar', label: 'Avatar' },
    { id: 'cover', label: 'Cover Image' },
  ];

  return (
    <div className="page-container settings-page">
      <h1 className="page-title">Settings</h1>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {sections.map((s) => (
            <button
              key={s.id}
              className={`settings-nav-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
              id={`settings-nav-${s.id}`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="settings-content">
          {/* Account Details */}
          {activeSection === 'account' && (
            <section className="settings-section">
              <h2 className="settings-section-title">Account Details</h2>
              <form onSubmit={handleAccountSave}>
                <div className="form-group">
                  <label htmlFor="settings-fullname" className="form-label">Full Name</label>
                  <input
                    id="settings-fullname"
                    type="text"
                    className="input"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="settings-email" className="form-label">Email</label>
                  <input
                    id="settings-email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={accountSaving} id="save-account-btn">
                  {accountSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </section>
          )}

          {/* Password */}
          {activeSection === 'password' && (
            <section className="settings-section">
              <h2 className="settings-section-title">Change Password</h2>
              <form onSubmit={handlePasswordSave}>
                <div className="form-group">
                  <label htmlFor="settings-old-pw" className="form-label">Current Password</label>
                  <input
                    id="settings-old-pw"
                    type="password"
                    className="input"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="settings-new-pw" className="form-label">New Password</label>
                  <input
                    id="settings-new-pw"
                    type="password"
                    className="input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="settings-confirm-pw" className="form-label">Confirm New Password</label>
                  <input
                    id="settings-confirm-pw"
                    type="password"
                    className="input"
                    value={confirmNew}
                    onChange={(e) => setConfirmNew(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={passwordSaving} id="save-password-btn">
                  {passwordSaving ? 'Updating…' : 'Change Password'}
                </button>
              </form>
            </section>
          )}

          {/* Avatar */}
          {activeSection === 'avatar' && (
            <section className="settings-section">
              <h2 className="settings-section-title">Avatar</h2>
              <div className="avatar-update-wrapper">
                <div className="avatar-current">
                  {(avatarPreview || user?.avatar) ? (
                    <img src={avatarPreview || user?.avatar} alt="Avatar" className="avatar avatar-lg" />
                  ) : (
                    <div className="avatar avatar-lg avatar-placeholder">
                      {user?.fullname?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="avatar-upload-controls">
                  <input
                    id="settings-avatar-input"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f) { setNewAvatar(f); setAvatarPreview(URL.createObjectURL(f)); }
                    }}
                  />
                  <label htmlFor="settings-avatar-input" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                    Choose Image
                  </label>
                  {newAvatar && (
                    <button className="btn btn-primary" onClick={handleAvatarSave} disabled={avatarSaving} id="save-avatar-btn">
                      {avatarSaving ? 'Uploading…' : 'Save Avatar'}
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Cover Image */}
          {activeSection === 'cover' && (
            <section className="settings-section">
              <h2 className="settings-section-title">Cover Image</h2>
              <div className="cover-update-wrapper">
                {(coverPreview || user?.coverImage) && (
                  <img
                    src={coverPreview || user?.coverImage}
                    alt="Cover"
                    className="cover-preview-img"
                    style={{ width: '100%', borderRadius: 8, marginBottom: 12, maxHeight: 200, objectFit: 'cover' }}
                  />
                )}
                <input
                  id="settings-cover-input"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) { setNewCover(f); setCoverPreview(URL.createObjectURL(f)); }
                  }}
                />
                <label htmlFor="settings-cover-input" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                  Choose Image
                </label>
                {newCover && (
                  <button className="btn btn-primary" style={{ marginLeft: 8 }} onClick={handleCoverSave} disabled={coverSaving} id="save-cover-btn">
                    {coverSaving ? 'Uploading…' : 'Save Cover Image'}
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
