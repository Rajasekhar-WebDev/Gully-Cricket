import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import ErrorAlert from '../components/common/ErrorAlert';
import { 
  LogIn, 
  ArrowRight, 
  Shield, 
  UserPlus, 
  Zap, 
  Trophy, 
  BarChart2, 
  CheckCircle2, 
  Lock,
  Activity
} from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { playSound } = useSound();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      playSound('tap');
      await login({ username: username.trim(), password });
      playSound('bat');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Shield, title: 'Create & Manage Teams', desc: 'Own customized squads with color codes & codes' },
    { icon: UserPlus, title: 'Add Players to Teams', desc: 'Direct one-to-many rosters with career stats' },
    { icon: Trophy, title: 'Create Cricket Matches', desc: 'Digital coin toss, custom overs & venue setups' },
    { icon: Zap, title: 'Live Score Updates', desc: 'Real-time ball telemetry & strike rotation' },
    { icon: Activity, title: 'Match Tracking', desc: 'Over streams, fall of wickets & commentary' },
    { icon: BarChart2, title: 'Player Management', desc: 'Career strike rates, bowling averages & boundaries' },
    { icon: Lock, title: 'Secure User Authentication', desc: 'JWT security with creator-only scoring rights' },
  ];

  return (
    <div className="auth-page-root" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '28px 20px',
      background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 45%)',
    }}>
      <div className="auth-page-grid" style={{
        maxWidth: '1160px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '36px',
        alignItems: 'center'
      }}>
        {/* Left Side: Application Information Showcase */}
        <div className="auth-info-section" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              flexShrink: 0
            }}>
              🏏
            </div>
            <div>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', marginBottom: '4px' }}>
                LOCAL & GULLY CRICKET PLATFORM
              </span>
              <h1 className="auth-brand-title" style={{
                fontSize: '2.4rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: 0,
                background: 'linear-gradient(to right, #ffffff, #a7f3d0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                GULLY-CRICKET
              </h1>
              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--accent-gold)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '4px'
              }}>
                Play. Score. Compete. Live.
              </h3>
            </div>
          </div>

          {/* About Text */}
          <div className="card" style={{
            background: 'rgba(15, 23, 42, 0.75)',
            borderColor: 'rgba(16, 185, 129, 0.25)',
            padding: '20px'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399', marginBottom: '6px' }}>
              About the Application
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Gully-Cricket is a cricket management and live scoring application designed for local and gully cricket players. Users can create teams, add players, organize matches, update live scores, and follow cricket matches in real time.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
              Platform Features
            </span>
            <div className="auth-features-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px',
              marginTop: '10px'
            }}>
              {features.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={16} color="var(--primary)" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                        {f.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form Card */}
        <div className="auth-form-section card glass-card" style={{
          padding: '36px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', marginBottom: '8px' }}>
              AUTHENTICATION
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
              Sign In to Scorer Hub
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Enter your credentials to access matches, squads, and live scoring controls.
            </p>
          </div>

          <ErrorAlert message={error} onDismiss={() => setError('')} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                Username or Email Address *
              </label>
              <input
                type="text"
                placeholder="e.g. captain_raj or raj@gulli.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                Password *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '13px', marginTop: '6px', fontSize: '1rem' }}
            >
              <LogIn size={18} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.88rem',
            color: 'var(--text-muted)'
          }}>
            New to Gully-Cricket?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--primary)', fontWeight: 700 }}
              onClick={() => playSound('tap')}
            >
              Create an Account <ArrowRight size={14} style={{ display: 'inline' }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
