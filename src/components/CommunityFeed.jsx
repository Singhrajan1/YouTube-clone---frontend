import React, { useState, useEffect } from 'react';
import { HeartIcon, MessageSquareIcon } from './Icons';
import api from '../api/axios';
import '../index.css';

export const CommunityFeed = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts/all');
      setPosts(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', newPostContent.trim());
      
      const res = await api.post('/posts', formData);
      if (res.data?.data) {
        // Optimistically insert and refresh
        setPosts([res.data.data, ...posts]);
        setNewPostContent('');
        fetchPosts(); // fresh fetch to get populated owner
      }
    } catch (err) {
      console.error('Create post failed:', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="community-feed" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="section-header">
        <h2 className="section-title">Community Posts</h2>
      </div>

      {user ? (
        <form className="post-creation-box" onSubmit={handleCreatePost} style={{
          background: 'var(--bg-card)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <img src={user.avatar} alt="Me" className="channel-avatar" style={{width: 48, height: 48}} />
            <textarea 
              className="form-control"
              placeholder="What's on your mind? Share an update with the community..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              style={{ minHeight: '80px', flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={isPosting || !newPostContent.trim()}>
              {isPosting ? 'Posting...' : 'Post Update'}
            </button>
          </div>
        </form>
      ) : (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <p>Please log in to create a community post.</p>
        </div>
      )}

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>No community posts yet. Be the first to say hello!</p>
        </div>
      ) : (
        <div className="posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.map(post => (
            <div key={post._id} className="post-card" style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1rem' }}>
                <img 
                  src={post.owner?.avatar || 'https://via.placeholder.com/150'} 
                  alt={post.owner?.username} 
                  className="channel-avatar" 
                />
                <div>
                  <h4 style={{ fontWeight: 600 }}>{post.owner?.fullname || 'User'}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>@{post.owner?.username}</p>
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {post.content}
              </div>
              {/* Note: In a full app you could expand comments and likes right here, 
                  but given the requirement to keep it simple, we've provided the feed 
                  so users can at least see and interact with it on a high level. */}
              <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button className="btn btn-secondary btn-sm">
                  <HeartIcon size={16} /> Like
                </button>
                <button className="btn btn-secondary btn-sm">
                  <MessageSquareIcon size={16} /> Discuss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
