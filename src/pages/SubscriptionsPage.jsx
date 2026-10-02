import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getSubscribedChannels, toggleSubscription } from '../api/subscriptionApi';
import { EmptyState } from '../components/ui/EmptyState';
import { getInitials } from '../utils/formatters';

export default function SubscriptionsPage() {
  const { isAuthenticated } = useAuth();
  const addToast = useToast();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    const fetchSubs = async () => {
      setLoading(true);
      const { data, error: err } = await getSubscribedChannels();
      if (!isMounted) return;
      setLoading(false);
      if (err) { setError(err); return; }
      const list = Array.isArray(data) ? data : [];
      setChannels(list);
    };

    fetchSubs();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleUnsubscribe = async (channelId) => {
    const { error: err } = await toggleSubscription(channelId);
    if (err) { addToast(err, 'error'); return; }
    setChannels((prev) => prev.filter((item) => {
      const ch = item.subscribedChannel || item.channel || item;
      return ch._id !== channelId;
    }));
    addToast('Unsubscribed', 'info');
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <EmptyState
          icon="🔒"
          title="Sign in required"
          description="Sign in to view your subscribed channels."
          action={<Link to="/login" className="btn btn-primary">Sign In</Link>}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Subscribed Channels</h1>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="channel-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="channel-card skeleton-box" style={{ height: 160 }} />
          ))}
        </div>
      ) : channels.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No subscriptions yet"
          description="Subscribe to channels to see them listed here."
          action={<Link to="/" className="btn btn-primary">Explore Channels</Link>}
        />
      ) : (
        <div className="channel-grid">
          {channels.map((item) => {
            const ch = item.subscribedChannel || item.channel || item;
            if (!ch || !ch._id) return null;
            return (
              <div key={ch._id} className="channel-card" id={`channel-card-${ch._id}`}>
                <div className="channel-card-avatar">
                  {ch.avatar ? (
                    <img src={ch.avatar} alt={ch.fullname} className="avatar avatar-lg" />
                  ) : (
                    <div className="avatar avatar-lg avatar-placeholder">{getInitials(ch.fullname)}</div>
                  )}
                </div>
                <div className="channel-card-info">
                  <h3 className="channel-card-name">{ch.fullname}</h3>
                  <p className="channel-card-username">@{ch.username}</p>
                </div>
                <div className="channel-card-actions">
                  <Link to={`/channel/${ch.username}`} className="btn btn-outline btn-xs">View</Link>
                  <button className="btn btn-ghost btn-xs icon-btn-danger" onClick={() => handleUnsubscribe(ch._id)}>
                    Unsubscribe
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
