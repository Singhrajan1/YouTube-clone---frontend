import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout.jsx';
import { useAuth } from './context/AuthContext';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const WatchPage = lazy(() => import('./pages/WatchPage'));
const ChannelPage = lazy(() => import('./pages/ChannelPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));
const PlaylistsPage = lazy(() => import('./pages/PlaylistsPage'));
const PlaylistDetailPage = lazy(() => import('./pages/PlaylistDetailPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Page-level loading fallback
const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner" />
  </div>
);

// Protected route — redirect to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Auth-only guard for login/register — redirect to / if already logged in
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Guest-only routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* Main layout routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/watch/:videoId" element={<WatchPage />} />
          <Route path="/channel/:username" element={<ChannelPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />

          {/* Protected routes */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <PlaylistsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}