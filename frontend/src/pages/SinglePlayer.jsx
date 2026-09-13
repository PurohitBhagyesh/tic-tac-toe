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
  X as CloseIcon,
  LogOut,
  User,
  Zap,
  Shield,
  Flame,
  Gamepad2,
  Check,
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

const SinglePlayer = () => {
  const navigate = useNavigate();

  // 1. Setup Preferences (Name, Timer, Difficulty FIRST)
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState(() => getStoredPlayerName() || 'Player 1');
  const [difficulty, setDifficulty] = useState(() => getStoredDifficulty() || 'medium');
  const [timerSetting, setTimerSetting] = useState(() => getStoredSinglePlayerTimer() || 60);

  // 2. Game & Scoreboard State (Single Round per game with Rematch)
  const [scores, setScores] = useState({ human: 0, ai: 0, draws: 0 });
  const [board, setBoard] = useState(() => resetBoard());
  const [currentTurn, setCurrentTurn] = useState('X'); // X = Human, O = AI
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => timerSetting);

  // 3. Modals (Leave Game & Settings, NO Give Up)
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const aiTimeoutRef = useRef(null);
  const difficultyRef = useRef(difficulty);
  const timerSettingRef = useRef(timerSetting);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    timerSettingRef.current = timerSetting;
  }, [timerSetting]);

  // Clean up any pending AI timeout on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, []);

  const isRoundEnded = Boolean(winnerInfo || isDraw);

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
    setWinnerInfo({ winner: 'O', timeout: true });
    setScores((prev) => ({ ...prev, ai: prev.ai + 1 }));
  };

  // Start Game from Setup Screen
  const handleStartGame = (e) => {
    if (e) e.preventDefault();
    const finalName = playerName.trim() || 'Player 1';
    setPlayerName(finalName);
    setStoredPlayerName(finalName);
    setStoredDifficulty(difficulty);
    setStoredSinglePlayerTimer(timerSetting);

    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    setBoard(resetBoard());
    setWinnerInfo(null);
    setIsDraw(false);
    setCurrentTurn('X');
    setTimeLeft(timerSetting);
    setIsAiThinking(false);

    playSound('pop');
    setIsGameStarted(true);
  };

  // Human Player Move
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
      setScores((prev) => ({ ...prev, human: prev.human + 1 }));
      playSound('win');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
      return;
    }

    // 2. Check Draw
    if (checkDraw(boardAfterHuman)) {
      setIsDraw(true);
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      playSound('draw');
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
          setScores((prev) => ({ ...prev, ai: prev.ai + 1 }));
          playSound('draw');
        } else if (checkDraw(boardAfterAI)) {
          setIsDraw(true);
          setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
          playSound('draw');
        } else {
          setCurrentTurn('X');
          setTimeLeft(curTimer);
        }
      }

      setIsAiThinking(false);
    }, 450);
  };

  // Instant 1-Click Rematch (Cleans board for next round, keeps running scores)
  const handleRematch = () => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    playSound('pop');
    setBoard(resetBoard());
    setWinnerInfo(null);
    setIsDraw(false);
    setCurrentTurn('X');
    setTimeLeft(timerSetting);
    setIsAiThinking(false);
  };

  // Reset Scores and Board
  const handleResetScores = () => {
    playSound('pop');
    setScores({ human: 0, ai: 0, draws: 0 });
    handleRematch();
  };

  // Return to Setup Screen
  const handleReturnToSetup = () => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    playSound('pop');
    setIsGameStarted(false);
    setShowSettingsModal(false);
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
              Time Ran Out!
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              AI Bot was awarded the win
            </span>
          </div>
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
              Match Draw!
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Well played! Board is tied.
            </span>
          </div>
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
              Victory!
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              You defeated the {difficulty.toUpperCase()} AI!
            </span>
          </div>
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
            Defeat!
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            AI Bot won this round
          </span>
        </div>
      </>
    );
  };

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
        onRestart={isGameStarted ? handleRematch : null}
        restartLabel="Rematch"
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
                  Configure your settings and challenge the AI Bot
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

                {/* Start Game Button */}
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
             2. ACTIVE GAME ARENA: Single Round with Instant Rematch
             ============================================================ */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Scoreboard Bar */}
            <div className="players-match-bar">
              <PlayerCard
                name={playerName}
                symbol="X"
                score={scores.human}
                isActiveTurn={currentTurn === 'X' && !isRoundEnded}
                isUser
              />

              <div className="match-vs-divider">
                <span className="round-pill" style={{ textTransform: 'capitalize' }}>
                  {difficulty} AI
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', marginTop: '2px' }}>
                  VS
                </span>
              </div>

              <PlayerCard
                name="AI Bot"
                symbol="O"
                score={scores.ai}
                isActiveTurn={currentTurn === 'O' && !isRoundEnded}
              />
            </div>

            {/* Turn & Match Commentary */}
            <PlayerStatus
              message={
                isRoundEnded
                  ? (winnerInfo?.winner === 'X'
                      ? '🎉 You Won!'
                      : winnerInfo?.winner === 'O'
                      ? (winnerInfo?.timeout ? '⏳ Time Out!' : '💀 AI Bot Won!')
                      : '🤝 Match Draw!')
                  : currentTurn === 'X'
                  ? (isTimeCritical ? '⚠️ Hurry up! Time Running Out!' : 'Your Turn (X)')
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

            {/* 3x3 Game Board with In-Board Blurred Outcome Overlay */}
            <GameBoard
              board={board}
              onCellClick={handleCellClick}
              disabled={Boolean(isRoundEnded || currentTurn !== 'X' || isAiThinking)}
              winningLine={winnerInfo?.winningLine}
              overlay={getRoundOverlay()}
            />

            {/* Action Buttons Row */}
            {isRoundEnded ? (
              /* Round Finished: Prominent REMATCH and Setup Controls */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.85rem', width: '100%', maxWidth: '380px' }}>
                <Button
                  variant="primary"
                  size="lg"
                  className="btn-block"
                  onClick={handleRematch}
                  icon={RotateCcw}
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '900',
                    boxShadow: '0 0 25px var(--color-x-glow)',
                  }}
                >
                  REMATCH
                </Button>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <Button
                    variant="secondary"
                    size="md"
                    className="btn-block"
                    onClick={() => setShowSettingsModal(true)}
                    icon={Settings}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="btn-block"
                    onClick={() => setShowLeaveModal(true)}
                    icon={LogOut}
                  >
                    Leave Game
                  </Button>
                </div>
              </div>
            ) : (
              /* Round in Progress: Leave Game & Settings (NO Give Up) */
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
        message="Are you sure you want to exit to the main menu? Your current game session and scores will be reset."
        confirmText="Leave Game"
        confirmVariant="danger"
        onConfirm={() => {
          setShowLeaveModal(false);
          setIsGameStarted(false);
          navigate('/');
        }}
        onCancel={() => setShowLeaveModal(false)}
      />

      {/* Settings Modal (AI Difficulty, Timer, and Score Reset) */}
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
            <div style={{ marginBottom: '1.25rem' }}>
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

            {/* Reset Scores Option */}
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  handleResetScores();
                  setShowSettingsModal(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <RotateCcw size={15} /> Reset Scoreboard ({scores.human} - {scores.ai})
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Button
                variant="secondary"
                size="md"
                className="btn-block"
                onClick={handleReturnToSetup}
              >
                Change Setup
              </Button>
              <Button
                variant="primary"
                size="md"
                className="btn-block"
                onClick={() => setShowSettingsModal(false)}
              >
                Apply & Close
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
