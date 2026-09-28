import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { matchApi } from '../services/api';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';
import ErrorAlert from '../components/common/ErrorAlert';
import { Trophy, ArrowRight, CheckCircle2, Shield, RefreshCw } from 'lucide-react';

const DigitalToss = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeMatchId } = useParams();
  const { playSound } = useSound();

  // If passed via state from CreateMatch:
  const matchConfig = location.state || {
    teamA: 'Gully Super Kings',
    teamB: 'Street Challengers',
    totalOvers: 5,
    matchDate: new Date().toISOString().split('T')[0],
    location: 'Main Pitch Ground',
  };

  const [tossCaller, setTossCaller] = useState(matchConfig.teamA);
  const [tossCall, setTossCall] = useState('HEADS'); // HEADS or TAILS
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState(null); // 'HEADS' or 'TAILS'
  const [tossWinner, setTossWinner] = useState(null);
  const [tossDecision, setTossDecision] = useState(null); // 'BAT' or 'BOWL'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [flipDegree, setFlipDegree] = useState(0);

  // If match already created and we're visiting /match/:id/toss directly
  useEffect(() => {
    if (routeMatchId) {
      matchApi.getById(routeMatchId).then((m) => {
        setTossCaller(m.teamA);
      }).catch((e) => setError(e.message));
    }
  }, [routeMatchId]);

  const handleFlipCoin = () => {
    if (isFlipping) return;

    setError('');
    setIsFlipping(true);
    setCoinResult(null);
    setTossWinner(null);
    setTossDecision(null);

    playSound('coin');

    // Determine random coin result: Heads (0) or Tails (1)
    const isHeads = Math.random() < 0.5;
    const outcome = isHeads ? 'HEADS' : 'TAILS';

    // 6 full rotations (2160 deg) + 0 for Heads, 180 for Tails
    const finalRot = 2160 + (isHeads ? 0 : 180);
    setFlipDegree(finalRot);

    setTimeout(() => {
      setIsFlipping(false);
      setCoinResult(outcome);

      // Determine toss winner
      const callerWon = tossCall === outcome;
      const winner = callerWon
        ? tossCaller
        : (tossCaller === matchConfig.teamA ? matchConfig.teamB : matchConfig.teamA);

      setTossWinner(winner);

      playSound('six');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#FFFFFF']
      });
    }, 2400);
  };

  const handleDecisionConfirm = async (decision) => {
    setTossDecision(decision);
    playSound('tap');
    try {
      setSaving(true);
      setError('');

      let targetMatchId = routeMatchId;

      // 1. If match wasn't already in database, create it now!
      if (!targetMatchId) {
        const created = await matchApi.create({
          teamA: matchConfig.teamA,
          teamB: matchConfig.teamB,
          teamAId: matchConfig.teamAId,
          teamBId: matchConfig.teamBId,
          totalOvers: matchConfig.totalOvers,
          matchDate: matchConfig.matchDate,
          location: matchConfig.location,
        });
        targetMatchId = created.id;
      }

      // 2. Save Toss Data to MongoDB
      await matchApi.recordToss(targetMatchId, {
        tossCaller,
        tossCall,
        coinResult,
        tossWinner,
        tossDecision: decision,
      });

      playSound('bat');

      // Navigate to Playing XI selection for this match
      navigate(`/match/${targetMatchId}/playing-xi`);
    } catch (err) {
      setError('Failed to save toss decision: ' + err.message);
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '24px' }}>
        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', marginBottom: '8px' }}>
          OFFICIAL DIGITAL TOSS
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>
          {matchConfig.teamA} <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>vs</span> {matchConfig.teamB}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          {matchConfig.totalOvers} Overs Match • {matchConfig.location}
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* Versus Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Team A Card */}
        <div className="card" style={{
          borderColor: tossCaller === matchConfig.teamA ? 'var(--primary)' : 'var(--border-color)',
          background: tossCaller === matchConfig.teamA ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#032b1d'
          }}>
            {matchConfig.teamA.charAt(0)}
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>{matchConfig.teamA}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Team A</span>
        </div>

        {/* VS Animation Badge */}
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'var(--bg-surface)',
          border: '2px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          color: 'var(--accent-gold)',
          fontSize: '0.95rem',
          boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)'
        }}>
          VS
        </div>

        {/* Team B Card */}
        <div className="card" style={{
          borderColor: tossCaller === matchConfig.teamB ? 'var(--primary)' : 'var(--border-color)',
          background: tossCaller === matchConfig.teamB ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-card)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#fff'
          }}>
            {matchConfig.teamB.charAt(0)}
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>{matchConfig.teamB}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Team B</span>
        </div>
      </div>

      {/* Toss Setup Selection */}
      {!tossWinner && (
        <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>
                Who will call the toss?
              </label>
              <select
                value={tossCaller}
                onChange={(e) => setTossCaller(e.target.value)}
                disabled={isFlipping}
              >
                <option value={matchConfig.teamA}>{matchConfig.teamA}</option>
                <option value={matchConfig.teamB}>{matchConfig.teamB}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>
                {tossCaller}'s Call:
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`btn ${tossCall === 'HEADS' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => { playSound('tap'); setTossCall('HEADS'); }}
                  disabled={isFlipping}
                >
                  🪙 Heads
                </button>
                <button
                  type="button"
                  className={`btn ${tossCall === 'TAILS' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => { playSound('tap'); setTossCall('TAILS'); }}
                  disabled={isFlipping}
                >
                  🪙 Tails
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Animated Coin Flip Arena */}
      <div className="card" style={{ padding: '40px 20px', marginBottom: '32px' }}>
        <div className="coin-perspective">
          <div
            className={`coin ${isFlipping ? 'flipping' : ''}`}
            style={{
              transform: isFlipping ? undefined : `rotateY(${flipDegree}deg)`
            }}
          >
            {/* Heads Face */}
            <div className="coin-face coin-heads">
              <span style={{ fontSize: '2.4rem', marginBottom: '4px' }}>👑</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                HEADS
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>GULLY-CRICKET</span>
            </div>

            {/* Tails Face */}
            <div className="coin-face coin-tails">
              <span style={{ fontSize: '2.4rem', marginBottom: '4px' }}>⚡</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                TAILS
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>GULLY-CRICKET</span>
            </div>
          </div>
        </div>

        {/* Flip Button */}
        {!tossWinner && (
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleFlipCoin}
              className="btn btn-primary"
              disabled={isFlipping}
              style={{
                padding: '14px 42px',
                fontSize: '1.15rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 8px 24px var(--primary-glow)'
              }}
            >
              {isFlipping ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Flipping in the Air...</span>
                </>
              ) : (
                <>
                  <span>Spin Coin</span>
                  <span style={{ fontSize: '1.2rem' }}>🪙</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Winner Celebration Banner */}
        {tossWinner && (
          <div style={{ marginTop: '24px', animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
              border: '1px solid var(--accent-gold)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '520px',
              margin: '0 auto',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)'
            }}>
              <span style={{ fontSize: '2rem' }}>🎉</span>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: '8px 0' }}>
                Congratulations!
              </h2>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'var(--accent-gold)',
                marginBottom: '12px'
              }}>
                {tossWinner} won the toss!
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Coin landed on <strong>{coinResult}</strong> ({tossCaller} called {tossCall}).
                What would <strong>{tossWinner}</strong> like to choose?
              </p>

              {/* Bat First vs Bowl First Options */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button
                  onClick={() => handleDecisionConfirm('BAT')}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '14px', fontSize: '1rem' }}
                >
                  <span>🏏 Bat First</span>
                </button>
                <button
                  onClick={() => handleDecisionConfirm('BOWL')}
                  disabled={saving}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '14px', fontSize: '1rem', border: '1px solid var(--primary)' }}
                >
                  <span>🎯 Bowl First</span>
                </button>
              </div>

              {saving && (
                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                  Saving match to MongoDB and initializing innings telemetry...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalToss;
