import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VideoCard } from './components/VideoCard';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { UploadModal } from './components/UploadModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { HomeIcon, FilmIcon, HistoryIcon, HeartIcon, PlusIcon } from './components/Icons';
import api from './api/axios';
import './index.css';

// Demo sample videos if backend MongoDB has no records yet
const SAMPLE_VIDEOS = [
  {
    _id: 'demo-1',
    title: 'Building a Fullstack YouTube Clone with React & Node.js',
    description: 'Learn step-by-step how to build a modern fullstack video streaming web app with Express, MongoDB, and React.',
    videoFile: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    duration: 596,
    views: 24500,
    createdAt: new Date().toISOString(),
    owner: {
      fullname: 'Rajan Kumar Singh',
      username: 'singhrajan',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    }
  },
  {
    _id: 'demo-2',
    title: 'Deep Dive into Modern Web Design Aesthetics & UI Animation',
    description: 'Master glassmorphism, responsive grids, dark cyber themes, and interactive React UI components.',
    videoFile: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    duration: 653,
    views: 18200,
    createdAt: new Date().toISOString(),
    owner: {
      fullname: 'Tech Vision',
      username: 'techvision',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'
    }
  },
  {
    _id: 'demo-3',
    title: 'Cyberpunk 2077 - Next-Gen Visual Effects & Gameplay Showcase',
    description: 'An epic highlight reel of 4K ultra graphics, ray tracing showcase, and immersive gaming aesthetics.',
    videoFile: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    duration: 180,
    views: 95400,
    createdAt: new Date().toISOString(),
    owner: {
      fullname: 'Gaming Edge',
      username: 'gamingedge',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=120&q=80'
    }
  }
];

const CATEGORIES = ['All', 'Development', 'Design', 'Gaming', 'Music', 'Tech'];

export default function App() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('home');

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Check Current Authenticated User
  useEffect(() => {
    api.get('/users/current-user')
      .then(res => {
        if (res.data?.data) {
          setUser(res.data.data);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  // Fetch Videos from Backend API
  const loadVideos = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get('/videos', {
        params: { query: query.trim() }
      });
      const fetched = res.data?.data?.videos || res.data?.data;
      if (Array.isArray(fetched) && fetched.length > 0) {
        setVideos(fetched);
      } else {
        // Fallback to sample videos filtered by query if backend DB is empty
        if (query.trim()) {
          const filtered = SAMPLE_VIDEOS.filter(v => 
            v.title.toLowerCase().includes(query.toLowerCase()) || 
            v.description.toLowerCase().includes(query.toLowerCase())
          );
          setVideos(filtered);
        } else {
          setVideos(SAMPLE_VIDEOS);
        }
      }
    } catch (err) {
      console.warn('Backend video fetch failed or empty, loading fallback dataset:', err);
      setVideos(SAMPLE_VIDEOS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVideos(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const handleVideoUploaded = (newVideo) => {
    setVideos(prev => [newVideo, ...prev]);
    setIsUploadOpen(false);
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace Layout */}
      <div className="main-wrapper">
        {/* Sidebar */}
        <aside className="sidebar">
          <a 
            className={`sidebar-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => { setActiveTab('home'); setSearchQuery(''); }}
          >
            <HomeIcon size={20} />
            <span>Home</span>
          </a>
          <a 
            className={`sidebar-item ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            <FilmIcon size={20} />
            <span>Trending</span>
          </a>
          <a 
            className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              if (!user) setIsLoginOpen(true);
              else setActiveTab('history');
            }}
          >
            <HistoryIcon size={20} />
            <span>Watch History</span>
          </a>
          <a 
            className={`sidebar-item ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => {
              if (!user) setIsLoginOpen(true);
              else setActiveTab('liked');
            }}
          >
            <HeartIcon size={20} />
            <span>Liked Videos</span>
          </a>

          {user && (
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button 
                className="btn btn-outline btn-sm" 
                style={{ width: '100%' }}
                onClick={() => setIsUploadOpen(true)}
              >
                <PlusIcon size={16} />
                <span>Upload Content</span>
              </button>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="content-area">
          {/* Category Chips */}
          <div className="categories-bar">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Section Heading */}
          <div className="section-header">
            <h2 className="section-title">
              {searchQuery ? `Search results for "${searchQuery}"` : `${selectedCategory} Videos`}
            </h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {videos.length} videos available
            </span>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="empty-state">
              <p className="empty-title">Loading video feed...</p>
            </div>
          )}

          {/* Video Grid */}
          {!loading && videos.length > 0 && (
            <div className="video-grid">
              {videos.map(video => (
                <VideoCard 
                  key={video._id} 
                  video={video} 
                  onClick={setSelectedVideo}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && videos.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📹</div>
              <h3 className="empty-title">No Videos Found</h3>
              <p className="empty-desc">
                {searchQuery 
                  ? `We couldn't find any videos matching "${searchQuery}". Try a different keyword.` 
                  : 'Be the first creator to upload a video to PlayPulse!'}
              </p>
              {user ? (
                <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)}>
                  Upload a Video Now
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setIsRegisterOpen(true)}>
                  Create an Account to Upload
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      <RegisterModal 
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleVideoUploaded}
      />

      {selectedVideo && (
        <VideoPlayerModal 
          video={selectedVideo}
          user={user}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
