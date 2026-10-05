import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamApi, playerApi } from '../services/api';
import { useSound } from '../context/SoundContext';
import ErrorAlert from '../components/common/ErrorAlert';
import { PlusCircle, ArrowRight, Shield, Calendar, MapPin, Hash, Users } from 'lucide-react';

const CreateMatch = () => {
  const [teams, setTeams] = useState([]);
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [teamA, setTeamA] = useState('Gully Super Kings');
  const [teamB, setTeamB] = useState('Street Challengers');
  const [totalOvers, setTotalOvers] = useState(5);
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('Main Street Ground');
  const [error, setError] = useState('');

  // Previews of team players
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);

  const navigate = useNavigate();
  const { playSound } = useSound();

  useEffect(() => {
    teamApi.getAll()
      .then((data) => {
        setTeams(data);
        if (data.length >= 2) {
          setTeamAId(data[0].id);
          setTeamA(data[0].name || data[0].teamName);
          setTeamBId(data[1].id);
          setTeamB(data[1].name || data[1].teamName);
        } else if (data.length === 1) {
          setTeamAId(data[0].id);
          setTeamA(data[0].name || data[0].teamName);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Team A players whenever teamA or teamAId changes
  useEffect(() => {
    if (teamAId) {
      teamApi.getTeamPlayers(teamAId)
        .then(setTeamAPlayers)
        .catch(() => setTeamAPlayers([]));
    } else if (teamA) {
      playerApi.getByTeam(teamA)
        .then(setTeamAPlayers)
        .catch(() => setTeamAPlayers([]));
    }
  }, [teamAId, teamA]);

  // Fetch Team B players whenever teamB or teamBId changes
  useEffect(() => {
    if (teamBId) {
      teamApi.getTeamPlayers(teamBId)
        .then(setTeamBPlayers)
        .catch(() => setTeamBPlayers([]));
    } else if (teamB) {
      playerApi.getByTeam(teamB)
        .then(setTeamBPlayers)
        .catch(() => setTeamBPlayers([]));
    }
  }, [teamBId, teamB]);

  const handleSelectTeamA = (selectedId) => {
    setTeamAId(selectedId);
    const found = teams.find(t => t.id === selectedId);
    if (found) setTeamA(found.name || found.teamName);
  };

  const handleSelectTeamB = (selectedId) => {
    setTeamBId(selectedId);
    const found = teams.find(t => t.id === selectedId);
    if (found) setTeamB(found.name || found.teamName);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!teamA.trim() || !teamB.trim()) {
      setError('Both Team A and Team B names are required.');
      return;
    }

    if (teamA.trim().toLowerCase() === teamB.trim().toLowerCase()) {
      setError('Teams cannot have the same name. Please select distinct teams.');
      return;
    }

    if (teamAId && teamBId && teamAId === teamBId) {
      setError('Teams cannot be identical. Please choose two distinct teams.');
      return;
    }

    // Ensure overs selection is defined (allow 0 for Test Match)
    if (totalOvers === '' || totalOvers === null || totalOvers === undefined) {
        setError('Number of overs must be selected.');
        return;
    }
    if (Number(totalOvers) < 0) {
        setError('Number of overs cannot be negative.');
        return;
    }
    // Zero overs (Test Match) is allowed; no further validation needed


    if (!matchDate.trim()) {
      setError('Match date is required.');
      return;
    }

    if (!location.trim()) {
      setError('Match location is required.');
      return;
    }

    playSound('coin');

    // Proceed to Digital Coin Toss with configured parameters and team IDs
    navigate('/match/toss', {
      state: {
        teamA: teamA.trim(),
        teamB: teamB.trim(),
        teamAId,
        teamBId,
        totalOvers: Number(totalOvers),
        matchDate,
        location: location.trim(),
      },
    });
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
          Schedule New Match
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Choose opposing teams and format. Each team's players are strictly isolated.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      <form onSubmit={handleSubmit} className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Teams Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Shield size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem' }}>Teams Selection</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Team A Picker */}
            <div className="card" style={{ padding: '18px', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: '#34d399' }}>
                Team 1 (Home) *
              </label>
              {teams.length > 0 ? (
                <select
                  value={teamAId}
                  onChange={(e) => handleSelectTeamA(e.target.value)}
                  style={{ marginBottom: '12px' }}
                >
                  <option value="">Select from Registered Teams</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.teamName} ({t.shortCode || 'N/A'})
                    </option>
                  ))}
                </select>
              ) : null}

              <input
                type="text"
                placeholder="Team 1 Name"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                required
              />

              {/* Team 1 Isolated Players Preview */}
              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={13} />
                  <span>{teamA} Roster ({teamAPlayers.length})</span>
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {teamAPlayers.length > 0 ? (
                    teamAPlayers.slice(0, 6).map((p, idx) => (
                      <span key={idx} className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.72rem' }}>
                        {p.name}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No players added to this team yet</span>
                  )}
                  {teamAPlayers.length > 6 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+{teamAPlayers.length - 6} more</span>
                  )}
                </div>
              </div>
            </div>

            {/* Team B Picker */}
            <div className="card" style={{ padding: '18px', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: '#60a5fa' }}>
                Team 2 (Away) *
              </label>
              {teams.length > 0 ? (
                <select
                  value={teamBId}
                  onChange={(e) => handleSelectTeamB(e.target.value)}
                  style={{ marginBottom: '12px' }}
                >
                  <option value="">Select from Registered Teams</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.teamName} ({t.shortCode || 'N/A'})
                    </option>
                  ))}
                </select>
              ) : null}

              <input
                type="text"
                placeholder="Team 2 Name"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                required
              />

              {/* Team 2 Isolated Players Preview */}
              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={13} />
                  <span>{teamB} Roster ({teamBPlayers.length})</span>
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {teamBPlayers.length > 0 ? (
                    teamBPlayers.slice(0, 6).map((p, idx) => (
                      <span key={idx} className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.72rem' }}>
                        {p.name}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No players added to this team yet</span>
                  )}
                  {teamBPlayers.length > 6 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+{teamBPlayers.length - 6} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Settings Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Hash size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem' }}>Match Format & Logistics</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                Number of Overs *
              </label>
              <select
                value={totalOvers}
                onChange={(e) => setTotalOvers(e.target.value)}
                required
              >
                <option value={3}>3 Overs (Super Quick)</option>
                <option value={5}>5 Overs (Standard Gully)</option>
                <option value={8}>8 Overs</option>
                <option value={10}>10 Overs (T10)</option>
                <option value={12}>12 Overs</option>
                <option value={15}>15 Overs</option>
                <option value={20}>20 Overs (T20 Pro)</option>
                <option value={0}>Test Match (no overs limit)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                Match Date *
              </label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                Location / Ground *
              </label>
              <input
                type="text"
                placeholder="e.g. Main Street Ground"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Flow Note Banner */}
        <div style={{
          padding: '16px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '1.4rem' }}>🪙</span>
          <span>
            You are creating this match as the <strong>Match Creator</strong>. You will hold exclusive authorization to record live deliveries and update scores.
          </span>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem' }}
          >
            <span>Proceed to Digital Toss</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMatch;
