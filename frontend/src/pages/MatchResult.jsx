import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { scoringApi } from '../services/api';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { Trophy, Award, FileText, PlusCircle, LayoutDashboard, Share2 } from 'lucide-react';

const MatchResult = () => {
  const { id: matchId } = useParams();
  const { playSound } = useSound();

  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await scoringApi.getScorecard(matchId);
        setScorecard(data);
        playSound('six');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#FFFFFF']
        });
      } catch (err) {
        setError('Failed to load match result: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [matchId]);

  if (loading) {
    return <LoadingSpinner message="Calculating final victory margin & podium presentation..." />;
  }

  if (!scorecard || !scorecard.match) {
    return <ErrorAlert message={error || 'Match result unavailable.'} />;
  }

  const match = scorecard.match;
  const inn1 = scorecard.firstInnings;
  const inn2 = scorecard.secondInnings;

  // Find top batsman across match
  let topBatsman = null;
  let maxRuns = -1;
  const allBatsmen = [...(inn1?.battingStats || []), ...(inn2?.battingStats || [])];
  allBatsmen.forEach(b => {
    if (b.runs > maxRuns) {
      maxRuns = b.runs;
      topBatsman = b;
    }
  });

  // Find top bowler across match
  let topBowler = null;
  let maxWickets = -1;
  const allBowlers = [...(inn1?.bowlingStats || []), ...(inn2?.bowlingStats || [])];
  allBowlers.forEach(bw => {
    if (bw.wickets > maxWickets) {
      maxWickets = bw.wickets;
      topBowler = bw;
    }
  });

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Victory Celebration Podium Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(245, 158, 11, 0.15) 100%)',
        border: '2px solid var(--accent-gold)',
        borderRadius: 'var(--radius-xl)',
        padding: '44px 28px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.25)',
        position: 'relative'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #FDE68A 0%, #F59E0B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '2.2rem',
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)'
        }}>
          🏆
        </div>

        <span className="badge" style={{ background: '#f59e0b', color: '#451a03', fontWeight: 800, marginBottom: '8px' }}>
          FINAL RESULT
        </span>

        <h1 style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '8px 0', color: '#fff' }}>
          {match.resultDescription || `${match.winner} Won!`}
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto 24px' }}>
          {match.totalOvers} Overs Exhibition at {match.location} on {match.matchDate}
        </p>

        {/* Both Innings Quick Comparison */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          maxWidth: '580px',
          margin: '0 auto'
        }}>
          {/* Team A */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: match.winner === inn1?.battingTeam ? 'var(--primary)' : 'var(--text-main)' }}>
              {inn1?.battingTeam}
            </h3>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
              {inn1?.totalRuns}/{inn1?.wickets}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              ({inn1?.completedOvers}.{inn1?.ballsInCurrentOver} ov)
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-dim)', fontSize: '1.2rem' }}>
            vs
          </div>

          {/* Team B */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: match.winner === inn2?.battingTeam ? 'var(--primary)' : 'var(--text-main)' }}>
              {inn2?.battingTeam || match.bowlingTeamFirst}
            </h3>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
              {inn2 ? `${inn2.totalRuns}/${inn2.wickets}` : '-'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {inn2 ? `(${inn2.completedOvers}.${inn2.ballsInCurrentOver} ov)` : 'Did not bat'}
            </span>
          </div>
        </div>
      </div>

      {/* Top Performers Podium */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Best Batsman Award */}
        {topBatsman && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.4)'
          }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>🏏</span>
            <span className="badge" style={{ background: '#3b82f6', color: '#fff' }}>MATCH BEST BATSMAN</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '10px' }}>{topBatsman.playerName}</h3>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa', margin: '6px 0' }}>
              {topBatsman.runs} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({topBatsman.balls}b)</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {topBatsman.fours} Fours • {topBatsman.sixes} Sixes • SR {topBatsman.strikeRate}
            </span>
          </div>
        )}

        {/* Best Bowler Award */}
        {topBowler && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.4)'
          }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>🎯</span>
            <span className="badge" style={{ background: '#ef4444', color: '#fff' }}>MATCH BEST BOWLER</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '10px' }}>{topBowler.playerName}</h3>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#f87171', margin: '6px 0' }}>
              {topBowler.wickets} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>wkts</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {topBowler.oversDisplay} Overs • {topBowler.runsConceded} Runs • Econ {topBowler.economy}
            </span>
          </div>
        )}
      </div>

      {/* Action Links */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <Link
          to={`/match/${match.id}/scorecard`}
          className="btn btn-secondary"
          style={{ padding: '12px 24px', fontSize: '1rem' }}
          onClick={() => playSound('tap')}
        >
          <FileText size={18} />
          <span>View Detailed Scorecard</span>
        </Link>
        <Link
          to="/match/new"
          className="btn btn-primary"
          style={{ padding: '12px 28px', fontSize: '1rem' }}
          onClick={() => playSound('tap')}
        >
          <PlusCircle size={18} />
          <span>Schedule Next Match</span>
        </Link>
        <Link
          to="/"
          className="btn btn-secondary"
          style={{ padding: '12px 20px', fontSize: '1rem' }}
          onClick={() => playSound('tap')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default MatchResult;
