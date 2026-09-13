import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  Home as HomeIcon,
  Timer,
  Settings,
  Trophy,
  Check,
  X as CloseIcon,
  LogOut,
  User,
  Zap,
  Shield,
  Flame,
  Gamepad2,
} from 'lucide-react';
import Header from '../components/Header';
import GameBoard from '../components/GameBoard';
import PlayerCard from '../components/PlayerCard';
import PlayerStatus from '../components/PlayerStatus';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import {
  checkWinner,
  checkDraw,
  getAIMove,
  resetBoard,
} from '../utils/gameLogic';
import {
  getStoredPlayerName,
  setStoredPlayerName,
  getStoredDifficulty,
  setStoredDifficulty,
  getStoredSinglePlayerTimer,
  setStoredSinglePlayerTimer,
} from '../utils/storage';
import { playSound } from '../utils/sound';

const MAX_ROUNDS = 5;

const SinglePlayer = () => {
  const navigate = useNavigate();

  // 1. Initial Setup State (Name, Timer, Difficulty FIRST)
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState(() => getStoredPlayerName() || 'Player 1');
  const [difficulty, setDifficulty] = useState(() => getStoredDifficulty() || 'medium');
  const [timerSetting, setTimerSetting] = useState(() => getStoredSinglePlayerTimer() || 60);

  // 2. Active Match State (Best of 5 rounds like Multiplayer)
  const [currentRound, setCurrentRound] = useState(1);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [roundHistory, setRoundHistory] = useState([]);

  // 3. Board & Turn State
  const [board, setBoard] = useState(() => resetBoard());
  const [currentTurn, setCurrentTurn] = useState('X'); // X = Human, O = AI
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => timerSetting);

  // 4. Transitions & Modals (Only Leave Game & Settings, NO Give Up)
  const [isTransitioningRound, setIsTransitioningRound] = useState(false);
  const [autoRoundCountdown, setAutoRoundCountdown] = useState(null);
  const [showMatchEndModal, setShowMatchEndModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const aiTimeoutRef = useRef(null);
  const autoRoundTimerRef = useRef(null);
  const difficultyRef = useRef(difficulty);
  const timerSettingRef = useRef(timerSetting);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    timerSettingRef.current = timerSetting;
  }, [timerSetting]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      if (autoRoundTimerRef.current) clearInterval(autoRoundTimerRef.current);
    };
  }, []);

  const isRoundEnded = Boolean(winnerInfo || isDraw);
  const isMatchEnded = currentRound >= MAX_ROUNDS && isRoundEnded;

  // Turn Timer countdown for Human Player (X)
  useEffect(() => {
    if (!isGameStarted || currentTurn !== 'X' || isRoundEnded || isAiThinking || timerSetting === 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeoutLoss();
          return 0;
        }

        if (prev <= 6 && prev > 1) {
          playSound('tick');
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameStarted, currentTurn, isRoundEnded, isAiThinking, timerSetting]);

  // Handle Timeout Loss
  const handleTimeoutLoss = () => {
    playSound('timeout');
    const outcome = { winner: 'O', timeout: true };
    setWinnerInfo(outcome);
    const newScores = { ...scores, O: scores.O + 1 };
    setScores(newScores);
    setRoundHistory((prev) => [...prev, { round: currentRound, winner: 'O', timeout: true }]);
    handlePostRound(outcome, newScores);
  };

  // Start Game from Setup Form
  const handleStartGame = (e) => {
    if (e) e.preventDefault();
    const finalName = playerName.trim() || 'Player 1';
    setPlayerName(finalName);
    setStoredPlayerName(finalName);
    setStoredDifficulty(difficulty);
    setStoredSinglePlayerTimer(timerSetting);

    // Initialize clean 5-round match state
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    if (autoRoundTimerRef.current) clearInterval(autoRoundTimerRef.current);

    setBoard(resetBoard());
    setWinnerInfo(null);
    setIsDraw(false);
    setCurrentRound(1);
    setScores({ X: 0, O: 0, draws: 0 });
    setRoundHistory([]);
    setCurrentTurn('X');
    setTimeLeft(timerSetting);
    setIsAiThinking(false);
    setShowMatchEndModal(false);
    setAutoRoundCountdown(null);

    playSound('pop');
    setIsGameStarted(true);
  };

  // Human Move
  const handleCellClick = (index) => {
    if (!isGameStarted || isRoundEnded || currentTurn !== 'X' || isAiThinking || board[index] !== null) {
      return;
    }

    const boardAfterHuman = [...board];
    boardAfterHuman[index] = 'X';
    setBoard(boardAfterHuman);
    playSound('move_x');

    // 1. Check Human Win
    const humanWin = checkWinner(boardAfterHuman);
    if (humanWin) {
      setWinnerInfo(humanWin);
      const newScores = { ...scores, X: scores.X + 1 };
      setScores(newScores);
      setRoundHistory((prev) => [...prev, { round: currentRound, winner: 'X' }]);
      playSound('win');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
      handlePostRound(humanWin, newScores);
      return;
    }

    // 2. Check Draw
    if (checkDraw(boardAfterHuman)) {
      setIsDraw(true);
      const newScores = { ...scores, draws: scores.draws + 1 };
      setScores(newScores);
      setRoundHistory((prev) => [...prev, { round: currentRound, winner: null, draw: true }]);
      playSound('draw');
      handlePostRound(null, newScores);
      return;
    }

    // 3. Switch to AI Turn
    setCurrentTurn('O');
    setIsAiThinking(true);

    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    aiTimeoutRef.current = setTimeout(() => {
      const curDiff = difficultyRef.current;
      const curTimer = timerSettingRef.current;

      const aiMove = getAIMove(boardAfterHuman, curDiff, 'O', 'X');
      const finalAiIndex =
        aiMove !== null && aiMove !== undefined && boardAfterHuman[aiMove] === null
          ? aiMove
          : boardAfterHuman.findIndex((c) => c === null);

      if (finalAiIndex !== -1 && finalAiIndex !== undefined) {
        const boardAfterAI = [...boardAfterHuman];
        boardAfterAI[finalAiIndex] = 'O';
        setBoard(boardAfterAI);
        playSound('move_o');

        const aiWin = checkWinner(boardAfterAI);
        if (aiWin) {
          setWinnerInfo(aiWin);
          const newScores = { ...scores, O: scores.O + 1 };
          setScores(newScores);
          setRoundHistory((prev) => [...prev, { round: currentRound, winner: 'O' }]);
          playSound('draw');
          handlePostRound(aiWin, newScores);
        } else if (checkDraw(boardAfterAI)) {
          setIsDraw(true);
          const newScores = { ...scores, draws: scores.draws + 1 };
          setScores(newScores);
          setRoundHistory((prev) => [...prev, { round: currentRound, winner: null, draw: true }]);
          playSound('draw');
          handlePostRound(null, newScores);
        } else {
          setCurrentTurn('X');
          setTimeLeft(curTimer);
        }
      }

      setIsAiThinking(false);
    }, 450);
  };

  // Post Round Transition
  const handlePostRound = (outcome, newScores) => {
    if (autoRoundTimerRef.current) clearInterval(autoRoundTimerRef.current);

    if (currentRound < MAX_ROUNDS) {
      // 3s countdown ticker into next round
      setAutoRoundCountdown(3);
      let count = 3;
      autoRoundTimerRef.current = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(autoRoundTimerRef.current);
          setAutoRoundCountdown(null);
          handleNextRound();
        } else {
          setAutoRoundCountdown(count);
        }
      }, 1000);
    } else {
      // 5 rounds complete: open Match Result Modal
      setTimeout(() => {
        setShowMatchEndModal(true);
      }, 1200);
    }
  };

  // Advance to Next Round (Round 1 -> 2 -> 3 -> 4 -> 5)
  const handleNextRound = () => {
    if (autoRoundTimerRef.current) clearInterval(autoRoundTimerRef.current);
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    setIsTransitioningRound(true);
    playSound('pop');

    setTimeout(() => {
      setBoard(resetBoard());
      setWinnerInfo(null);
      setIsDraw(false);
      setAutoRoundCountdown(null);
      setCurrentRound((prev) => prev + 1);
      setCurrentTurn('X');
      setTimeLeft(timerSetting);
      setIsAiThinking(false);
      setIsTransitioningRound(false);
    }, 200);
  };

  // Restart 5-Round Match
  const handleRestartMatch = () => {
    if (autoRoundTimerRef.current) clearInterval(autoRoundTimerRef.current);
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    playSound('pop');
    setBoard(resetBoard());
    setWinnerInfo(null);
    setIsDraw(false);
    setCurrentRound(1);
    setScores({ X: 0, O: 0, draws: 0 });
    setRoundHistory([]);
    setCurrentTurn('X');
    setTimeLeft(timerSetting);
    setIsAiThinking(false);
    setShowMatchEndModal(false);
    setAutoRoundCountdown(null);
  };

  // Return to Setup Screen
  const handleReturnToSetup = () => {
    if (autoRoundTimerRef.current) clearInterval(autoRoundTimerRef.current);
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    playSound('pop');
    setIsGameStarted(false);
    setShowMatchEndModal(false);
  };

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const timerPercentage = timerSetting > 0 ? (timeLeft / timerSetting) * 100 : 100;
  const isTimeWarning = timerSetting > 0 && timeLeft <= 15 && timeLeft > 6;
  const isTimeCritical = timerSetting > 0 && timeLeft <= 6;

  // In-Board Blurred Outcome Overlay
  const getRoundOverlay = () => {
    if (!isRoundEnded) return null;

    if (winnerInfo?.timeout) {
      return (
        <>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(255, 69, 58, 0.18)',
            border: '2px solid var(--color-coral)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.9rem',
            boxShadow: '0 0 24px rgba(255, 69, 58, 0.4)',
          }}>
            ⏳
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
            <span style={{
              fontSize: 'clamp(1.15rem, 3.8vw, 1.4rem)',
              fontWeight: '900',
              color: 'var(--color-coral)',
              letterSpacing: '0.02em',
            }}>
              Round {currentRound} Timeout!
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Time expired for your turn
            </span>
          </div>

          {currentRound < MAX_ROUNDS && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginTop: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '16px',
              background: 'rgba(255, 69, 58, 0.14)',
              border: '1px solid rgba(255, 69, 58, 0.35)',
              fontSize: '0.84rem',
              fontWeight: '800',
              color: 'var(--color-coral)',
            }}>
              <Timer size={14} />
              <span>Next round in {autoRoundCountdown !== null ? autoRoundCountdown : 3}s...</span>
            </div>
          )}
        </>
      );
    }

    if (isDraw) {
      return (
        <>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.14)',
            border: '2px solid var(--border-glass-bright)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.9rem',
          }}>
            🤝
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
            <span style={{
              fontSize: 'clamp(1.15rem, 3.8vw, 1.4rem)',
              fontWeight: '900',
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}>
              Round {currentRound} Draw!
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Scores tied this round
            </span>
          </div>

          {currentRound < MAX_ROUNDS && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginTop: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '16px',
              background: 'rgba(56, 189, 248, 0.14)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              fontSize: '0.84rem',
              fontWeight: '800',
              color: 'var(--color-x)',
            }}>
              <Timer size={14} />
              <span>Next round in {autoRoundCountdown !== null ? autoRoundCountdown : 3}s...</span>
            </div>
          )}
        </>
      );
    }

    if (winnerInfo?.winner === 'X') {
      return (
        <>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.18)',
            border: '2px solid var(--color-x)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.9rem',
            boxShadow: '0 0 24px var(--color-x-glow)',
          }}>
            🎉
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
            <span style={{
              fontSize: 'clamp(1.15rem, 3.8vw, 1.4rem)',
              fontWeight: '900',
              color: 'var(--color-x)',
              textShadow: '0 0 16px var(--color-x-glow)',
              letterSpacing: '0.02em',
            }}>
              Round {currentRound} Victory!
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              You won this round!
            </span>
          </div>

          {currentRound < MAX_ROUNDS && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginTop: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '16px',
              background: 'rgba(56, 189, 248, 0.14)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              fontSize: '0.84rem',
              fontWeight: '800',
              color: 'var(--color-x)',
            }}>
              <Timer size={14} />
              <span>Next round in {autoRoundCountdown !== null ? autoRoundCountdown : 3}s...</span>
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(129, 140, 248, 0.18)',
          border: '2px solid var(--color-o)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.9rem',
          boxShadow: '0 0 24px var(--color-o-glow)',
        }}>
          💀
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
          <span style={{
            fontSize: 'clamp(1.15rem, 3.8vw, 1.4rem)',
            fontWeight: '900',
            color: 'var(--color-o)',
            textShadow: '0 0 16px var(--color-o-glow)',
            letterSpacing: '0.02em',
          }}>
            Round {currentRound} Defeat!
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            AI Bot won this round
          </span>
        </div>

        {currentRound < MAX_ROUNDS && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginTop: '0.4rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '16px',
            background: 'rgba(129, 140, 248, 0.14)',
            border: '1px solid rgba(129, 140, 248, 0.35)',
            fontSize: '0.84rem',
            fontWeight: '800',
            color: 'var(--color-o)',
          }}>
            <Timer size={14} />
            <span>Next round in {autoRoundCountdown !== null ? autoRoundCountdown : 3}s...</span>
          </div>
        )}
      </>
    );
  };

  // Match Final Outcome calculation
  const isHumanMatchWinner = scores.X > scores.O;
  const isAiMatchWinner = scores.O > scores.X;
  const isMatchTied = scores.X === scores.O;

  return (
    <div className="app-container">
      {/* 
        Singleplayer Header:
        - In Setup Screen: Back button to Home
        - In Game Arena: No Back button, Menu has "Leave Game" (NO Give Up)
      */}
      <Header
        showBack={!isGameStarted}
        backTo="/"
        showMenu
        onLeaveRoom={() => setShowLeaveModal(true)}
        leaveLabel="Leave Game"
        onRestart={isGameStarted ? handleRestartMatch : null}
        restartLabel="Restart Match"
        isMultiplayer={false}
      />

      <main className="main-content">
        {!isGameStarted ? (
          /* ============================================================
             1. SETUP SCREEN: Name, Timer, and Difficulty FIRST
             ============================================================ */
          <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
            <div className="modal-card" style={{ padding: '1.75rem 1.4rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 0.75rem',
                  borderRadius: '16px',
                  background: 'rgba(10, 132, 255, 0.15)',
                  border: '1px solid rgba(10, 132, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-x)',
                  boxShadow: '0 0 20px var(--color-x-glow)',
                }}>
                  <Gamepad2 size={30} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Singleplayer Match
                </h2>
                <p style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Set your name, timer, and AI difficulty to begin
                </p>
              </div>

              <form onSubmit={handleStartGame} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. Player Name Input */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.04em',
                  }}>
                    <User size={15} color="var(--color-x)" /> YOUR PLAYER NAME
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={15}
                    className="input-field"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '14px',
                      fontSize: '1rem',
                      fontWeight: '700',
                    }}
                    required
                  />
                </div>

                {/* 2. AI Difficulty Options */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.04em',
                  }}>
                    <Zap size={15} color="var(--color-amber)" /> AI DIFFICULTY
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                      { id: 'easy', label: 'Easy', icon: Shield, desc: 'Casual' },
                      { id: 'medium', label: 'Medium', icon: Zap, desc: 'Balanced' },
                      { id: 'hard', label: 'Hard', icon: Flame, desc: 'Expert' },
                    ].map((item) => {
                      const isSelected = difficulty === item.id;
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            playSound('click');
                            setDifficulty(item.id);
                          }}
                          style={{
                            padding: '0.75rem 0.35rem',
                            borderRadius: '14px',
                            border: isSelected ? '1.5px solid var(--color-x)' : '1px solid var(--border-glass)',
                            background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
                            color: isSelected ? 'var(--color-x)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            boxShadow: isSelected ? '0 0 16px var(--color-x-glow)' : 'none',
                          }}
                        >
                          <IconComp size={18} color={isSelected ? 'var(--color-x)' : 'var(--text-muted)'} />
                          <span style={{ fontSize: '0.88rem', fontWeight: '800' }}>{item.label}</span>
                          <span style={{ fontSize: '0.7rem', opacity: 0.75, fontWeight: '600' }}>{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Turn Timer Options */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.04em',
                  }}>
                    <Timer size={15} color="var(--color-x)" /> TURN TIMER
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem' }}>
                    {[
                      { val: 30, label: '30s', desc: 'Blitz' },
                      { val: 60, label: '1 Min', desc: 'Standard' },
                      { val: 120, label: '2 Min', desc: 'Tactical' },
                      { val: 0, label: 'Off', desc: 'No Limit' },
                    ].map((item) => {
                      const isSelected = timerSetting === item.val;
                      return (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            playSound('click');
                            setTimerSetting(item.val);
                          }}
                          style={{
                            padding: '0.65rem 0.25rem',
                            borderRadius: '12px',
                            border: isSelected ? '1.5px solid var(--color-x)' : '1px solid var(--border-glass)',
                            background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
                            color: isSelected ? 'var(--color-x)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.2rem',
                            boxShadow: isSelected ? '0 0 14px var(--color-x-glow)' : 'none',
                          }}
                        >
                          <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>{item.label}</span>
                          <span style={{ fontSize: '0.68rem', opacity: 0.75, fontWeight: '600' }}>{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit / Start Game Button */}
                <div style={{ marginTop: '0.5rem' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="btn-block"
                    icon={Play}
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: '900',
                      letterSpacing: '0.02em',
                      boxShadow: '0 0 25px var(--color-x-glow)',
                    }}
                  >
                    START GAME
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* ============================================================
             2. ACTIVE GAME ARENA: 5-Round Match (Singleplayer)
             ============================================================ */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* 5-Round Match Scoreboard (Matches Multiplayer) */}
            <div className="players-match-bar">
              <PlayerCard
                name={playerName}
                symbol="X"
                score={scores.X}
                isActiveTurn={currentTurn === 'X' && !isRoundEnded}
                isUser
              />

              <div className="match-vs-divider">
                <span className="round-pill">
                  Round {currentRound} of {MAX_ROUNDS}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', marginTop: '2px' }}>
                  VS
                </span>
              </div>

              <PlayerCard
                name={`AI (${difficulty.toUpperCase()})`}
                symbol="O"
                score={scores.O}
                isActiveTurn={currentTurn === 'O' && !isRoundEnded}
              />
            </div>

            {/* Turn & Match Commentary */}
            <PlayerStatus
              message={
                isMatchEnded
                  ? '5-Round Match Complete!'
                  : isRoundEnded
                  ? `Round ${currentRound} Complete`
                  : currentTurn === 'X'
                  ? (isTimeCritical ? '⚠️ Hurry up! Timer Running Out!' : 'Your Turn (X)')
                  : `AI Bot is thinking (O)...`
              }
              isThinking={currentTurn === 'O' && !isRoundEnded}
              highlight={isRoundEnded ? 'x' : currentTurn === 'X' ? 'x' : 'o'}
            />

            {/* Turn Timer Bar & Monospace Badge */}
            {!isRoundEnded && timerSetting > 0 && (
              <div style={{
                width: '100%',
                maxWidth: '380px',
                margin: '0.4rem 0 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0 0.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Timer
                      size={16}
                      color={isTimeCritical ? '#ef4444' : isTimeWarning ? '#f59e0b' : 'var(--color-x)'}
                      style={{ animation: isTimeCritical ? 'pulse 0.6s infinite' : 'none' }}
                    />
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: currentTurn === 'X' ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}>
                      {currentTurn === 'X' ? `Your Turn Time (${timerSetting}s limit)` : 'AI Turn (Paused)'}
                    </span>
                  </div>

                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.95rem',
                    fontWeight: '900',
                    color: isTimeCritical ? '#ef4444' : isTimeWarning ? '#f59e0b' : 'var(--color-x)',
                    padding: '0.15rem 0.6rem',
                    borderRadius: '12px',
                    background: isTimeCritical ? 'rgba(239, 68, 68, 0.15)' : isTimeWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                    border: `1px solid ${isTimeCritical ? '#ef4444' : isTimeWarning ? '#f59e0b' : 'rgba(56, 189, 248, 0.3)'}`,
                    boxShadow: isTimeCritical ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    {formatTime(timeLeft)}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-glass)',
                }}>
                  <div style={{
                    width: `${timerPercentage}%`,
                    height: '100%',
                    borderRadius: '3px',
                    background: isTimeCritical
                      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                      : isTimeWarning
                      ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                      : 'linear-gradient(90deg, var(--color-x), #60a5fa)',
                    transition: 'width 1s linear, background 0.3s ease',
                    boxShadow: isTimeCritical ? '0 0 8px #ef4444' : '0 0 8px var(--color-x-glow)',
                  }} />
                </div>
              </div>
            )}

            {/* 3x3 Game Board with In-Board Blurred Overlay */}
            <GameBoard
              board={board}
              onCellClick={handleCellClick}
              disabled={Boolean(isRoundEnded || currentTurn !== 'X' || isAiThinking)}
              winningLine={winnerInfo?.winningLine}
              overlay={getRoundOverlay()}
            />

            {/* Controls Bar - Next Round Button after round ends */}
            {isRoundEnded && currentRound < MAX_ROUNDS && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', width: '100%', maxWidth: '380px' }}>
                <Button
                  variant="primary"
                  size="lg"
                  className="btn-block"
                  onClick={handleNextRound}
                  disabled={isTransitioningRound}
                  icon={Play}
                  style={{
                    boxShadow: '0 0 25px var(--color-x-glow)',
                    fontSize: '1.15rem'
                  }}
                >
                  {isTransitioningRound ? 'Loading Next Round...' : `NEXT ROUND (${currentRound + 1}/${MAX_ROUNDS})`}
                </Button>
              </div>
            )}

            {/* Active Round Controls Bar (ONLY Leave Game & Settings, NO Give Up) */}
            {!isRoundEnded && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', width: '100%', maxWidth: '380px' }}>
                <Button
                  variant="secondary"
                  size="md"
                  className="btn-block"
                  onClick={() => setShowLeaveModal(true)}
                  icon={LogOut}
                >
                  Leave Game
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="btn-block"
                  onClick={() => setShowSettingsModal(true)}
                  icon={Settings}
                >
                  Settings
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Leave Game Confirmation Modal (Only Leave, NO Give Up) */}
      <ConfirmModal
        isOpen={showLeaveModal}
        title="Leave Game?"
        message="Are you sure you want to exit this singleplayer match? Your current game progress will be reset."
        confirmText="Leave Game"
        confirmVariant="danger"
        onConfirm={() => {
          setShowLeaveModal(false);
          setIsGameStarted(false);
          navigate('/');
        }}
        onCancel={() => setShowLeaveModal(false)}
      />

      {/* Settings Modal (AI Difficulty & Turn Timer) */}
      {showSettingsModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={20} color="var(--color-x)" /> Match Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="btn-icon"
                style={{ width: '32px', height: '32px' }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Difficulty Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                AI DIFFICULTY
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {['easy', 'medium', 'hard'].map((diff) => {
                  const isSelected = difficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setDifficulty(diff);
                        setStoredDifficulty(diff);
                      }}
                      style={{
                        padding: '0.65rem 0.4rem',
                        borderRadius: '12px',
                        border: isSelected ? '1.5px solid var(--color-x)' : '1px solid var(--border-glass)',
                        background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--color-x)' : 'var(--text-secondary)',
                        fontWeight: '800',
                        fontSize: '0.88rem',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Turn Timer Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                TURN TIMER
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {[
                  { label: '30s', val: 30 },
                  { label: '60s', val: 60 },
                  { label: '120s', val: 120 },
                  { label: 'Off', val: 0 },
                ].map((item) => {
                  const isSelected = timerSetting === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setTimerSetting(item.val);
                        setStoredSinglePlayerTimer(item.val);
                        setTimeLeft(item.val);
                      }}
                      style={{
                        padding: '0.65rem 0.4rem',
                        borderRadius: '12px',
                        border: isSelected ? '1.5px solid var(--color-x)' : '1px solid var(--border-glass)',
                        background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--color-x)' : 'var(--text-secondary)',
                        fontWeight: '800',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="btn-block"
              onClick={() => setShowSettingsModal(false)}
            >
              Apply & Close
            </Button>
          </div>
        </div>,
        document.body
      )}

      {/* 5-Round Match End Result Modal */}
      {showMatchEndModal && createPortal(
        <div className="modal-overlay">
          <div
            className="modal-card"
            style={{
              maxWidth: '440px',
              textAlign: 'center',
              padding: '2rem 1.5rem',
              animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Trophy / Result Icon */}
            <div style={{
              width: '84px',
              height: '84px',
              margin: '0 auto 1.25rem',
              borderRadius: '50%',
              background: isHumanMatchWinner
                ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.25), rgba(245, 158, 11, 0.35))'
                : isMatchTied
                ? 'rgba(255, 255, 255, 0.12)'
                : 'linear-gradient(135deg, rgba(129, 140, 248, 0.25), rgba(99, 102, 241, 0.35))',
              border: `2px solid ${isHumanMatchWinner ? '#fbbf24' : isMatchTied ? 'var(--border-glass-bright)' : 'var(--color-o)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.75rem',
              boxShadow: isHumanMatchWinner ? '0 0 35px rgba(251, 191, 36, 0.5)' : 'none',
            }}>
              {isHumanMatchWinner ? '🏆' : isMatchTied ? '🤝' : '💀'}
            </div>

            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '900',
              letterSpacing: '-0.02em',
              color: isHumanMatchWinner ? 'var(--color-x)' : isMatchTied ? 'var(--text-primary)' : 'var(--color-o)',
              marginBottom: '0.4rem',
            }}>
              {isHumanMatchWinner ? 'MATCH VICTORY!' : isMatchTied ? 'MATCH TIED!' : 'MATCH DEFEAT!'}
            </h2>

            <p style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
            }}>
              {isHumanMatchWinner
                ? `Incredible! You defeated the ${difficulty.toUpperCase()} AI in a 5-round battle!`
                : isMatchTied
                ? 'All 5 rounds completed with equal scores!'
                : `The ${difficulty.toUpperCase()} AI Bot claimed match victory.`}
            </p>

            {/* Scorecard Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '1rem',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-glass)',
              marginBottom: '1.75rem',
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: 'var(--color-x)' }}>
                  {playerName} (X)
                </span>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                  {scores.X}
                </span>
              </div>

              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-muted)' }}>
                -
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: 'var(--color-o)' }}>
                  AI ({difficulty}) (O)
                </span>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                  {scores.O}
                </span>
              </div>

              {scores.draws > 0 && (
                <>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-muted)' }}>
                    -
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)' }}>
                      Draws
                    </span>
                    <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-secondary)' }}>
                      {scores.draws}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button
                variant="primary"
                size="lg"
                className="btn-block"
                onClick={handleRestartMatch}
                icon={RotateCcw}
                style={{ fontSize: '1.05rem', boxShadow: '0 0 20px var(--color-x-glow)' }}
              >
                Play Again (5-Round Rematch)
              </Button>

              <Button
                variant="secondary"
                size="md"
                className="btn-block"
                onClick={handleReturnToSetup}
                icon={Settings}
              >
                Change Match Settings
              </Button>

              <Button
                variant="secondary"
                size="md"
                className="btn-block"
                onClick={() => {
                  playSound('click');
                  navigate('/');
                }}
                icon={HomeIcon}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SinglePlayer;
