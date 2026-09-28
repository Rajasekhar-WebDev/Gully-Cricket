import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSound } from '../../context/SoundContext';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  TrendingUp, 
  PlusCircle, 
  Sparkles,
  Award,
  Shield,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { playSound } = useSound();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/teams', label: 'Teams', icon: Shield },
    { to: '/matches', label: 'All Matches', icon: Trophy },
    { to: '/match/new', label: 'Create Match', icon: PlusCircle },
    { to: '/players', label: 'Player Roster', icon: Users },
    { to: '/statistics', label: 'Leaderboards', icon: TrendingUp },
  ];

  const handleNavClick = () => {
    playSound('tap');
    if (closeSidebar) closeSidebar();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--primary)" />
          <span style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            letterSpacing: '0.08em', 
            color: 'var(--text-muted)' 
          }}>
            MATCH HUB
          </span>
        </div>
        {/* Close button — visible only on mobile when sidebar is open */}
        <button
          onClick={closeSidebar}
          aria-label="Close sidebar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={handleNavClick}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                background: isActive ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.04) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                transition: 'all 0.2s ease',
              })}
            >
              <Icon size={19} color="currentColor" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Tips / Gully Cricket Card */}
      <div style={{ padding: '16px', margin: '16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Award size={16} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-gold)' }}>Gully Pro Rules</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Real-time strike rotation, custom overs, digital coin toss, and automatic target calculations built-in.
        </p>
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
        Gully-Cricket System v1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;
