import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';
import { warmupApi } from './services/api';
import { LayoutDashboard, Trophy, Users, PlusCircle, Shield } from 'lucide-react';

import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import TeamDetails from './pages/TeamDetails';
import Matches from './pages/Matches';
import CreateMatch from './pages/CreateMatch';
import DigitalToss from './pages/DigitalToss';
import PlayingXISelect from './pages/PlayingXISelect';
import LiveScoring from './pages/LiveScoring';
import Scorecard from './pages/Scorecard';
import MatchResult from './pages/MatchResult';
import Players from './pages/Players';
import Statistics from './pages/Statistics';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Component: Restricts access to authenticated users only
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Public Route Component: Redirects already logged-in users directly to Dashboard
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Layout Shell Component
const LayoutShell = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mobileNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home', end: true },
    { to: '/teams', icon: Shield, label: 'Teams' },
    { to: '/matches', icon: Trophy, label: 'Matches' },
    { to: '/match/new', icon: PlusCircle, label: 'New' },
    { to: '/players', icon: Users, label: 'Players' },
  ];

  return (
    <div className="app-layout">
      {/* Mobile sidebar overlay backdrop — tap to close */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="main-content">
        <Navbar toggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="page-container">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation — visible on ≤600px via CSS */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <div className="mobile-bottom-nav-inner">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `mobile-nav-item${isActive ? ' active' : ''}`
                }
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

function App() {
  useEffect(() => {
    warmupApi.ping();
  }, []);

  return (
    <AuthProvider>
      <SoundProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Application Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <Dashboard />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <Teams />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teams/:teamId"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <TeamDetails />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <Matches />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/match/new"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <CreateMatch />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/match/toss"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <DigitalToss />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/match/:id/toss"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <DigitalToss />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/match/:id/playing-xi"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <PlayingXISelect />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/scoring/:id"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <LiveScoring />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/match/:id/scorecard"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <Scorecard />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/match/:id/result"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <MatchResult />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/players"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <Players />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <LayoutShell>
                    <Statistics />
                  </LayoutShell>
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect to Dashboard if logged in, or Login if not */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SoundProvider>
    </AuthProvider>
  );
}

export default App;
