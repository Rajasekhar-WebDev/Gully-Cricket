import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { scoringApi, matchApi } from '../services/api';
import { useSound } from '../context/SoundContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { Trophy, Calendar, MapPin, Play, Award, ArrowLeft } from 'lucide-react';

const Scorecard = () => {
  const { id: matchId } = useParams();
  const { playSound } = useSound();

  const [scorecard, setScorecard] = useState(null);
  const [activeTab, setActiveTab] = useState('inn1'); // inn1 or inn2
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        setLoading(true);
        const data = await scoringApi.getScorecard(matchId);
        setScorecard(data);
        if (data.match?.currentInnings === 2 && data.secondInnings) {
          setActiveTab('inn2');
        }
      } catch (err) {
        setError('Failed to load scorecard: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchScorecard();
  }, [matchId]);

  if (loading) {
    return <LoadingSpinner message="Generating match scorecard telemetry..." />;
  }

  if (!scorecard || !scorecard.match) {
    return <ErrorAlert message={error || 'Scorecard data not available.'} />;
  }

  const match = scorecard.match;
  const currentInningsData = activeTab === 'inn1' ? scorecard.firstInnings : scorecard.secondInnings;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back and Match Summary Header */}
      <div>
        <Link 
          to="/matches" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}
          onClick={() => playSound('tap')}
        >
          <ArrowLeft size={16} />
          <span>Back to Matches</span>
        </Link>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className={`badge ${match.status === 'COMPLETED' ? 'badge-completed' : match.status === 'LIVE' ? 'badge-live' : 'badge-upcoming'}`}>
                  {match.status}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {match.totalOvers} Overs Match
                </span>
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {match.teamA} <span style={{ color: 'var(--primary)' }}>vs</span> {match.teamB}
              </h1>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>📅 {match.matchDate}</span>
                <span>📍 {match.location}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              {match.resultDescription ? (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid var(--accent-gold)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-gold)',
                  fontWeight: 800,
                  fontSize: '1rem'
                }}>
                  🏆 {match.resultDescription}
                </div>
              ) : (
                <Link
                  to={`/scoring/${match.id}`}
                  className="btn btn-primary"
                  onClick={() => playSound('tap')}
                >
                  <Play size={16} fill="currentColor" />
                  <span>Go to Live Scorer</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* Innings Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => { playSound('tap'); setActiveTab('inn1'); }}
          className={`btn ${activeTab === 'inn1' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <span>1st Innings: {scorecard.firstInnings?.battingTeam || match.battingTeamFirst}</span>
          {scorecard.firstInnings && (
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              ({scorecard.firstInnings.totalRuns}/{scorecard.firstInnings.wickets})
            </span>
          )}
        </button>

        {scorecard.secondInnings && (
          <button
            onClick={() => { playSound('tap'); setActiveTab('inn2'); }}
            className={`btn ${activeTab === 'inn2' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <span>2nd Innings: {scorecard.secondInnings.battingTeam}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              ({scorecard.secondInnings.totalRuns}/{scorecard.secondInnings.wickets})
            </span>
          </button>
        )}
      </div>

      {currentInningsData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Innings Summary Banner */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Innings Total</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  {currentInningsData.totalRuns}/{currentInningsData.wickets}
                </span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  ({currentInningsData.completedOvers}.{currentInningsData.ballsInCurrentOver} / {match.totalOvers} ov)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Run Rate: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{currentInningsData.runRate}</strong></span>
              <span>Extras: <strong style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>{currentInningsData.extras?.total || 0}</strong> (wd {currentInningsData.extras?.wides || 0}, nb {currentInningsData.extras?.noBalls || 0}, b {currentInningsData.extras?.byes || 0}, lb {currentInningsData.extras?.legByes || 0})</span>
            </div>
          </div>

          {/* Batting Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Batting Scorecard</h3>
            </div>
            <table className="score-table">
              <thead>
                <tr>
                  <th>Batter</th>
                  <th>Dismissal</th>
                  <th className="num">R</th>
                  <th className="num">B</th>
                  <th className="num">4s</th>
                  <th className="num">6s</th>
                  <th className="num">SR</th>
                </tr>
              </thead>
              <tbody>
                {currentInningsData.battingStats?.map((b, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ color: (b.isOnStrike && !b.isOut) ? 'var(--text-main)' : 'inherit' }}>
                          {b.playerName}{b.isOnStrike && !b.isOut ? ' *' : ''}
                        </strong>
                      </span>
                    </td>
                    <td style={{ color: b.isOut ? 'var(--text-muted)' : 'var(--primary)', fontStyle: b.isOut ? 'normal' : 'italic' }}>
                      {b.dismissalInfo || 'not out'}
                    </td>
                    <td className="num" style={{ fontWeight: 700 }}>{b.runs}</td>
                    <td className="num">{b.balls}</td>
                    <td className="num">{b.fours}</td>
                    <td className="num">{b.sixes}</td>
                    <td className="num" style={{ color: 'var(--text-muted)' }}>{b.strikeRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fall of Wickets Timeline */}
          {currentInningsData.fallOfWickets && currentInningsData.fallOfWickets.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Fall of Wickets</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                {currentInningsData.fallOfWickets.map((fow, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid var(--border-color)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ color: '#f87171', fontWeight: 700 }}>{fow.scoreAtDismissal}-{fow.wicketNumber}</span>{' '}
                    <span style={{ color: 'var(--text-main)' }}>({fow.batsmanName}, {fow.overAtDismissal} ov)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bowling Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Bowling Scorecard</h3>
            </div>
            <table className="score-table">
              <thead>
                <tr>
                  <th>Bowler</th>
                  <th className="num">O</th>
                  <th className="num">M</th>
                  <th className="num">R</th>
                  <th className="num">W</th>
                  <th className="num">ECON</th>
                  <th className="num">DOTS</th>
                </tr>
              </thead>
              <tbody>
                {currentInningsData.bowlingStats?.map((bw, idx) => (
                  <tr key={idx}>
                    <td><strong>{bw.playerName}</strong></td>
                    <td className="num">{bw.oversDisplay}</td>
                    <td className="num">{bw.maidens}</td>
                    <td className="num">{bw.runsConceded}</td>
                    <td className="num" style={{ color: '#f87171', fontWeight: 700 }}>{bw.wickets}</td>
                    <td className="num" style={{ color: 'var(--text-muted)' }}>{bw.economy}</td>
                    <td className="num">{bw.dots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--text-muted)' }}>This innings has not started yet.</p>
        </div>
      )}
    </div>
  );
};

export default Scorecard;
