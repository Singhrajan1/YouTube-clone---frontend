import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ to, icon, label, onClick, id }) => (
  <NavLink
    to={to}
    id={id}
    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
    onClick={onClick}
    end={to === '/'}
  >
    <span className="sidebar-icon">{icon}</span>
    <span className="sidebar-label">{label}</span>
  </NavLink>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const SubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="12 8 12 12 14 14"/>
    <path d="M3.05 11a9 9 0 1 1 .5 4m-.5-4V7m0 4H7"/>
  </svg>
);
const PlaylistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const CommunityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ChannelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4"/>
    <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} aria-label="Sidebar navigation">
        <nav className="sidebar-nav">
          <NavItem to="/" icon={<HomeIcon />} label="Home" id="nav-home" onClick={onClose} />
          <NavItem to="/community" icon={<CommunityIcon />} label="Community" id="nav-community" onClick={onClose} />

          {isAuthenticated && (
            <>
              <div className="sidebar-divider" />
              <p className="sidebar-section-label">You</p>
              <NavItem
                to={`/channel/${user?.username}`}
                icon={<ChannelIcon />}
                label="Your Channel"
                id="nav-your-channel"
                onClick={onClose}
              />
              <NavItem to="/subscriptions" icon={<SubIcon />} label="Subscriptions" id="nav-subscriptions" onClick={onClose} />
              <NavItem to="/history" icon={<HistoryIcon />} label="History" id="nav-history" onClick={onClose} />
              <NavItem to="/playlists" icon={<PlaylistIcon />} label="Playlists" id="nav-playlists" onClick={onClose} />
              <NavItem to="/settings" icon={<SettingsIcon />} label="Settings" id="nav-settings" onClick={onClose} />
            </>
          )}

          {!isAuthenticated && (
            <>
              <div className="sidebar-divider" />
              <div className="sidebar-signin-prompt">
                <p>Sign in to access your history, playlists and subscriptions.</p>
                <NavLink to="/login" className="btn btn-outline btn-sm" onClick={onClose}>Sign In</NavLink>
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};
