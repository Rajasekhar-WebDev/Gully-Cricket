import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { teamApi } from '../services/api';
import { fastCache } from '../services/fastCache';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Shield, Plus, Edit2, Trash2, Users, Trophy, ArrowRight, Check } from 'lucide-react';

const Teams = () => {
  const cached = fastCache.get('gulli_teams_list', []);
  const [teams, setTeams] = useState(cached || []);
  const [loading, setLoading] = useState(cached.length === 0);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deleteModalTeam, setDeleteModalTeam] = useState(null);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [color, setColor] = useState('#10B981');
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const { playSound } = useSound();
  const navigate = useNavigate();

  const fetchTeams = async () => {
    try {
      if (teams.length === 0) setLoading(true);
      setError('');
      const data = await teamApi.getAll();
      const list = data || [];
      fastCache.set('gulli_teams_list', list);
      setTeams(list);
    } catch (err) {
      if (teams.length === 0) {
        setError('Failed to load teams: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const openAddModal = () => {
    playSound('tap');
    setEditingTeam(null);
    setTeamName('');
    setShortCode('');
    setColor('#10B981');
    setModalOpen(true);
  };

  const openEditModal = (e, team) => {
    e.stopPropagation();
    playSound('tap');
    setEditingTeam(team);
    setTeamName(team.name || team.teamName || '');
    setShortCode(team.shortCode || '');
    setColor(team.color || '#10B981');
    setModalOpen(true);
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setSaving(true);
      playSound('tap');
      const payload = {
        name: teamName.trim(),
        teamName: teamName.trim(),
        shortCode: shortCode.trim().toUpperCase() || teamName.trim().substring(0, 3).toUpperCase(),
        color,
      };

      if (editingTeam) {
        await teamApi.update(editingTeam.id, payload);
      } else {
        await teamApi.create(payload);
      }

      playSound('bat');
      setModalOpen(false);
      fetchTeams();
    } catch (err) {
      setError('Could not save team: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!deleteModalTeam) return;
    try {
      playSound('tap');
      await teamApi.delete(deleteModalTeam.id);
      setDeleteModalTeam(null);
      fetchTeams();
    } catch (err) {
      setError('Failed to delete team: ' + err.message);
    }
  };

  const filteredTeams = teams.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.teamName && t.teamName.toLowerCase().includes(q)) ||
      (t.shortCode && t.shortCode.toLowerCase().includes(q))
    );
  });

  const presetColors = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EAB308'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
            Club & Gully Teams
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Browse cricket clubs, manage team rosters, or register your own neighborhood team.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn btn-primary"
          style={{ padding: '10px 20px' }}
        >
          <Plus size={18} />
          <span>Create New Team</span>
        </button>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} retry={fetchTeams} />

      {/* Search Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '12px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        maxWidth: '420px'
      }}>
        <input
          type="text"
          placeholder="Search teams by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        />
      </div>

      {/* Teams Grid */}
      {loading ? (
        <LoadingSpinner message="Loading teams directory..." />
      ) : filteredTeams.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredTeams.map((team) => {
            const isOwner = user?.id && team.ownerId === user.id;
            const displayName = team.name || team.teamName;
            const teamColor = team.color || '#10B981';

            return (
              <div
                key={team.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  borderLeft: `4px solid ${teamColor}`
                }}
                onClick={() => {
                  playSound('tap');
                  navigate(`/teams/${team.id}`);
                }}
              >
                {/* Team Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: teamColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: '#fff',
                      boxShadow: `0 4px 12px ${teamColor}55`
                    }}>
                      {team.shortCode ? team.shortCode.substring(0, 3) : displayName.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{displayName}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Code: <strong>{team.shortCode || 'N/A'}</strong>
                      </span>
                    </div>
                  </div>

                  {isOwner ? (
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      OWNER
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)' }}>
                      TEAM
                    </span>
                  )}
                </div>

                {/* Team Stats Summary */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Played</span>
                    <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 700 }}>{team.matchesPlayed || 0}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Won</span>
                    <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{team.matchesWon || 0}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Lost</span>
                    <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 700, color: '#f87171' }}>{team.matchesLost || 0}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Tied</span>
                    <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{team.matchesTied || 0}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: 'auto'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <Users size={16} />
                    <span>View Players</span>
                    <ArrowRight size={14} />
                  </span>

                  {isOwner && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => openEditModal(e, team)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        title="Edit Team"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound('tap');
                          setDeleteModalTeam(team);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#ef4444' }}
                        title="Delete Team"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <Shield size={44} color="var(--border-color)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No teams found</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
            {searchQuery ? 'Try adjusting your search query' : 'Create your first cricket squad to start organizing matches!'}
          </p>
          <button onClick={openAddModal} className="btn btn-primary">
            Create Team
          </button>
        </div>
      )}

      {/* Add / Edit Team Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>
              {editingTeam ? 'Edit Team Details' : 'Register New Team'}
            </h3>

            <form onSubmit={handleSaveTeam} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Team Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Warriors"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Short Code (2-4 Letters)
                </label>
                <input
                  type="text"
                  placeholder="e.g. RW"
                  maxLength={5}
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '8px' }}>
                  Team Theme Color
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: c,
                        border: color === c ? '3px solid #fff' : '2px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: color === c ? '0 0 10px ' + c : 'none'
                      }}
                    >
                      {color === c && <Check size={16} color="#fff" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ width: '40px', height: '34px', padding: 0, cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
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
                  {saving ? 'Saving...' : editingTeam ? 'Update Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteModalTeam}
        title="Delete Team"
        message={`Are you sure you want to delete ${deleteModalTeam?.name || deleteModalTeam?.teamName}? All players in this team will also be deleted.`}
        confirmText="Delete Team"
        isDanger={true}
        onConfirm={handleDeleteTeam}
        onCancel={() => setDeleteModalTeam(null)}
      />
    </div>
  );
};

export default Teams;
