import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { teamApi, playerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import PlayerCard from '../components/cricket/PlayerCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { 
  Shield, 
  Plus, 
  ArrowLeft, 
  Users, 
  Lock, 
  Trophy, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';

const TeamDetails = () => {
  const { teamId } = useParams();
  const { user } = useAuth();
  const { playSound } = useSound();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add / Edit Player Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [deleteModalPlayer, setDeleteModalPlayer] = useState(null);

  // Player Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('BATSMAN');
  const [matches, setMatches] = useState(0);
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [ballsFaced, setBallsFaced] = useState(0);
  const [fours, setFours] = useState(0);
  const [sixes, setSixes] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchTeamAndPlayers = async () => {
    try {
      setLoading(true);
      setError('');
      const [teamData, playersData] = await Promise.all([
        teamApi.getById(teamId),
        teamApi.getTeamPlayers(teamId)
      ]);
      setTeam(teamData);
      setPlayers(playersData);
    } catch (err) {
      setError('Failed to load team squad details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAndPlayers();
  }, [teamId]);

  const isOwner = user?.id && team?.ownerId === user.id;

  const openAddPlayerModal = () => {
    if (!isOwner) return;
    playSound('tap');
    setEditingPlayer(null);
    setName('');
    setRole('BATSMAN');
    setMatches(0);
    setRuns(0);
    setWickets(0);
    setBallsFaced(0);
    setFours(0);
    setSixes(0);
    setHighestScore(0);
    setModalOpen(true);
  };

  const openEditPlayerModal = (player) => {
    if (!isOwner) return;
    playSound('tap');
    setEditingPlayer(player);
    setName(player.name);
    setRole(player.role);
    setMatches(player.matches || 0);
    setRuns(player.runs || 0);
    setWickets(player.wickets || 0);
    setBallsFaced(player.ballsFaced || 0);
    setFours(player.fours || 0);
    setSixes(player.sixes || 0);
    setHighestScore(player.highestScore || 0);
    setModalOpen(true);
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Player name is required');
      return;
    }

    try {
      setSaving(true);
      playSound('tap');
      const payload = {
        name: name.trim(),
        role,
        matches: Number(matches),
        runs: Number(runs),
        wickets: Number(wickets),
        ballsFaced: Number(ballsFaced),
        fours: Number(fours),
        sixes: Number(sixes),
        highestScore: Number(highestScore),
      };

      if (editingPlayer) {
        await playerApi.update(editingPlayer.id, payload);
      } else {
        await teamApi.addTeamPlayer(teamId, payload);
      }

      playSound('bat');
      setModalOpen(false);
      fetchTeamAndPlayers();
    } catch (err) {
      setError('Could not save player: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlayer = async () => {
    if (!deleteModalPlayer) return;
    try {
      playSound('tap');
      await playerApi.delete(deleteModalPlayer.id);
      setDeleteModalPlayer(null);
      fetchTeamAndPlayers();
    } catch (err) {
      setError('Failed to delete player: ' + err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading team roster and statistics..." />;
  }

  if (!team) {
    return <ErrorAlert message="Team not found." />;
  }

  const displayName = team.name || team.teamName;
  const teamColor = team.color || '#10B981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Back Navigation */}
      <div>
        <Link
          to="/teams"
          className="btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => playSound('tap')}
        >
          <ArrowLeft size={16} />
          <span>Back to All Teams</span>
        </Link>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* Team Header Showcase Card */}
      <div className="card" style={{
        padding: '32px',
        borderLeft: `6px solid ${teamColor}`,
        background: `linear-gradient(135deg, ${teamColor}15 0%, rgba(15, 23, 42, 0.9) 100%)`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              background: teamColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.8rem',
              color: '#fff',
              boxShadow: `0 8px 24px ${teamColor}66`
            }}>
              {team.shortCode ? team.shortCode.substring(0, 3) : displayName.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-main)' }}>
                  {team.shortCode || 'CLUB'}
                </span>
                {isOwner ? (
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                    TEAM OWNER
                  </span>
                ) : (
                  <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                    VIEW ONLY
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0 }}>
                {displayName}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                Squad roster: <strong>{players.length} Players</strong>
              </p>
            </div>
          </div>

          {/* Right Action: Add Player (Owner Only) */}
          <div>
            {isOwner ? (
              <button
                onClick={openAddPlayerModal}
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.95rem' }}
              >
                <Plus size={18} />
                <span>Add Player to {displayName}</span>
              </button>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                <Lock size={16} />
                <span>Only team owner can manage players</span>
              </div>
            )}
          </div>
        </div>

        {/* Team Match Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'rgba(0, 0, 0, 0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Matches</span>
            <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 800 }}>{team.matchesPlayed || 0}</span>
          </div>
          <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'rgba(0, 0, 0, 0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Wins</span>
            <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{team.matchesWon || 0}</span>
          </div>
          <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'rgba(0, 0, 0, 0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Losses</span>
            <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>{team.matchesLost || 0}</span>
          </div>
          <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'rgba(0, 0, 0, 0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Tied</span>
            <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{team.matchesTied || 0}</span>
          </div>
        </div>
      </div>

      {/* Players Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {displayName} Squad Lineup
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Only showing players registered under <strong>{displayName}</strong>.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={openAddPlayerModal}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add Player</span>
          </button>
        )}
      </div>

      {/* Squad Players Grid */}
      {players.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onEdit={isOwner ? openEditPlayerModal : undefined}
              onDelete={isOwner ? (p) => setDeleteModalPlayer(p) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <Users size={44} color="var(--border-color)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No players in {displayName} yet</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
            {isOwner ? 'Add players to this team squad so you can select them when scheduling matches.' : 'This team does not have any registered players yet.'}
          </p>
          {isOwner && (
            <button onClick={openAddPlayerModal} className="btn btn-primary">
              Add First Player
            </button>
          )}
        </div>
      )}

      {/* Add / Edit Player Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>
              {editingPlayer ? `Edit ${editingPlayer.name}` : `Add Player to ${displayName}`}
            </h3>

            <form onSubmit={handleSavePlayer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Player Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rohit Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Role *
                </label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="BATSMAN">Batsman</option>
                  <option value="BOWLER">Bowler</option>
                  <option value="ALL_ROUNDER">All-Rounder</option>
                  <option value="WICKET_KEEPER">Wicket Keeper</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Matches
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={matches}
                    onChange={(e) => setMatches(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Total Runs
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={runs}
                    onChange={(e) => setRuns(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Wickets
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={wickets}
                    onChange={(e) => setWickets(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Fours
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fours}
                    onChange={(e) => setFours(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Sixes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sixes}
                    onChange={(e) => setSixes(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Highest Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={highestScore}
                    onChange={(e) => setHighestScore(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Saving...' : editingPlayer ? 'Update Player' : 'Save to Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteModalPlayer}
        title="Delete Player"
        message={`Are you sure you want to delete ${deleteModalPlayer?.name} from ${displayName}?`}
        confirmText="Delete Player"
        isDanger={true}
        onConfirm={handleDeletePlayer}
        onCancel={() => setDeleteModalPlayer(null)}
      />
    </div>
  );
};

export default TeamDetails;
