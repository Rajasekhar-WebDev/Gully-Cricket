import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { scoringApi, matchApi, teamApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { 
  RotateCcw, 
  Award, 
  FileText, 
  AlertCircle, 
  User, 
  ChevronRight, 
  RefreshCw,
  Trophy,
  Lock,
  Flag
} from 'lucide-react';

const LiveScoring = () => {
  const { id: matchId } = useParams();
  const { user } = useAuth();
  const { playSound } = useSound();

  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Team player rosters for this match (filtered by team)
  const [battingTeamPlayers, setBattingTeamPlayers] = useState([]);
  const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState([]);
  // Track which innings we last loaded rosters for (so we reload when teams swap in innings 2)
  const [lastLoadedInnings, setLastLoadedInnings] = useState(null);

  // Modals state
  const [wicketModalOpen, setWicketModalOpen] = useState(false);
  const [bowlerModalOpen, setBowlerModalOpen] = useState(false);
  const [innings2ModalOpen, setInnings2ModalOpen] = useState(false);
  const [dismissalType, setDismissalType] = useState('BOWLED');
  const [dismissedBatsman, setDismissedBatsman] = useState('');
  const [fielderName, setFielderName] = useState('');
  const [newBatsmanName, setNewBatsmanName] = useState('');
  const [nextBowlerName, setNextBowlerName] = useState('');

  // Innings 2 Opener setup state
  const [innings2Striker, setInnings2Striker] = useState('');
  const [innings2NonStriker, setInnings2NonStriker] = useState('');
  const [innings2Bowler, setInnings2Bowler] = useState('');

  const loadScorecard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await scoringApi.getScorecard(matchId);
      setScorecard(data);

      // Load team player rosters for current innings
      const m = data?.match;
      const currentInningsData = data?.currentInnings;
      const currentInningsNum = m?.currentInnings;

      if (m && currentInningsData) {
        const isTeamABatting = currentInningsData.battingTeam && m.teamA && currentInningsData.battingTeam.trim().toLowerCase() === m.teamA.trim().toLowerCase();
        const battingTeamId = isTeamABatting ? m.teamAId : m.teamBId;
        const bowlingTeamId = isTeamABatting ? m.teamBId : m.teamAId;
        const battingTeamName = currentInningsData.battingTeam;
        const bowlingTeamName = currentInningsData.bowlingTeam;
        const battingPlayingXI = isTeamABatting ? m.teamAPlayingXI : m.teamBPlayingXI;
        const bowlingPlayingXI = isTeamABatting ? m.teamBPlayingXI : m.teamAPlayingXI;

        try {
          let bPlayers = [];
          if (Array.isArray(battingPlayingXI) && battingPlayingXI.length > 0) {
            bPlayers = battingPlayingXI.filter(Boolean).map((name, idx) => ({
              id: `xi_bat_${idx}`,
              name: name.trim(),
              role: 'BATSMAN',
              teamName: battingTeamName
            }));
          }

          let bwPlayers = [];
          if (Array.isArray(bowlingPlayingXI) && bowlingPlayingXI.length > 0) {
            bwPlayers = bowlingPlayingXI.filter(Boolean).map((name, idx) => ({
              id: `xi_bowl_${idx}`,
              name: name.trim(),
              role: 'BOWLER',
              teamName: bowlingTeamName
            }));
          }

          try {
            let fetchedBat = battingTeamId ? await teamApi.getTeamPlayers(battingTeamId).catch(() => []) : [];
            if ((!fetchedBat || !fetchedBat.length) && battingTeamName) {
              fetchedBat = await playerApi.getByTeam(battingTeamName).catch(() => []);
            }
            if (Array.isArray(fetchedBat) && fetchedBat.length > 0) {
              const existing = new Set(bPlayers.map(p => p.name?.trim()?.toLowerCase()));
              fetchedBat.forEach(p => {
                const pTeam = p.teamName || p.team;
                const matchesTeam = !pTeam || (battingTeamName && pTeam.trim().toLowerCase() === battingTeamName.trim().toLowerCase());
                if (p.name && matchesTeam && !existing.has(p.name.trim().toLowerCase())) {
                  bPlayers.push(p);
                }
              });
            }
          } catch (e) {}

          try {
            let fetchedBowl = bowlingTeamId ? await teamApi.getTeamPlayers(bowlingTeamId).catch(() => []) : [];
            if ((!fetchedBowl || !fetchedBowl.length) && bowlingTeamName) {
              fetchedBowl = await playerApi.getByTeam(bowlingTeamName).catch(() => []);
            }
            if (Array.isArray(fetchedBowl) && fetchedBowl.length > 0) {
              const existing = new Set(bwPlayers.map(p => p.name?.trim()?.toLowerCase()));
              fetchedBowl.forEach(p => {
                const pTeam = p.teamName || p.team;
                const matchesTeam = !pTeam || (bowlingTeamName && pTeam.trim().toLowerCase() === bowlingTeamName.trim().toLowerCase());
                if (p.name && matchesTeam && !existing.has(p.name.trim().toLowerCase())) {
                  bwPlayers.push(p);
                }
              });
            }
          } catch (e) {}

          setBattingTeamPlayers(bPlayers);
          setBowlingTeamPlayers(bwPlayers);
          setLastLoadedInnings(currentInningsNum);
        } catch (teamErr) {
          console.warn('Could not load team player rosters:', teamErr.message);
        }
      }
    } catch (err) {
      setError('Could not load match scorecard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScorecard();
  }, [matchId]);

  const match = scorecard?.match;
  const currentInnings = scorecard?.currentInnings;
  const activeBatsmen = currentInnings?.battingStats?.filter(b => !b.isOut) || [];

  const strikerName = currentInnings?.currentStrikerName;
  const nonStrikerName = currentInnings?.currentNonStrikerName;
  const bowlerName = currentInnings?.currentBowlerName;

  const striker = (strikerName && activeBatsmen.find(b => b.playerName?.trim().toLowerCase() === strikerName.trim().toLowerCase()))
    || activeBatsmen.find(b => b.isOnStrike)
    || activeBatsmen[0];

  const nonStriker = (nonStrikerName && activeBatsmen.find(b => b.playerName?.trim().toLowerCase() === nonStrikerName.trim().toLowerCase()))
    || activeBatsmen.find(b => b !== striker && !b.isOnStrike)
    || activeBatsmen.find(b => b !== striker)
    || activeBatsmen[1];

  const currentBowler = (bowlerName && currentInnings?.bowlingStats?.find(b => b.playerName?.trim().toLowerCase() === bowlerName.trim().toLowerCase()))
    || currentInnings?.bowlingStats?.find(b => b.isCurrentBowler)
    || currentInnings?.bowlingStats?.[0];

  // Build current active batsmen on crease list dynamically
  const batsmenOnCrease = [];
  if (striker) {
    batsmenOnCrease.push({ ...striker, isCurrentFacing: true });
  } else if (strikerName) {
    batsmenOnCrease.push({ playerName: strikerName, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: '0.0', isCurrentFacing: true });
  }

  if (nonStriker && nonStriker.playerName?.toLowerCase() !== striker?.playerName?.toLowerCase()) {
    batsmenOnCrease.push({ ...nonStriker, isCurrentFacing: false });
  } else if (nonStrikerName && nonStrikerName.toLowerCase() !== strikerName?.toLowerCase()) {
    batsmenOnCrease.push({ playerName: nonStrikerName, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: '0.0', isCurrentFacing: false });
  }

  if (batsmenOnCrease.length < 2) {
    const remainingActive = activeBatsmen.filter(b => !batsmenOnCrease.some(c => c.playerName?.toLowerCase() === b.playerName?.toLowerCase()));
    for (const b of remainingActive) {
      if (batsmenOnCrease.length < 2) {
        batsmenOnCrease.push({ ...b, isCurrentFacing: false });
      }
    }
  }

  const isMatchCreator = !match?.createdBy || (user?.id && match.createdBy === user.id);

  const handleEndMatch = async () => {
    if (!isMatchCreator || submitting || !match) return;
    try {
      setSubmitting(true);
      playSound('tap');
      await matchApi.updateStatus(matchId, 'COMPLETED');
      loadScorecard();
    } catch (err) {
      setError('Failed to end match: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit standard ball delivery
  const handleScoreEvent = async ({ runsOffBat = 0, extrasType = 'NONE', extraRuns = 0, isWicket = false, wicketPayload = {} }) => {
    if (!isMatchCreator || submitting || !match || match.status === 'COMPLETED') return;

    try {
      setSubmitting(true);
      setError('');

      // Play appropriate sound effect
      if (isWicket) {
        playSound('wicket');
      } else if (runsOffBat === 6) {
        playSound('six');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } else if (runsOffBat === 4) {
        playSound('four');
      } else if (runsOffBat > 0) {
        playSound('bat');
      } else {
        playSound('tap');
      }

      const payload = {
        runsOffBat,
        extrasType,
        extraRuns,
        isWicket,
        dismissalType: wicketPayload.dismissalType || dismissalType,
        dismissedBatsmanName: wicketPayload.dismissedBatsmanName || dismissedBatsman || striker?.playerName,
        fielderName: wicketPayload.fielderName || fielderName,
        newBatsmanName: wicketPayload.newBatsmanName || newBatsmanName,
        nextBowlerName: wicketPayload.nextBowlerName || nextBowlerName,
      };

      const updated = await scoringApi.recordBall(matchId, payload);
      setScorecard(updated);

      // Check if over finished (ballsInCurrentOver === 0 and completedOvers > 0)
      if (updated.currentInnings?.ballsInCurrentOver === 0 && updated.currentInnings?.completedOvers > 0 && !updated.match?.status?.includes('COMPLETED') && updated.match?.status !== 'INNINGS_BREAK') {
        setNextBowlerName('');
        setBowlerModalOpen(true);
      }

      // If match completed, celebrate!
      if (updated.match?.status === 'COMPLETED') {
        playSound('six');
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      }
    } catch (err) {
      setError(err.message || 'Scoring error');
    } finally {
      setSubmitting(false);
      setWicketModalOpen(false);
      setNewBatsmanName('');
      setFielderName('');
    }
  };

  const handleUndo = async () => {
    try {
      setSubmitting(true);
      playSound('tap');
      const updated = await scoringApi.undoBall(matchId);
      setScorecard(updated);
    } catch (err) {
      setError('Undo failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwapStrike = async () => {
    if (!isMatchCreator || submitting || !match || match.status === 'COMPLETED') return;
    try {
      setSubmitting(true);
      playSound('tap');
      const updated = await scoringApi.swapStrike(matchId);
      setScorecard(updated);
    } catch (err) {
      setError('Failed to swap strike: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openWicketModal = () => {
    playSound('tap');
    setDismissalType('BOWLED');
    setDismissedBatsman(striker?.playerName || '');
    setFielderName('');
    setNewBatsmanName('');
    setWicketModalOpen(true);
  };

  const handleWicketSubmit = (e) => {
    e.preventDefault();

    // Strictly build the set of dismissed players (existing + the one being dismissed now)
    const outPlayerNames = new Set(
      (currentInnings?.battingStats?.filter(b => b.isOut).map(b => b.playerName?.trim().toLowerCase()) || [])
    );
    const dismissedNow = (dismissedBatsman || striker?.playerName || '').trim().toLowerCase();
    if (dismissedNow) outPlayerNames.add(dismissedNow);

    // Players currently on crease (excluding the one being dismissed)
    const onCreaseNames = new Set(
      (currentInnings?.battingStats?.filter(b => !b.isOut).map(b => b.playerName?.trim().toLowerCase()) || [])
        .filter(n => n !== dismissedNow)
    );

    // Check if there are any available batsmen in the team roster
    const availableBatsmen = battingTeamPlayers.filter(
      p => p.name
        && !outPlayerNames.has(p.name.trim().toLowerCase())
        && !onCreaseNames.has(p.name.trim().toLowerCase())
    );
    const playersRemain = availableBatsmen.length > 0;

    // If players remain, a new batsman must be selected
    if (playersRemain && !newBatsmanName.trim()) {
      setError('Please select the next incoming batsman.');
      return;
    }

    // If manually typed name is already out, reject it
    if (newBatsmanName && outPlayerNames.has(newBatsmanName.trim().toLowerCase())) {
      setError(`Player "${newBatsmanName}" has already been dismissed and cannot bat again.`);
      return;
    }

    handleScoreEvent({
      runsOffBat: 0,
      extrasType: 'NONE',
      isWicket: true,
      wicketPayload: {
        dismissalType,
        dismissedBatsmanName: dismissedBatsman || striker?.playerName,
        fielderName,
        // Only pass newBatsmanName when there are players left; otherwise empty = last man / all out
        newBatsmanName: playersRemain ? newBatsmanName.trim() : '',
      },
    });
  };

  const handleNextBowlerSubmit = async (e) => {
    e.preventDefault();
    if (!nextBowlerName.trim()) return;
    try {
      setSubmitting(true);
      playSound('tap');
      const updated = await scoringApi.setBowler(matchId, nextBowlerName.trim());
      setScorecard(updated);
      setBowlerModalOpen(false);
      setNextBowlerName('');
    } catch (err) {
      setError(err.message || 'Failed to update current bowler');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartSecondInnings = async (customOpeners = null) => {
    if (!isMatchCreator || submitting || !match) return;
    try {
      setSubmitting(true);
      setError('');
      playSound('bat');

      const payload = {
        openingStriker: customOpeners?.openingStriker || innings2Striker || '',
        openingNonStriker: customOpeners?.openingNonStriker || innings2NonStriker || '',
        openingBowler: customOpeners?.openingBowler || innings2Bowler || '',
      };

      const updated = await scoringApi.setupInnings2(matchId, payload);
      setScorecard(updated);
      setInnings2ModalOpen(false);
    } catch (err) {
      console.warn('setupInnings2 error, attempting updateStatus fallback:', err);
      try {
        await matchApi.updateStatus(matchId, 'LIVE');
        const refreshed = await scoringApi.getScorecard(matchId);
        setScorecard(refreshed);
        setInnings2ModalOpen(false);
      } catch (fallbackErr) {
        setError('Failed to start 2nd innings: ' + (err.message || fallbackErr.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenInnings2Modal = async () => {
    try {
      const inn2BattingTeam = match?.bowlingTeamFirst || (match?.battingTeamFirst === match?.teamA ? match?.teamB : match?.teamA);
      const inn2BowlingTeam = match?.battingTeamFirst || (match?.bowlingTeamFirst === match?.teamA ? match?.teamB : match?.teamA);
      const isTeamABattingInn2 = inn2BattingTeam === match?.teamA;
      const batTeamId = isTeamABattingInn2 ? match?.teamAId : match?.teamBId;
      const bowlTeamId = isTeamABattingInn2 ? match?.teamBId : match?.teamAId;

      const batXI = isTeamABattingInn2 ? match?.teamAPlayingXI : match?.teamBPlayingXI;
      const bowlXI = isTeamABattingInn2 ? match?.teamBPlayingXI : match?.teamAPlayingXI;

      let batRoster = [];
      let bowlRoster = [];

      if (Array.isArray(batXI) && batXI.length > 0) {
        batXI.forEach((n, idx) => {
          if (n && n.trim()) {
            batRoster.push({ id: `inn2_bat_xi_${idx}`, name: n.trim(), role: 'BATSMAN', teamName: inn2BattingTeam });
          }
        });
      }

      if (Array.isArray(bowlXI) && bowlXI.length > 0) {
        bowlXI.forEach((n, idx) => {
          if (n && n.trim()) {
            bowlRoster.push({ id: `inn2_bowl_xi_${idx}`, name: n.trim(), role: 'BOWLER', teamName: inn2BowlingTeam });
          }
        });
      }

      try {
        let res = batTeamId ? await teamApi.getTeamPlayers(batTeamId).catch(() => []) : [];
        if ((!res || !res.length) && inn2BattingTeam) {
          res = await playerApi.getByTeam(inn2BattingTeam).catch(() => []);
        }
        if (Array.isArray(res) && res.length > 0) {
          const existing = new Set(batRoster.map(p => p.name?.trim()?.toLowerCase()));
          res.forEach(p => {
            const pTeam = p.teamName || p.team;
            const matchesTeam = !pTeam || (inn2BattingTeam && pTeam.trim().toLowerCase() === inn2BattingTeam.trim().toLowerCase());
            if (p.name && matchesTeam && !existing.has(p.name.trim().toLowerCase())) {
              batRoster.push(p);
            }
          });
        }
      } catch (e) {}

      try {
        let res = bowlTeamId ? await teamApi.getTeamPlayers(bowlTeamId).catch(() => []) : [];
        if ((!res || !res.length) && inn2BowlingTeam) {
          res = await playerApi.getByTeam(inn2BowlingTeam).catch(() => []);
        }
        if (Array.isArray(res) && res.length > 0) {
          const existing = new Set(bowlRoster.map(p => p.name?.trim()?.toLowerCase()));
          res.forEach(p => {
            const pTeam = p.teamName || p.team;
            const matchesTeam = !pTeam || (inn2BowlingTeam && pTeam.trim().toLowerCase() === inn2BowlingTeam.trim().toLowerCase());
            if (p.name && matchesTeam && !existing.has(p.name.trim().toLowerCase())) {
              bowlRoster.push(p);
            }
          });
        }
      } catch (e) {}

      setBattingTeamPlayers(batRoster);
      setBowlingTeamPlayers(bowlRoster);

      if (batRoster.length >= 1 && batRoster[0]?.name) setInnings2Striker(batRoster[0].name);
      if (batRoster.length >= 2 && batRoster[1]?.name) setInnings2NonStriker(batRoster[1].name);
      if (bowlRoster.length >= 1 && bowlRoster[0]?.name) setInnings2Bowler(bowlRoster[0].name);

      setInnings2ModalOpen(true);
    } catch (err) {
      console.warn('Error opening innings 2 modal:', err);
      setInnings2ModalOpen(true);
    }
  };

  const handleInnings2Submit = (e) => {
    e.preventDefault();
    if (innings2Striker && innings2NonStriker && innings2Striker.trim().toLowerCase() === innings2NonStriker.trim().toLowerCase()) {
      setError('Opening Batter 1 (*) and Opening Batter 2 must be two distinct players.');
      return;
    }
    handleStartSecondInnings({
      openingStriker: innings2Striker.trim(),
      openingNonStriker: innings2NonStriker.trim(),
      openingBowler: innings2Bowler.trim(),
    });
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to live cricket scoring telemetry..." />;
  }

  if (!match) {
    return <ErrorAlert message="Match data not found." />;
  }

  const isCompleted = match.status === 'COMPLETED';
  const isInningsBreak = match.status === 'INNINGS_BREAK';
  const isChasing = match.currentInnings === 2;
  const target = currentInnings?.targetRuns;
  const requiredRuns = target ? target - (currentInnings?.totalRuns || 0) : 0;
  const totalMaxBalls = match.totalOvers > 0 ? match.totalOvers * 6 : Infinity;
  const currentBallsBowled = (currentInnings?.completedOvers || 0) * 6 + (currentInnings?.ballsInCurrentOver || 0);
  const remainingBalls = match.totalOvers > 0 ? Math.max(0, totalMaxBalls - currentBallsBowled) : null;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Match Banner Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span className={`badge ${isCompleted ? 'badge-completed' : 'badge-live'}`}>
              {match.status}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Innings {match.currentInnings} of 2 • {match.totalOvers} Overs • {match.location}
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {currentInnings?.battingTeam} vs {currentInnings?.bowlingTeam}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isMatchCreator && !isCompleted && (
            <>
              <button
                onClick={handleUndo}
                disabled={submitting}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                title="Undo previous delivery"
              >
                <RotateCcw size={16} />
                <span>Undo Ball</span>
              </button>

              <button
                onClick={handleSwapStrike}
                disabled={submitting}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                title="Swap strike between active batsmen"
              >
                <RefreshCw size={16} />
                <span>Swap Strike</span>
              </button>

              <button
                onClick={handleEndMatch}
                disabled={submitting}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                title="Conclude match"
              >
                <Flag size={16} />
                <span>End Match</span>
              </button>
            </>
          )}

          <Link
            to={`/match/${match.id}/scorecard`}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            onClick={() => playSound('tap')}
          >
            <FileText size={16} />
            <span>Scorecard</span>
          </Link>
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* Main Cricbuzz-Style Live Scoreboard Card */}
      <div className="score-display-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          {/* Main Score & Overs */}
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              BATTING: {currentInnings?.battingTeam}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', margin: '4px 0 10px' }}>
              <span className="live-score-number">
                {currentInnings?.totalRuns}/{currentInnings?.wickets}
              </span>
              <span className="live-overs-number">
                ({currentInnings?.completedOvers}.{currentInnings?.ballsInCurrentOver} / {match.totalOvers} ov)
              </span>
            </div>

            {/* Run Rates & Target Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>
                CRR: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{currentInnings?.runRate}</strong>
              </span>
              {isChasing && (
                <>
                  <span>•</span>
                  <span>Target: <strong style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>{target}</strong></span>
                  <span>•</span>
                  <span>
                    Need <strong style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{requiredRuns}</strong> runs in <strong style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{remainingBalls}</strong> balls
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Match Status Tag */}
          <div style={{ textAlign: 'right' }}>
            {match.resultDescription ? (
              <div style={{
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid var(--accent-gold)',
                padding: '10px 18px',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--accent-gold)',
                fontWeight: 800,
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Trophy size={20} />
                <span>{match.resultDescription}</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Toss: {match.tossWinner} elected to {match.tossDecision?.toLowerCase()}
              </div>
            )}
          </div>
        </div>

        {/* Recent Balls Strip */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            This Over Delivery Stream:
          </span>
          <div className="ball-timeline" style={{ marginTop: '8px' }}>
            {scorecard.recentBalls && scorecard.recentBalls.length > 0 ? (
              scorecard.recentBalls.map((b, idx) => {
                let chipClass = 'dot';
                let label = b.runsOffBat;

                if (b.wicket) {
                  chipClass = 'wicket';
                  label = 'W';
                } else if (b.extrasType === 'WIDE') {
                  chipClass = 'wide';
                  label = b.totalRuns > 1 ? `${b.totalRuns}wd` : 'wd';
                } else if (b.extrasType === 'NO_BALL') {
                  chipClass = 'noball';
                  label = b.totalRuns > 1 ? `${b.totalRuns}nb` : 'nb';
                } else if (b.runsOffBat === 4) {
                  chipClass = 'four';
                  label = '4';
                } else if (b.runsOffBat === 6) {
                  chipClass = 'six';
                  label = '6';
                } else if (b.runsOffBat === 0) {
                  chipClass = 'dot';
                  label = '•';
                }

                return (
                  <div key={idx} className={`ball-chip ${chipClass}`} title={b.commentary}>
                    {label}
                  </div>
                );
              })
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Over starting...</span>
            )}
          </div>
        </div>
      </div>

      {/* Pitch Telemetry: Current Batsmen & Bowler Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Batsmen on Pitch */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>BATSMEN ON CREASE</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700 }}>* = Facing Ball</span>
          </div>
          <table className="score-table">
            <thead>
              <tr>
                <th>Batter</th>
                <th className="num">R</th>
                <th className="num">B</th>
                <th className="num">4s</th>
                <th className="num">6s</th>
                <th className="num">SR</th>
              </tr>
            </thead>
            <tbody>
              {batsmenOnCrease.map((b, idx) => {
                const isFacing = b.isCurrentFacing;
                return (
                  <tr key={idx}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {isFacing && <span title="Facing Ball" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: 900 }}>*</span>}
                        <strong style={{ color: isFacing ? 'var(--text-main)' : 'var(--text-muted)' }}>{b.playerName}</strong>
                      </span>
                    </td>
                    <td className="num" style={{ fontWeight: 700 }}>{b.runs}</td>
                    <td className="num">{b.balls}</td>
                    <td className="num">{b.fours}</td>
                    <td className="num">{b.sixes}</td>
                    <td className="num" style={{ color: 'var(--text-muted)' }}>{b.strikeRate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bowler in Action */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>CURRENT BOWLER</span>
            {isMatchCreator && !isCompleted && !isInningsBreak && (
              <button
                type="button"
                onClick={() => {
                  setNextBowlerName(currentBowler?.playerName || '');
                  setBowlerModalOpen(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', height: 'auto' }}
              >
                Change Bowler
              </button>
            )}
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
              </tr>
            </thead>
            <tbody>
              {currentBowler ? (
                <tr>
                  <td><strong>{currentBowler.playerName}</strong></td>
                  <td className="num">{currentBowler.oversDisplay}</td>
                  <td className="num">{currentBowler.maidens}</td>
                  <td className="num">{currentBowler.runsConceded}</td>
                  <td className="num" style={{ color: '#f87171', fontWeight: 700 }}>{currentBowler.wickets}</td>
                  <td className="num" style={{ color: 'var(--text-muted)' }}>{currentBowler.economy}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
                    <span>Select opening bowler for this over. </span>
                    {isMatchCreator && (
                      <button
                        type="button"
                        onClick={() => setBowlerModalOpen(true)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', marginLeft: '8px' }}
                      >
                        Assign Bowler
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Innings Break Notification Banner */}
      {isInningsBreak && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
          borderColor: 'var(--accent-gold)',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>🏏 Innings 1 Concluded!</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
            Target for <strong>{match.bowlingTeamFirst}</strong> is <strong>{target} runs</strong> in {match.totalOvers} overs.
          </p>
          {isMatchCreator ? (
            <button
              onClick={handleOpenInnings2Modal}
              className="btn btn-primary"
              style={{ padding: '12px 32px', fontSize: '1rem' }}
            >
              Start 2nd Innings Run Chase
            </button>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-muted)',
              fontSize: '0.9rem'
            }}>
              <Lock size={16} />
              <span>Waiting for the match creator to commence 2nd innings...</span>
            </div>
          )}
        </div>
      )}

      {/* Match Completed Banner */}
      {isCompleted && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
          borderColor: 'var(--primary)',
          padding: '28px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '2.4rem' }}>🏆</span>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0' }}>Match Completed!</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '20px' }}>
            {match.resultDescription}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to={`/match/${match.id}/result`} className="btn btn-primary" onClick={() => playSound('tap')}>
              <Award size={18} />
              <span>Match Result Ceremony</span>
            </Link>
            <Link to={`/match/${match.id}/scorecard`} className="btn btn-secondary" onClick={() => playSound('tap')}>
              <FileText size={18} />
              <span>View Full Scorecard</span>
            </Link>
          </div>
        </div>
      )}

      {/* Interactive Scoring Keypad — creator only; view-only for others */}
      {!isCompleted && !isInningsBreak && (
        <div className="card" style={{ padding: '24px' }}>
          {isMatchCreator ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Live Delivery Keypad</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Active Batter: <strong style={{ color: 'var(--accent-gold)' }}>* {striker?.playerName || 'None'}</strong>
                  {nonStriker && <span style={{ marginLeft: '12px', color: 'var(--text-dim)' }}>| Partner: <strong style={{ color: 'var(--text-main)' }}>{nonStriker.playerName}</strong></span>}
                </span>
              </div>

              <div className="keypad-grid">
                {/* Standard Runs */}
                <button
                  onClick={() => handleScoreEvent({ runsOffBat: 0 })}
                  disabled={submitting}
                  className="keypad-btn"
                >
                  <span>0</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 500 }}>Dot</span>
                </button>

                <button
                  onClick={() => handleScoreEvent({ runsOffBat: 1 })}
                  disabled={submitting}
                  className="keypad-btn"
                >
                  <span>1</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 500 }}>Single</span>
                </button>

                <button
                  onClick={() => handleScoreEvent({ runsOffBat: 2 })}
                  disabled={submitting}
                  className="keypad-btn"
                >
                  <span>2</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 500 }}>Double</span>
                </button>

                <button
                  onClick={() => handleScoreEvent({ runsOffBat: 3 })}
                  disabled={submitting}
                  className="keypad-btn"
                >
                  <span>3</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 500 }}>Three</span>
                </button>

                <button
                  onClick={() => handleScoreEvent({ runsOffBat: 4 })}
                  disabled={submitting}
                  className="keypad-btn run-4"
                >
                  <span>4</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>BOUNDARY</span>
                </button>

                <button
                  onClick={() => handleScoreEvent({ runsOffBat: 6 })}
                  disabled={submitting}
                  className="keypad-btn run-6"
                >
                  <span>6</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>MAXIMUM</span>
                </button>

                {/* Extras */}
                <button
                  onClick={() => handleScoreEvent({ extrasType: 'WIDE', extraRuns: 1 })}
                  disabled={submitting}
                  className="keypad-btn extra"
                >
                  <span>WD</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Wide (+1)</span>
                </button>

                <button
                  onClick={() => handleScoreEvent({ extrasType: 'NO_BALL', extraRuns: 1 })}
                  disabled={submitting}
                  className="keypad-btn extra"
                >
                  <span>NB</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>No Ball (+1)</span>
                </button>

                <button
                  onClick={() => handleScoreEvent({ extrasType: 'BYE', extraRuns: 1 })}
                  disabled={submitting}
                  className="keypad-btn"
                >
                  <span>1B</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Bye</span>
                </button>

                <button
                  onClick={() => handleScoreEvent({ extrasType: 'LEG_BYE', extraRuns: 1 })}
                  disabled={submitting}
                  className="keypad-btn"
                >
                  <span>1LB</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Leg Bye</span>
                </button>

                {/* Wicket Button */}
                <button
                  onClick={openWicketModal}
                  disabled={submitting}
                  className="keypad-btn wicket"
                  style={{ gridColumn: 'span 2' }}
                >
                  <span>OUT / WICKET</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Dismissal</span>
                </button>
              </div>
            </>
          ) : (
            /* View-Only Banner for non-creators */
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 22px',
                background: 'rgba(59, 130, 246, 0.12)',
                borderRadius: 'var(--radius-full)',
                color: '#60a5fa',
                fontWeight: 700,
                fontSize: '0.95rem',
                marginBottom: '12px'
              }}>
                <Lock size={18} />
                <span>View Only - Only the match creator can update the score.</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                You can watch the live score, ball delivery stream, and statistics in real time.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Wicket Modal */}
      {wicketModalOpen && (
        <div className="modal-backdrop" onClick={() => setWicketModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#f87171' }}>
              Record Wicket Dismissal
            </h3>

            <form onSubmit={handleWicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Dismissal Type:
                </label>
                <select
                  value={dismissalType}
                  onChange={(e) => setDismissalType(e.target.value)}
                >
                  <option value="BOWLED">Bowled</option>
                  <option value="CAUGHT">Caught</option>
                  <option value="LBW">LBW (Leg Before Wicket)</option>
                  <option value="RUN_OUT">Run Out</option>
                  <option value="STUMPED">Stumped</option>
                  <option value="HIT_WICKET">Hit Wicket</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {['BOWLED', 'LBW', 'STUMPED', 'HIT_WICKET'].includes(dismissalType) ? (
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Dismissed Batsman:
                  </label>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    * {striker?.playerName || 'Batter'}
                  </div>
                </div>
              ) : dismissalType === 'RUN_OUT' ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px', color: '#f87171' }}>
                    Who is Out? (Select Run Out Batsman):
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {striker && (
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: dismissedBatsman === striker.playerName ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        border: dismissedBatsman === striker.playerName ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}>
                        <input
                          type="radio"
                          name="runOutBatsman"
                          value={striker.playerName}
                          checked={dismissedBatsman === striker.playerName}
                          onChange={() => setDismissedBatsman(striker.playerName)}
                        />
                        <span>* {striker.playerName} (Facing Ball)</span>
                      </label>
                    )}
                    {nonStriker && (
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: dismissedBatsman === nonStriker.playerName ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        border: dismissedBatsman === nonStriker.playerName ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}>
                        <input
                          type="radio"
                          name="runOutBatsman"
                          value={nonStriker.playerName}
                          checked={dismissedBatsman === nonStriker.playerName}
                          onChange={() => setDismissedBatsman(nonStriker.playerName)}
                        />
                        <span>{nonStriker.playerName} (Partner)</span>
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Dismissed Batsman:
                  </label>
                  <select
                    value={dismissedBatsman}
                    onChange={(e) => setDismissedBatsman(e.target.value)}
                  >
                    {striker && <option value={striker.playerName}>* {striker.playerName}</option>}
                    {nonStriker && <option value={nonStriker.playerName}>{nonStriker.playerName}</option>}
                  </select>
                </div>
              )}

              {dismissalType === 'CAUGHT' || dismissalType === 'RUN_OUT' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Fielder Involved:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh Raina"
                    value={fielderName}
                    onChange={(e) => setFielderName(e.target.value)}
                  />
                </div>
              ) : null}

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Next Incoming Batsman:
                </label>
                {(() => {
                  // Strictly: dismissed players from the current innings
                  const outPlayerNames = new Set(
                    (currentInnings?.battingStats?.filter(b => b.isOut).map(b => b.playerName?.trim().toLowerCase()) || [])
                  );
                  // Also exclude the dismissed batsman being declared right now
                  const dismissedNow = (dismissedBatsman || striker?.playerName || '').trim().toLowerCase();
                  if (dismissedNow) outPlayerNames.add(dismissedNow);

                  // Players currently on crease (not dismissed, not the one being dismissed)
                  const onCreaseNames = new Set(
                    (currentInnings?.battingStats?.filter(b => !b.isOut).map(b => b.playerName?.trim().toLowerCase()) || [])
                      .filter(n => n !== dismissedNow)
                  );

                  // Available = in team roster, not out, not on crease
                  const availableBatsmen = battingTeamPlayers.filter(
                    p => p.name
                      && !outPlayerNames.has(p.name.trim().toLowerCase())
                      && !onCreaseNames.has(p.name.trim().toLowerCase())
                  );

                  if (availableBatsmen.length > 0) {
                    return (
                      <select
                        id="new-batsman-select"
                        value={newBatsmanName}
                        onChange={(e) => setNewBatsmanName(e.target.value)}
                        required
                      >
                        <option value="">-- Select Next Batsman --</option>
                        {availableBatsmen.map((p, idx) => (
                          <option key={p.id || idx} value={p.name}>{p.name} ({p.role || 'Batter'})</option>
                        ))}
                      </select>
                    );
                  }

                  // No batsman available — last man standing or all out
                  const hasLastManOnCrease = onCreaseNames.size > 0;
                  return (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius)',
                      background: hasLastManOnCrease ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      border: `1px solid ${hasLastManOnCrease ? 'var(--accent-gold)' : '#ef4444'}`,
                      fontSize: '0.88rem',
                      color: hasLastManOnCrease ? 'var(--accent-gold)' : '#ef4444',
                      fontWeight: 600,
                    }}>
                      {hasLastManOnCrease
                        ? '⚠️ Last man standing — no new batsman. Submit to continue with last player.'
                        : '🔴 All players dismissed — innings will end after this wicket.'}
                    </div>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setWicketModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                >
                  Confirm Wicket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Next Bowler Modal (Over Finished) */}
      {bowlerModalOpen && (
        <div className="modal-backdrop" onClick={() => setBowlerModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>
              Over Completed!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              6 legal balls bowled. Batsmen have swapped strike. Select the bowler for the next over.
            </p>

            <form onSubmit={handleNextBowlerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Next Bowler:
                </label>
                {bowlingTeamPlayers.length > 0 ? (
                  <select
                    id="next-bowler-select"
                    value={nextBowlerName}
                    onChange={(e) => setNextBowlerName(e.target.value)}
                    required
                  >
                    <option value="">-- Select Next Bowler --</option>
                    {bowlingTeamPlayers.map((p, idx) => (
                      <option key={p.id || idx} value={p.name}>{p.name} ({p.role || 'Bowler'})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Bumrah"
                    value={nextBowlerName}
                    onChange={(e) => setNextBowlerName(e.target.value)}
                    required
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBowlerModalOpen(false)}
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Assign Bowler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2nd Innings Openers Selection Modal */}
      {innings2ModalOpen && (
        <div className="modal-backdrop" onClick={() => setInnings2ModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '6px', color: 'var(--primary)' }}>
              🏏 Start 2nd Innings: Select Openers
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Batting: <strong>{match?.bowlingTeamFirst || 'Team 2'}</strong> • Bowling: <strong>{match?.battingTeamFirst || 'Team 1'}</strong>
            </p>

            <form onSubmit={handleInnings2Submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  * Opening Batter 1 (* Facing Ball):
                </label>
                {battingTeamPlayers.length > 0 ? (
                  <select
                    value={innings2Striker}
                    onChange={(e) => setInnings2Striker(e.target.value)}
                    required
                  >
                    <option value="">-- Select Opening Batter 1 --</option>
                    {battingTeamPlayers.map((p, idx) => (
                      <option key={p.id || idx} value={p.name}>{p.name} ({p.role || 'Batter'})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Batter 1 Name"
                    value={innings2Striker}
                    onChange={(e) => setInnings2Striker(e.target.value)}
                    required
                  />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Opening Batter 2 (Partner):
                </label>
                {battingTeamPlayers.length > 0 ? (
                  <select
                    value={innings2NonStriker}
                    onChange={(e) => setInnings2NonStriker(e.target.value)}
                    required
                  >
                    <option value="">-- Select Opening Batter 2 --</option>
                    {battingTeamPlayers
                      .filter(p => p.name !== innings2Striker)
                      .map((p, idx) => (
                        <option key={p.id || idx} value={p.name}>{p.name} ({p.role || 'Batter'})</option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Opening Batter 2 Name"
                    value={innings2NonStriker}
                    onChange={(e) => setInnings2NonStriker(e.target.value)}
                    required
                  />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Opening Bowler (Bowling Team):
                </label>
                {bowlingTeamPlayers.length > 0 ? (
                  <select
                    value={innings2Bowler}
                    onChange={(e) => setInnings2Bowler(e.target.value)}
                    required
                  >
                    <option value="">-- Select Bowler --</option>
                    {bowlingTeamPlayers.map((p, idx) => (
                      <option key={p.id || idx} value={p.name}>{p.name} ({p.role || 'Bowler'})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Bowler Name"
                    value={innings2Bowler}
                    onChange={(e) => setInnings2Bowler(e.target.value)}
                    required
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setInnings2ModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  Commence 2nd Innings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScoring;
