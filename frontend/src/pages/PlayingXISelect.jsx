import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { matchApi, playerApi, teamApi } from '../services/api';
import { useSound } from '../context/SoundContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { Users, Play, Shield, Plus, Check } from 'lucide-react';

const PlayingXISelect = () => {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const { playSound } = useSound();

  const [match, setMatch] = useState(null);
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  const [selectedTeamA, setSelectedTeamA] = useState([]);
  const [selectedTeamB, setSelectedTeamB] = useState([]);

  const [openingStriker, setOpeningStriker] = useState('');
  const [openingNonStriker, setOpeningNonStriker] = useState('');
  const [openingBowler, setOpeningBowler] = useState('');

  const [customPlayerName, setCustomPlayerName] = useState('');
  const [customPlayerTeam, setCustomPlayerTeam] = useState('A');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const matchData = await matchApi.getById(matchId);
        setMatch(matchData);

        let pTeamA = [];
        let pTeamB = [];

        if (matchData.teamAId) {
          try { pTeamA = await teamApi.getTeamPlayers(matchData.teamAId); } catch (e) { pTeamA = []; }
        }
        if (matchData.teamBId) {
          try { pTeamB = await teamApi.getTeamPlayers(matchData.teamBId); } catch (e) { pTeamB = []; }
        }

        if (pTeamA.length === 0 || pTeamB.length === 0) {
          const allPlayers = await playerApi.getAll();
          if (pTeamA.length === 0) {
            pTeamA = allPlayers.filter(p => (matchData.teamAId && p.teamId === matchData.teamAId) || p.teamName?.toLowerCase() === matchData.teamA.toLowerCase());
          }
          if (pTeamB.length === 0) {
            pTeamB = allPlayers.filter(p => (matchData.teamBId && p.teamId === matchData.teamBId) || p.teamName?.toLowerCase() === matchData.teamB.toLowerCase());
          }
        }

        setTeamAPlayers(pTeamA);
        setTeamBPlayers(pTeamB);

        // Pre-select players or default to all in roster
        const selA = pTeamA.map(p => p.name);
        const selB = pTeamB.map(p => p.name);
        setSelectedTeamA(selA);
        setSelectedTeamB(selB);

        // Determine batting first team for opening pick
        const isTeamABatting = matchData.battingTeamFirst === matchData.teamA;
        const battingRoster = isTeamABatting ? selA : selB;
        const bowlingRoster = isTeamABatting ? selB : selA;

        // Auto-select first available players for opener dropdowns
        if (battingRoster.length >= 1) {
          setOpeningStriker(battingRoster[0]);
        }
        if (battingRoster.length >= 2) {
          setOpeningNonStriker(battingRoster[1]);
        }
        if (bowlingRoster.length >= 1) {
          setOpeningBowler(bowlingRoster[0]);
        }
      } catch (err) {
        setError('Failed to load match or squad data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  const togglePlayerSelection = (team, playerName) => {
    playSound('tap');
    if (team === 'A') {
      setSelectedTeamA(prev =>
        prev.includes(playerName) ? prev.filter(p => p !== playerName) : [...prev, playerName]
      );
    } else {
      setSelectedTeamB(prev =>
        prev.includes(playerName) ? prev.filter(p => p !== playerName) : [...prev, playerName]
      );
    }
  };

  const handleAddQuickPlayer = async (e) => {
    e.preventDefault();
    if (!customPlayerName.trim()) return;

    try {
      playSound('tap');
      const targetTeamId = customPlayerTeam === 'A' ? match.teamAId : match.teamBId;
      const teamName = customPlayerTeam === 'A' ? match.teamA : match.teamB;
      let created;
      if (targetTeamId) {
        created = await teamApi.addTeamPlayer(targetTeamId, {
          name: customPlayerName.trim(),
          role: 'ALL_ROUNDER',
        });
      } else {
        created = await playerApi.create({
          name: customPlayerName.trim(),
          teamName,
          role: 'ALL_ROUNDER',
        });
      }

      if (customPlayerTeam === 'A') {
        setTeamAPlayers(prev => [...prev, created]);
        setSelectedTeamA(prev => [...prev, created.name]);
      } else {
        setTeamBPlayers(prev => [...prev, created]);
        setSelectedTeamB(prev => [...prev, created.name]);
      }
      setCustomPlayerName('');
    } catch (err) {
      setError('Could not create quick player: ' + err.message);
    }
  };

  const handleConfirmXI = async () => {
    if (!openingStriker.trim() || !openingNonStriker.trim() || !openingBowler.trim()) {
      setError('Please select Opening Batter 1 (*), Opening Batter 2, and Opening Bowler.');
      return;
    }

    if (openingStriker.trim().toLowerCase() === openingNonStriker.trim().toLowerCase()) {
      setError('Opening Batter 1 (*) and Opening Batter 2 must be distinct batsmen.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      playSound('bat');

      await matchApi.setPlayingXI(matchId, {
        teamAPlayingXI: selectedTeamA,
        teamBPlayingXI: selectedTeamB,
        openingStriker: openingStriker.trim(),
        openingNonStriker: openingNonStriker.trim(),
        openingBowler: openingBowler.trim(),
      });

      navigate(`/scoring/${matchId}`);
    } catch (err) {
      setError('Failed to save playing XI: ' + err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading squad roster and match lineups..." />;
  }

  const isTeamABatting = match?.battingTeamFirst === match?.teamA;
  const battingTeamName = match?.battingTeamFirst;
  const bowlingTeamName = match?.bowlingTeamFirst;
  const battingPlayers = isTeamABatting ? selectedTeamA : selectedTeamB;
  const bowlingPlayers = isTeamABatting ? selectedTeamB : selectedTeamA;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
          Select Playing Squad & Openers
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          <strong>{match.teamA}</strong> vs <strong>{match.teamB}</strong> • Toss won by {match.tossWinner} (Elected to {match.tossDecision?.toLowerCase()})
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* Opening Batter & Bowler Selection Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.4)',
        padding: '28px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Play size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1.2rem' }}>Match Inauguration: Opening Lineup</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Batting First: <strong>{battingTeamName}</strong> (Opening Batter 1 *)
            </label>
            <select
              id="opening-striker-select"
              value={openingStriker}
              onChange={(e) => {
                setOpeningStriker(e.target.value);
                // Reset non-striker if it conflicts
                if (e.target.value === openingNonStriker) setOpeningNonStriker('');
              }}
              required
            >
              <option value="">-- Select Opening Batter 1 --</option>
              {battingPlayers.map((p, idx) => (
                <option key={idx} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Batting First: <strong>{battingTeamName}</strong> (Opening Batter 2)
            </label>
            <select
              id="opening-non-striker-select"
              value={openingNonStriker}
              onChange={(e) => setOpeningNonStriker(e.target.value)}
              required
            >
              <option value="">-- Select Opening Batter 2 --</option>
              {battingPlayers.filter(p => p !== openingStriker).map((p, idx) => (
                <option key={idx} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Bowling First: <strong>{bowlingTeamName}</strong> (Opening Bowler)
            </label>
            <select
              id="opening-bowler-select"
              value={openingBowler}
              onChange={(e) => setOpeningBowler(e.target.value)}
              required
            >
              <option value="">-- Select Bowler --</option>
              {bowlingPlayers.map((p, idx) => (
                <option key={idx} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Two Columns: Team A & Team B Squad Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Team A Squad */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>{match.teamA} Squad ({selectedTeamA.length} picked)</h3>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>TEAM A</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
            {teamAPlayers.map((p) => {
              const selected = selectedTeamA.includes(p.name);
              return (
                <div
                  key={p.id}
                  onClick={() => togglePlayerSelection('A', p.name)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: selected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${selected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{p.role}</span>
                  </div>
                  {selected && <Check size={18} color="var(--primary)" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Team B Squad */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>{match.teamB} Squad ({selectedTeamB.length} picked)</h3>
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>TEAM B</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
            {teamBPlayers.map((p) => {
              const selected = selectedTeamB.includes(p.name);
              return (
                <div
                  key={p.id}
                  onClick={() => togglePlayerSelection('B', p.name)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: selected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${selected ? '#3b82f6' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{p.role}</span>
                  </div>
                  {selected && <Check size={18} color="#3b82f6" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Add Player Inline Form */}
      <div className="card" style={{ padding: '20px', marginBottom: '28px' }}>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--text-muted)' }}>
          Need to add a player quickly to the squad?
        </h4>
        <form onSubmit={handleAddQuickPlayer} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Player Name (e.g. Suresh Kumar)"
            value={customPlayerName}
            onChange={(e) => setCustomPlayerName(e.target.value)}
            style={{ flex: 2, minWidth: '200px' }}
          />
          <select
            value={customPlayerTeam}
            onChange={(e) => setCustomPlayerTeam(e.target.value)}
            style={{ flex: 1, minWidth: '150px' }}
          >
            <option value="A">{match.teamA}</option>
            <option value="B">{match.teamB}</option>
          </select>
          <button type="submit" className="btn btn-secondary">
            <Plus size={16} />
            <span>Add Player</span>
          </button>
        </form>
      </div>

      {/* Confirm & Launch Scorer Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
        <button
          onClick={handleConfirmXI}
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: '14px 36px', fontSize: '1.05rem', boxShadow: '0 8px 24px var(--primary-glow)' }}
        >
          <Play size={18} fill="currentColor" />
          <span>{saving ? 'Saving Lineup...' : 'Start Live Cricket Scoring'}</span>
        </button>
      </div>
    </div>
  );
};

export default PlayingXISelect;
