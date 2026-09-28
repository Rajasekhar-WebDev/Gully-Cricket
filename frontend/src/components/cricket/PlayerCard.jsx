import React from 'react';
import { Edit2, Trash2, Shield } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

const PlayerCard = ({ player, onEdit, onDelete }) => {
  const { playSound } = useSound();

  const getRoleBadge = () => {
    switch (player.role) {
      case 'BATSMAN':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>BATSMAN</span>;
      case 'BOWLER':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>BOWLER</span>;
      case 'ALL_ROUNDER':
        return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>ALL ROUNDER</span>;
      case 'WICKET_KEEPER':
        return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>WK / BATSMAN</span>;
      default:
        return <span className="badge">{player.role}</span>;
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>{player.name}</h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{player.teamName}</span>
        </div>
        {getRoleBadge()}
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.5)',
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center'
      }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Matches</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem' }}>{player.matches}</span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Runs</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: '#60a5fa' }}>{player.runs}</span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Wickets</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: '#f87171' }}>{player.wickets}</span>
        </div>
      </div>

      {/* Secondary Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>SR: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{player.battingStrikeRate || 0}</strong></span>
        <span>Econ: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{player.bowlingEconomy || 0}</strong></span>
        <span>Best: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{player.highestScore || 0}</strong></span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
        {onEdit && (
          <button
            onClick={() => { playSound('tap'); onEdit(player); }}
            title="Edit Player"
            style={{ padding: '6px', color: 'var(--text-dim)', borderRadius: 'var(--radius-sm)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            <Edit2 size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => { playSound('tap'); onDelete(player); }}
            title="Delete Player"
            style={{ padding: '6px', color: 'var(--text-dim)', borderRadius: 'var(--radius-sm)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
