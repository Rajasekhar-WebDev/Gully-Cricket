import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { playerApi, teamApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import PlayerCard from '../components/cricket/PlayerCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Users, Plus, Search, Shield, ArrowRight, Lock } from 'lucide-react';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedTeamId, setSelectedTeamId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [deleteModalPlayer, setDeleteModalPlayer] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [formTeamId, setFormTeamId] = useState('');
  const [role, setRole] = useState('BATSMAN');
  const [matches, setMatches] = useState(0);
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [ballsFaced, setBallsFaced] = useState(0);
  const [fours, setFours] = useState(0);
  const [sixes, setSixes] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const { playSound } = useSound();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [playersData, teamsData] = await Promise.all([
        playerApi.getAll(),
        teamApi.getAll()
      ]);
      setPlayers(playersData);
      setTeams(teamsData);
      if (teamsData.length > 0 && !formTeamId) {
        setFormTeamId(teamsData[0].id);
      }
    } catch (err) {
      setError('Failed to load player roster: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    playSound('tap');
    setEditingPlayer(null);
    setName('');
    if (teams.length > 0) {
      // Default to team user owns if any, or first team
      const owned = teams.find(t => t.ownerId === user?.id);
      setFormTeamId(owned ? owned.id : teams[0].id);
    }
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

  const openEditModal = (player) => {
    playSound('tap');
    setEditingPlayer(player);
    setName(player.name);
    setFormTeamId(player.teamId || (teams.find(t => t.name?.toLowerCase() === player.teamName?.toLowerCase())?.id || ''));
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
    if (!formTeamId) {
      setError('Please select a team for this player');
      return;
    }

    const selectedTeam = teams.find(t => t.id === formTeamId);
    if (!selectedTeam) {
      setError('Selected team does not exist');
      return;
    }

    try {
      setSaving(true);
      playSound('tap');
      const payload = {
        name: name.trim(),
        teamId: formTeamId,
        teamName: selectedTeam.name || selectedTeam.teamName,
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
        await teamApi.addTeamPlayer(formTeamId, payload);
      }

      playSound('bat');
      setModalOpen(false);
      fetchData();
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
      fetchData();
    } catch (err) {
      setError('Failed to delete player: ' + err.message);
    }
  };

  // Filter players
  const filteredPlayers = players.filter(p => {
    const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;
    const matchesTeam = selectedTeamId === 'ALL' || 
                        (p.teamId && p.teamId === selectedTeamId) || 
                        (!p.teamId && teams.find(t => t.id === selectedTeamId)?.name?.toLowerCase() === p.teamName?.toLowerCase());
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.teamName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesTeam && matchesSearch;
  });

  const selectedTeamObj = teams.find(t => t.id === selectedTeamId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
            Player Directory & Squads
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Every player is affiliated with a specific team. Team owners can manage their players.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn btn-primary"
          style={{ padding: '10px 20px' }}
        >
          <Plus size={18} />
          <span>Add New Player</span>
        </button>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} retry={fetchData} />

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Role Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'].map((r) => (
            <button
              key={r}
              onClick={() => { playSound('tap'); setRoleFilter(r); }}
              className={`btn ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Team Filter */}
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            style={{ width: 'auto', minWidth: '180px', padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Teams</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>
                {t.name || t.teamName} {t.ownerId === user?.id ? '★ (Yours)' : ''}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '200px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.85rem', padding: '8px 12px 8px 34px' }}
            />
          </div>
        </div>
      </div>

      {/* Team Specific Banner if a team is filtered */}
      {selectedTeamObj && (
        <div style={{
          padding: '14px 20px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color="var(--primary)" />
            <span style={{ fontSize: '0.92rem' }}>
              Showing only players registered to <strong>{selectedTeamObj.name || selectedTeamObj.teamName}</strong> ({filteredPlayers.length} players)
            </span>
          </div>
          <Link
            to={`/teams/${selectedTeamObj.id}`}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <span>Open Team Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Players Grid */}
      {loading ? (
        <LoadingSpinner message="Loading player statistics..." />
      ) : filteredPlayers.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredPlayers.map((p) => {
            const playerTeam = teams.find(t => t.id === p.teamId || t.name?.toLowerCase() === p.teamName?.toLowerCase());
            const canManage = user?.id && playerTeam?.ownerId === user.id;

            return (
              <PlayerCard
                key={p.id}
                player={p}
                onEdit={canManage ? openEditModal : undefined}
                onDelete={canManage ? (player) => setDeleteModalPlayer(player) : undefined}
              />
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <Users size={42} color="var(--border-color)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No players found</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
            Try adjusting your search criteria or add new players to a team.
          </p>
          <button onClick={openAddModal} className="btn btn-primary">
            Add Player
          </button>
        </div>
      )}

      {/* Add / Edit Player Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>
              {editingPlayer ? 'Edit Player Details' : 'Add New Player'}
            </h3>

            <form onSubmit={handleSavePlayer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Player Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Virat Kohli"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Assigned Team *
                  </label>
                  <select
                    value={formTeamId}
                    onChange={(e) => setFormTeamId(e.target.value)}
                    required
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name || t.teamName} {t.ownerId === user?.id ? '★ (Your Team)' : ''}
                      </option>
                    ))}
                  </select>
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
                  {saving ? 'Saving...' : editingPlayer ? 'Update Player' : 'Create Player'}
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
        message={`Are you sure you want to delete ${deleteModalPlayer?.name}? This action cannot be undone.`}
        confirmText="Delete Player"
        isDanger={true}
        onConfirm={handleDeletePlayer}
        onCancel={() => setDeleteModalPlayer(null)}
      />
    </div>
  );
};

export default Players;
