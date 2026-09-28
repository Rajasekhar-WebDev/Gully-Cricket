import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import { Activity, Volume2, VolumeX, LogOut, User as UserIcon, Plus, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { soundEnabled, toggleSound, playSound } = useSound();
  const navigate = useNavigate();

  const handleLogout = () => {
    playSound('tap');
    logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => { playSound('tap'); toggleSidebar(); }}
          style={{ display: 'flex', color: 'var(--text-muted)' }}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => playSound('tap')}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
          }}>
            <span style={{ fontSize: '1.3rem' }}>🏏</span>
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #ffffff, #a7f3d0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              GULLY-CRICKET
            </span>
            <span className="navbar-brand-subtitle" style={{
              display: 'block',
              fontSize: '0.65rem',
              color: 'var(--primary)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              marginTop: '-4px'
            }}>
              SMART LIVE SCORER
            </span>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* New Match Quick Button */}
        <Link 
          to="/match/new" 
          className="btn btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          onClick={() => playSound('tap')}
        >
          <Plus size={16} />
          <span className="navbar-newmatch-text">New Match</span>
        </Link>

        {/* Audio Effects Toggle */}
        <button
          onClick={() => { toggleSound(); playSound('tap'); }}
          title={soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
          style={{
            background: soundEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${soundEnabled ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '8px 10px',
            color: soundEnabled ? 'var(--primary)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span style={{ display: 'none' }}>Sound</span>
        </button>

        {/* User Status */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'var(--bg-glass-light)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#032b1d',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {user?.fullName || user?.username}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                color: 'var(--text-dim)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link 
              to="/login" 
              className="btn btn-secondary" 
              style={{ padding: '7px 14px', fontSize: '0.85rem' }}
              onClick={() => playSound('tap')}
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
