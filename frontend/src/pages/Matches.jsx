import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchApi } from '../services/api';
import { useSound } from '../context/SoundContext';
import MatchCard from '../components/cricket/MatchCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { PlusCircle, Search, Trophy, Filter } from 'lucide-react';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalMatch, setDeleteModalMatch] = useState(null);

  const { playSound } = useSound();

  const fetchMatches = async (status = filterStatus) => {
    try {
      setLoading(true);
      setError('');
      const data = await matchApi.getAll(status === 'ALL' ? undefined : status);
      setMatches(data);
    } catch (err) {
      setError('Failed to load matches: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(filterStatus);
  }, [filterStatus]);

  const handleDelete = async () => {
    if (!deleteModalMatch) return;
    try {
      playSound('tap');
      await matchApi.delete(deleteModalMatch.id);
      setDeleteModalMatch(null);
      fetchMatches(filterStatus);
    } catch (err) {
      setError('Failed to delete match: ' + err.message);
    }
  };

  const filteredMatches = matches.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.teamA?.toLowerCase().includes(q) ||
      m.teamB?.toLowerCase().includes(q) ||
      m.location?.toLowerCase().includes(q)
    );
  });

  const statuses = [
    { key: 'ALL', label: 'All Matches' },
    { key: 'LIVE', label: '🔴 Live Now' },
    { key: 'UPCOMING', label: 'Upcoming' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
            Match Central
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Browse active tournaments, live scorers, and past match scorecards.
          </p>
        </div>

        <Link
          to="/match/new"
          className="btn btn-primary"
          style={{ padding: '10px 20px' }}
          onClick={() => playSound('tap')}
        >
          <PlusCircle size={18} />
          <span>New Match</span>
        </Link>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} retry={() => fetchMatches(filterStatus)} />

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '12px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => { playSound('tap'); setFilterStatus(s.key); }}
              className={`btn ${filterStatus === s.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '7px 14px', fontSize: '0.85rem' }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search teams or venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* Match Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Filtering matches..." />
      ) : filteredMatches.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredMatches.map((m) => (
            <MatchCard key={m.id} match={m} onDelete={(match) => setDeleteModalMatch(match)} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <Trophy size={42} color="var(--border-color)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No matches found</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
            {searchQuery ? 'Try adjusting your search query' : 'No matches found in this category.'}
          </p>
          <Link to="/match/new" className="btn btn-primary" onClick={() => playSound('tap')}>
            Schedule New Match
          </Link>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteModalMatch}
        title="Delete Match"
        message={`Are you sure you want to delete ${deleteModalMatch?.teamA} vs ${deleteModalMatch?.teamB}?`}
        confirmText="Delete Match"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalMatch(null)}
      />
    </div>
  );
};

export default Matches;
