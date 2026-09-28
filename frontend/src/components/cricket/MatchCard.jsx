import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Play, Award, FileText, Trash2, Shield, User } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

const MatchCard = ({ match, onDelete }) => {
  const { playSound } = useSound();

  const getStatusBadge = () => {
    switch (match.status) {
      case 'LIVE':
      case 'INNINGS_BREAK':
        return <span className="badge badge-live">LIVE</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed">COMPLETED</span>;
      case 'TOSS_DONE':
        return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>TOSS DONE</span>;
      default:
        return <span className="badge badge-upcoming">UPCOMING</span>;
    }
  };

  const getPrimaryAction = () => {
    if (match.status === 'LIVE' || match.status === 'INNINGS_BREAK') {
      return (
        <Link 
          to={`/scoring/${match.id}`} 
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => playSound('tap')}
        >
          <Play size={15} fill="currentColor" />
          <span>Live Scorer</span>
        </Link>
      );
    }
    if (match.status === 'TOSS_DONE') {
      return (
        <Link 
          to={`/match/${match.id}/playing-xi`} 
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => playSound('tap')}
        >
          <Play size={15} />
          <span>Playing XI</span>
        </Link>
      );
    }
    if (match.status === 'UPCOMING') {
      return (
        <Link 
          to={`/match/${match.id}/toss`} 
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => playSound('tap')}
        >
          <span>Digital Toss</span>
        </Link>
      );
    }
    return (
      <Link 
        to={`/match/${match.id}/scorecard`} 
        className="btn btn-secondary"
        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        onClick={() => playSound('tap')}
      >
        <FileText size={15} />
        <span>Full Scorecard</span>
      </Link>
    );
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Info & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} />
            {match.matchDate || 'Match Day'}
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} />
            {match.location || 'Local Ground'}
          </span>
          <span>•</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {match.totalOvers} Overs
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Teams and Scores Display */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Team A Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#032b1d'
            }}>
              {match.teamA.charAt(0)}
            </div>
            <span style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: match.winner === match.teamA ? 'var(--primary)' : 'var(--text-main)'
            }}>
              {match.teamA}
            </span>
            {match.winner === match.teamA && <Award size={16} color="var(--accent-gold)" />}
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem' }}>
            {match.scoreSummaryTeamA || '-'}
          </span>
        </div>

        {/* Team B Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#fff'
            }}>
              {match.teamB.charAt(0)}
            </div>
            <span style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: match.winner === match.teamB ? 'var(--primary)' : 'var(--text-main)'
            }}>
              {match.teamB}
            </span>
            {match.winner === match.teamB && <Award size={16} color="var(--accent-gold)" />}
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem' }}>
            {match.scoreSummaryTeamB || '-'}
          </span>
        </div>
      </div>

      {/* Toss or Result Summary Note & Creator Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          {match.resultDescription ? (
            <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
              🏆 {match.resultDescription}
            </span>
          ) : match.tossWinner ? (
            <span>
              🪙 {match.tossWinner} won toss and elected to {match.tossDecision?.toLowerCase()} first.
            </span>
          ) : (
            <span>Toss yet to take place.</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
          <User size={13} />
          <span>Created by: {match.createdByName || 'Scorer'}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {getPrimaryAction()}
          {match.status === 'COMPLETED' && (
            <Link
              to={`/match/${match.id}/result`}
              className="btn btn-outline-gold"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              onClick={() => playSound('tap')}
            >
              <Award size={15} />
              <span>Result Ceremony</span>
            </Link>
          )}
        </div>

        {onDelete && (
          <button
            onClick={() => { playSound('tap'); onDelete(match); }}
            title="Delete Match"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-dim)',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
