import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';

export const Navbar = ({ onSidebarToggle }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle" onClick={onSidebarToggle} aria-label="Toggle sidebar">
          <span className="hamburger-icon">
            <span></span><span></span><span></span>
          </span>
        </button>
        <Link to="/" className="brand">
          <div className="brand-logo">▶</div>
          <span className="brand-name">PlayPulse</span>
        </Link>
      </div>

      <form className="search-form" onSubmit={handleSearch} role="search">
        <input
          id="search-input"
          type="search"
          className="search-input"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search videos"
        />
        <button type="submit" className="search-btn" aria-label="Submit search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </form>

      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <Link to="/upload" className="btn btn-primary btn-sm navbar-upload-btn" id="upload-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Create</span>
            </Link>
            <div className="user-menu-wrapper">
              <button
                className="user-avatar-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="User menu"
                aria-expanded={menuOpen}
                id="user-menu-btn"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullname} className="avatar avatar-sm" />
                ) : (
                  <div className="avatar avatar-sm avatar-placeholder">
                    {getInitials(user?.fullname)}
                  </div>
                )}
              </button>
              {menuOpen && (
                <div className="user-dropdown" role="menu">
                  <div className="dropdown-header">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.fullname} className="avatar avatar-md" />
                    ) : (
                      <div className="avatar avatar-md avatar-placeholder">{getInitials(user?.fullname)}</div>
                    )}
                    <div className="dropdown-user-info">
                      <p className="dropdown-name">{user?.fullname}</p>
                      <p className="dropdown-username">@{user?.username}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={`/channel/${user?.username}`} className="dropdown-item" onClick={() => setMenuOpen(false)} role="menuitem">
                    Your Channel
                  </Link>
                  <Link to="/playlists" className="dropdown-item" onClick={() => setMenuOpen(false)} role="menuitem">
                    Playlists
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setMenuOpen(false)} role="menuitem">
                    Settings
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout} role="menuitem" id="logout-btn">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
};
