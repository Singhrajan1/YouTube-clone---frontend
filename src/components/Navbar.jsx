import React from 'react';
import { PlayIcon, SearchIcon, UploadIcon, UserIcon, LogOutIcon } from './Icons';

export const Navbar = ({ 
  searchQuery, 
  setSearchQuery, 
  user, 
  onOpenLogin, 
  onOpenRegister, 
  onOpenUpload, 
  onLogout 
}) => {
  return (
    <header className="navbar">
      <div className="brand" onClick={() => setSearchQuery('')}>
        <div className="brand-icon">
          <PlayIcon size={22} color="#fff" />
        </div>
        <h1 className="brand-title">PlayPulse</h1>
      </div>

      <div className="search-container">
        <SearchIcon size={18} className="search-icon-svg" />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search videos, creators, or topics..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <button className="btn btn-primary btn-sm" onClick={onOpenUpload}>
              <UploadIcon size={16} />
              <span>Upload Video</span>
            </button>
            <div className="user-menu" onClick={onLogout} title="Click to Logout">
              <img 
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
                alt={user.username} 
                className="user-avatar-img"
              />
              <span className="user-name-text">@{user.username}</span>
              <LogOutIcon size={16} color="#9ca3af" />
            </div>
          </>
        ) : (
          <>
            <button className="btn btn-secondary btn-sm" onClick={onOpenLogin}>
              Log In
            </button>
            <button className="btn btn-primary btn-sm" onClick={onOpenRegister}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};
