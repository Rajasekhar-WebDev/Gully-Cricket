import React, { useState, useEffect } from 'react';
import { statsApi } from '../services/api';
import { fastCache } from '../services/fastCache';
import { useSound } from '../context/SoundContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { Trophy, Award, Flame, Zap, TrendingUp, Shield } from 'lucide-react';

const Statistics = () => {
  const cached = fastCache.get('gulli_leaderboard_cache', null);
  const [data, setData] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');
  const [activeCap, setActiveCap] = useState('orange'); // orange or purple

  const { playSound } = useSound();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!cached) setLoading(true);
        const res = await statsApi.getLeaderboard();
        fastCache.set('gulli_leaderboard_cache', res);
        setData(res);
      } catch (err) {
        if (!data) {
          setError('Failed to load leaderboards: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading && !data) {
    return <LoadingSpinner message="Calculating player leaderboards & caps..." />;
  }

  if (!data) {
    return <ErrorAlert message={error || 'Leaderboard data unavailable.'} />;
  }

  const orangeCap = data.orangeCap;
  const purpleCap = data.purpleCap;
  const topBatsmen = data.topBatsmen || [];
  const topBowlers = data.topBowlers || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
          Leaderboards & Tournament Honors
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Individual brilliance, Orange Cap (Most Runs), and Purple Cap (Most Wickets) standings.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* Hero Caps Showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Orange Cap Podium */}
        {orangeCap && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
            borderColor: 'var(--accent-gold)',
            boxShadow: '0 8px 30px rgba(245, 158, 11, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className="badge" style={{ background: '#f59e0b', color: '#451a03', fontWeight: 800 }}>
                🧢 CURRENT ORANGE CAP LEADER
              </span>
              <Award size={22} color="var(--accent-gold)" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fde68a, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem'
              }}>
                🏏
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{orangeCap.name}</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{orangeCap.teamName}</span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Runs</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>{orangeCap.runs}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Strike Rate</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800 }}>{orangeCap.battingStrikeRate}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Highest</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800 }}>{orangeCap.highestScore}</span>
              </div>
            </div>
          </div>
        )}

        {/* Purple Cap Podium */}
        {purpleCap && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
            borderColor: 'var(--accent-purple)',
            boxShadow: '0 8px 30px rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className="badge" style={{ background: '#8b5cf6', color: '#fff', fontWeight: 800 }}>
                🧢 CURRENT PURPLE CAP LEADER
              </span>
              <Award size={22} color="#a78bfa" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ddd6fe, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem'
              }}>
                🎯
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{purpleCap.name}</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{purpleCap.teamName}</span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Wickets</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800, color: '#a78bfa' }}>{purpleCap.wickets}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Economy</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800 }}>{purpleCap.bowlingEconomy}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Dots</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800 }}>{purpleCap.dots}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs to Toggle Batting / Bowling Leaderboards */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => { playSound('tap'); setActiveCap('orange'); }}
          className={`btn ${activeCap === 'orange' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <span>🏏 Most Runs (Orange Cap Standings)</span>
        </button>
        <button
          onClick={() => { playSound('tap'); setActiveCap('purple'); }}
          className={`btn ${activeCap === 'purple' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <span>🎯 Most Wickets (Purple Cap Standings)</span>
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeCap === 'orange' ? (
          <table className="score-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th className="num">Matches</th>
                <th className="num">Runs</th>
                <th className="num">Highest</th>
                <th className="num">4s</th>
                <th className="num">6s</th>
                <th className="num">SR</th>
              </tr>
            </thead>
            <tbody>
              {topBatsmen.map((b, idx) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 800, color: idx === 0 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                    #{idx + 1}
                  </td>
                  <td>
                    <strong>{b.name}</strong>
                    {idx === 0 && <span style={{ marginLeft: '6px' }}>🧢</span>}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{b.teamName}</td>
                  <td className="num">{b.matches}</td>
                  <td className="num" style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.05rem' }}>{b.runs}</td>
                  <td className="num">{b.highestScore}</td>
                  <td className="num">{b.fours}</td>
                  <td className="num">{b.sixes}</td>
                  <td className="num" style={{ color: 'var(--text-muted)' }}>{b.battingStrikeRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="score-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th className="num">Matches</th>
                <th className="num">Wickets</th>
                <th className="num">Overs</th>
                <th className="num">Runs</th>
                <th className="num">Econ</th>
                <th className="num">Dots</th>
              </tr>
            </thead>
            <tbody>
              {topBowlers.map((bw, idx) => (
                <tr key={bw.id}>
                  <td style={{ fontWeight: 800, color: idx === 0 ? '#a78bfa' : 'var(--text-muted)' }}>
                    #{idx + 1}
                  </td>
                  <td>
                    <strong>{bw.name}</strong>
                    {idx === 0 && <span style={{ marginLeft: '6px' }}>🧢</span>}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{bw.teamName}</td>
                  <td className="num">{bw.matches}</td>
                  <td className="num" style={{ fontWeight: 800, color: '#a78bfa', fontSize: '1.05rem' }}>{bw.wickets}</td>
                  <td className="num">{bw.oversBowled}</td>
                  <td className="num">{bw.runsConceded}</td>
                  <td className="num" style={{ color: 'var(--text-muted)' }}>{bw.bowlingEconomy}</td>
                  <td className="num">{bw.dots}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Statistics;
