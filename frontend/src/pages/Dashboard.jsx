import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsApi, matchApi } from '../services/api';
import { useSound } from '../context/SoundContext';
import MatchCard from '../components/cricket/MatchCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { 
  Trophy, 
  Activity, 
  TrendingUp, 
  Target, 
  PlusCircle, 
  Users, 
  Play, 
  Award,
  Zap,
  Flame,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalMatch, setDeleteModalMatch] = useState(null);

  const { playSound } = useSound();

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashStats, live] = await Promise.all([
        statsApi.getDashboardStats(),
        matchApi.getAll('LIVE'),
      ]);
      setStats(dashStats);
      setLiveMatches(live);
    } catch (err) {
      setError('Unable to fetch dashboard statistics. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteMatch = async () => {
    if (!deleteModalMatch) return;
    try {
      playSound('tap');
      await matchApi.delete(deleteModalMatch.id);
      setDeleteModalMatch(null);
      loadData();
    } catch (err) {
      setError('Failed to delete match: ' + err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating match telemetry & dashboard stats..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner / Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>⚡</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SMART CRICKET MATCH MANAGEMENT
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '6px' }}>
            Gully-Cricket Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>
            Real-time ball scoring, live strike rotation, 3D digital toss, and instant scorecard telemetry for community and college matches.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            to="/match/new"
            className="btn btn-primary"
            style={{ padding: '12px 22px', fontSize: '0.95rem' }}
            onClick={() => playSound('tap')}
          >
            <PlusCircle size={18} />
            <span>Create New Match</span>
          </Link>
          <Link
            to="/players"
            className="btn btn-secondary"
            style={{ padding: '12px 20px', fontSize: '0.95rem' }}
            onClick={() => playSound('tap')}
          >
            <Users size={18} />
            <span>Manage Squads</span>
          </Link>
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} retry={loadData} />

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Matches</span>
            <Trophy size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {stats?.totalMatches || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {stats?.completedMatches || 0} finished
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Live Matches</span>
            <Activity size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#f87171' }}>
            {stats?.liveMatches || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            In progress now
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Runs</span>
            <Flame size={20} color="#60a5fa" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#60a5fa' }}>
            {stats?.totalRuns || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Scored across matches
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Wickets</span>
            <Zap size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#f59e0b' }}>
            {stats?.totalWickets || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Dismissals recorded
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Win Ratio</span>
            <TrendingUp size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
            {stats?.winPercentage || 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Decisive outcomes
          </div>
        </div>
      </div>

      {/* Live Matches Section (if any live) */}
      {liveMatches.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-live">LIVE ACTION</span>
              <h2 style={{ fontSize: '1.4rem' }}>Matches Happening Now</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} onDelete={(match) => setDeleteModalMatch(match)} />
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Recent Matches & Top Performers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {/* Left: Recent Matches */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Recent Matches</h3>
            <Link to="/matches" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => playSound('tap')}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats?.recentMatches && stats.recentMatches.length > 0 ? (
              stats.recentMatches.slice(0, 3).map((m) => (
                <MatchCard key={m.id} match={m} onDelete={(match) => setDeleteModalMatch(match)} />
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                <Trophy size={36} color="var(--border-color)" style={{ margin: '0 auto 12px' }} />
                <p>No matches played yet. Start your first match!</p>
                <Link to="/match/new" className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => playSound('tap')}>
                  Create Match
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Orange & Purple Cap Leaders */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Top Performers</h3>
            <Link to="/statistics" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => playSound('tap')}>
              Leaderboard <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Orange Cap Banner */}
            {stats?.topBatsmen && stats.topBatsmen.length > 0 && (
              <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
                borderColor: 'rgba(245, 158, 11, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge" style={{ background: '#f59e0b', color: '#451a03', fontWeight: 800 }}>
                    🧢 ORANGE CAP (MOST RUNS)
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rank 1</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem' }}>{stats.topBatsmen[0].name}</h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{stats.topBatsmen[0].teamName}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>
                      {stats.topBatsmen[0].runs}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Runs (SR {stats.topBatsmen[0].battingStrikeRate})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Purple Cap Banner */}
            {stats?.topBowlers && stats.topBowlers.length > 0 && (
              <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
                borderColor: 'rgba(139, 92, 246, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge" style={{ background: '#8b5cf6', color: '#2e1065', fontWeight: 800 }}>
                    🧢 PURPLE CAP (MOST WICKETS)
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rank 1</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem' }}>{stats.topBowlers[0].name}</h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{stats.topBowlers[0].teamName}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#a78bfa' }}>
                      {stats.topBowlers[0].wickets}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Wickets (Econ {stats.topBowlers[0].bowlingEconomy})</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteModalMatch}
        title="Delete Match"
        message={`Are you sure you want to delete ${deleteModalMatch?.teamA} vs ${deleteModalMatch?.teamB}? All associated ball deliveries and scorecards will be permanently removed.`}
        confirmText="Delete Match"
        isDanger={true}
        onConfirm={handleDeleteMatch}
        onCancel={() => setDeleteModalMatch(null)}
      />
    </div>
  );
};

export default Dashboard;
