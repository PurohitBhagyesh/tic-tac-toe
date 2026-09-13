import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { Bot, RotateCcw, Home as HomeIcon, Check, Timer, Clock, Edit2, X, Sparkles, Trophy } from 'lucide-react';
import Header from '../components/Header';
import GameBoard from '../components/GameBoard';
import PlayerCard from '../components/PlayerCard';
import PlayerStatus from '../components/PlayerStatus';
import Button from '../components/Button';
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

  // Stored preferences
  const [playerName, setPlayerName] = useState(() => getStoredPlayerName() || 'Player 1');
  const [difficulty, setDifficulty] = useState(() => getStoredDifficulty() || 'medium');
  const [timerSetting, setTimerSetting] = useState(() => getStoredSinglePlayerTimer() || 60);

  // Edit Name Modal
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  // Finish / Game Over Modal
  const [showFinishModal, setShowFinishModal] = useState(false);

  // Game state
  const [board, setBoard] = useState(() => resetBoard());
  const [currentTurn, setCurrentTurn] = useState('X'); // Human = X, AI = O
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ human: 0, ai: 0, draws: 0 });
  const [timeLeft, setTimeLeft] = useState(() => timerSetting);

  const aiTimeoutRef = useRef(null);

  // Synchronize difficulty and timer refs
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

  // Turn Timer countdown for Human Player (X)
  useEffect(() => {
    if (currentTurn !== 'X' || winnerInfo || isDraw || isAiThinking || timerSetting === 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          playSound('timeout');
          setWinnerInfo({ winner: 'O', timeout: true });
          setScores((s) => ({ ...s, ai: s.ai + 1 }));
          setShowFinishModal(true);
          return 0;
        }

        if (prev <= 6 && prev > 1) {
          playSound('tick');
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn, winnerInfo, isDraw, isAiThinking, timerSetting]);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Human Player Move
  const handleCellClick = (index) => {
    if (winnerInfo || isDraw || currentTurn !== 'X' || isAiThinking || board[index] !== null) {
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
      setShowFinishModal(true);
      playSound('win');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
      return;
    }

    // 2. Check Draw
    if (checkDraw(boardAfterHuman)) {
      setIsDraw(true);
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      setShowFinishModal(true);
      playSound('draw');
      return;
    }

    // 3. Switch to AI turn
    setCurrentTurn('O');
    setIsAiThinking(true);

    // Schedule AI move with natural delay
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    aiTimeoutRef.current = setTimeout(() => {
      const curDiff = difficultyRef.current;
      const curTimer = timerSettingRef.current;

      const aiMove = getAIMove(boardAfterHuman, curDiff, 'O', 'X');
      const finalAiIndex = (aiMove !== null && aiMove !== undefined && boardAfterHuman[aiMove] === null)
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
          setShowFinishModal(true);
          playSound('draw');
        } else if (checkDraw(boardAfterAI)) {
          setIsDraw(true);
          setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
          setShowFinishModal(true);
          playSound('draw');
        } else {
          setCurrentTurn('X');
          setTimeLeft(curTimer);
        }
      }

      setIsAiThinking(false);
    }, 420);
  };

  // Rematch / New Round / Play Again
  const handleRematch = () => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    playSound('pop');
    setBoard(resetBoard());
    setWinnerInfo(null);
    setIsDraw(false);
    setShowFinishModal(false);
    setCurrentTurn('X');
    setTimeLeft(timerSetting);
    setIsAiThinking(false);
  };

  // Forfeit / Give Up
  const handlePlayerForfeit = () => {
    if (winnerInfo || isDraw) return;
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    playSound('draw');
    setWinnerInfo({ winner: 'O', forfeited: true });
    setScores((prev) => ({ ...prev, ai: prev.ai + 1 }));
    setShowFinishModal(true);
    setIsAiThinking(false);
  };

  // Difficulty change
  const handleDifficultyChange = (newDiff) => {
    playSound('click');
    setDifficulty(newDiff);
    setStoredDifficulty(newDiff);
  };

  // Timer change (60s, 30s, 0 = unlimited)
  const handleTimerChange = (newTimer) => {
    playSound('click');
    setTimerSetting(newTimer);
    setStoredSinglePlayerTimer(newTimer);
    setTimeLeft(newTimer);
  };

  // Reset Scoreboard
  const handleResetScores = () => {
    playSound('pop');
    setScores({ human: 0, ai: 0, draws: 0 });
  };

  // Save Player Name from Modal
  const handleSaveName = (e) => {
    if (e) e.preventDefault();
    const finalName = tempName.trim() || 'Player 1';
    setPlayerName(finalName);
    setStoredPlayerName(finalName);
    setIsNameModalOpen(false);
    playSound('pop');
  };

  // Calculate outcome meta for finish screen
  const getOutcomeMeta = () => {
    if (!winnerInfo && !isDraw) return null;

    if (winnerInfo?.forfeited) {
      return {
        type: 'forfeit',
        icon: '🏳️',
        title: 'You gave up!',
        subtitle: 'Round was forfeited to AI',
        titleColor: 'var(--color-coral)',
        glowColor: 'rgba(255, 69, 58, 0.45)',
        badgeBg: 'rgba(255, 69, 58, 0.18)',
        badgeBorder: '2px solid var(--color-coral)',
      };
    }

    if (winnerInfo?.timeout) {
      return {
        type: 'timeout',
        icon: '⏳',
        title: 'Time ran out!',
        subtitle: `You exceeded the ${timerSetting}s turn limit`,
        titleColor: 'var(--color-coral)',
        glowColor: 'rgba(255, 69, 58, 0.45)',
        badgeBg: 'rgba(255, 69, 58, 0.18)',
        badgeBorder: '2px solid var(--color-coral)',
      };
    }

    if (winnerInfo?.winner === 'X') {
      return {
        type: 'win',
        icon: '🏆',
        title: 'Victory!',
        subtitle: `Awesome move! You defeated the ${difficulty.toUpperCase()} AI`,
        titleColor: 'var(--color-x)',
        glowColor: 'var(--color-x-glow)',
        badgeBg: 'rgba(10, 132, 255, 0.18)',
        badgeBorder: '2px solid var(--color-x)',
      };
    }

    if (winnerInfo?.winner === 'O') {
      return {
        type: 'lose',
        icon: '💀',
        title: 'Defeat!',
        subtitle: `The ${difficulty.toUpperCase()} AI Bot won this round`,
        titleColor: 'var(--color-o)',
        glowColor: 'var(--color-o-glow)',
        badgeBg: 'rgba(94, 92, 230, 0.18)',
        badgeBorder: '2px solid var(--color-o)',
      };
    }

    return {
      type: 'draw',
      icon: '🤝',
      title: 'Match Draw!',
      subtitle: 'Well played! Neither side could break through',
      titleColor: 'var(--text-primary)',
      glowColor: 'rgba(255, 255, 255, 0.25)',
      badgeBg: 'rgba(255, 255, 255, 0.12)',
      badgeBorder: '2px solid var(--border-glass-bright)',
    };
  };

  const outcomeMeta = getOutcomeMeta();
  const timerPercentage = timerSetting > 0 ? Math.max(0, Math.min(100, (timeLeft / timerSetting) * 100)) : 100;
  const isTimeCritical = timerSetting > 0 && timeLeft <= 10 && !winnerInfo && !isDraw;
  const isTimeWarning = timerSetting > 0 && timeLeft <= 25 && !winnerInfo && !isDraw;

  return (
    <div className="app-container">
      <Header
        showBack
        backTo="/"
        onRestart={handleRematch}
        restartLabel="Restart Round"
        onGiveUp={!winnerInfo && !isDraw ? handlePlayerForfeit : null}
        giveUpLabel="Forfeit / Give Up"
      />

      <main className="main-content">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* iOS Segmented Controls Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}>
            {/* AI Level Segment */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '4px 6px',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--glass-specular), var(--shadow-sm)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', padding: '0 0.4rem', letterSpacing: '0.04em' }}>
                AI:
              </span>
              {['Easy', 'Medium', 'Hard'].map((lvl) => {
                const isSelected = difficulty.toLowerCase() === lvl.toLowerCase();
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleDifficultyChange(lvl.toLowerCase())}
                    style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: 'var(--radius-pill)',
                      border: isSelected ? '1px solid var(--color-x)' : '1px solid transparent',
                      background: isSelected ? 'rgba(10, 132, 255, 0.22)' : 'transparent',
                      color: isSelected ? 'var(--color-x)' : 'var(--text-secondary)',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      boxShadow: isSelected ? 'var(--glass-specular), 0 0 10px var(--color-x-glow)' : 'none'
                    }}
                  >
                    {lvl}
                    {isSelected && <Check size={11} />}
                  </button>
                );
              })}
            </div>

            {/* Turn Timer Selector Segment */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '4px 6px',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--glass-specular), var(--shadow-sm)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', padding: '0 0.4rem', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={12} /> TIMER:
              </span>
              {[
                { label: '60s', value: 60 },
                { label: '30s', value: 30 },
                { label: 'Off', value: 0 },
              ].map((opt) => {
                const isSelected = timerSetting === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleTimerChange(opt.value)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      border: isSelected ? '1px solid var(--color-o)' : '1px solid transparent',
                      background: isSelected ? 'rgba(94, 92, 230, 0.22)' : 'transparent',
                      color: isSelected ? 'var(--color-o)' : 'var(--text-secondary)',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                      boxShadow: isSelected ? 'var(--glass-specular), 0 0 10px var(--color-o-glow)' : 'none'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scoreboard */}
          <div className="players-match-bar">
            <div style={{ position: 'relative' }}>
              <PlayerCard
                name={playerName}
                symbol="X"
                score={scores.human}
                isActiveTurn={currentTurn === 'X' && !winnerInfo && !isDraw}
                isUser
              />
              <button
                type="button"
                onClick={() => {
                  setTempName(playerName);
                  setIsNameModalOpen(true);
                }}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
                title="Edit Your Name"
              >
                <Edit2 size={12} />
              </button>
            </div>

            <div className="match-vs-divider">
              <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b' }}>VS</span>
              <span className="round-pill" style={{ textTransform: 'capitalize' }}>
                {difficulty} AI
              </span>
            </div>

            <PlayerCard
              name="AI Bot"
              symbol="O"
              score={scores.ai}
              isActiveTurn={currentTurn === 'O' && !winnerInfo && !isDraw}
            />
          </div>

          {/* Turn Timer Bar & Badge (if timer enabled) */}
          {timerSetting > 0 && !winnerInfo && !isDraw && (
            <div style={{
              width: '100%',
              maxWidth: '380px',
              margin: '0.45rem 0 0.75rem',
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
                    {currentTurn === 'X' ? 'Your Turn Time' : 'AI Turn (Paused)'}
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

          {/* Turn Commentary */}
          <PlayerStatus
            message={
              winnerInfo || isDraw
                ? (outcomeMeta?.title ? `Round Ended: ${outcomeMeta.title}` : 'Round Complete')
                : currentTurn === 'X'
                ? (isTimeCritical ? '⚠️ Hurry up! Time running out!' : 'Your Turn (X)')
                : 'AI Bot is thinking (O)...'
            }
            isThinking={isAiThinking && !winnerInfo && !isDraw}
            highlight={winnerInfo || isDraw ? 'x' : currentTurn === 'X' ? 'x' : 'o'}
          />

          {/* 3x3 Board with Winning Highlights */}
          <GameBoard
            board={board}
            onCellClick={handleCellClick}
            disabled={Boolean(winnerInfo || isDraw || currentTurn !== 'X' || isAiThinking)}
            winningLine={winnerInfo?.winningLine}
          />

          {/* Bottom Action Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem', width: '100%', maxWidth: '380px' }}>
            {(winnerInfo || isDraw) ? (
              <div style={{ display: 'flex', gap: '0.65rem', width: '100%' }}>
                <Button
                  variant="primary"
                  size="md"
                  className="btn-block"
                  onClick={handleRematch}
                  icon={RotateCcw}
                  style={{
                    boxShadow: 'var(--glass-specular), 0 8px 24px var(--color-x-glow)',
                    fontWeight: '900',
                  }}
                >
                  Play Again
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowFinishModal(true)}
                  icon={Trophy}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Scorecard
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.65rem', width: '100%' }}>
                <Button
                  variant="secondary"
                  size="md"
                  className="btn-block"
                  onClick={handleRematch}
                  icon={RotateCcw}
                >
                  Restart Round
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
            )}
          </div>
        </div>

        {/* Dedicated iOS Liquid Glass Finish & Game Over Outcome Screen Modal */}
        {showFinishModal && outcomeMeta && createPortal(
          <div className="modal-overlay" onClick={() => setShowFinishModal(false)}>
            <div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '430px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
                padding: 'clamp(1.6rem, 5vw, 2.25rem) clamp(1.2rem, 4vw, 1.85rem)',
              }}
            >
              {/* Outcome Badge Icon */}
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: outcomeMeta.badgeBg,
                border: outcomeMeta.badgeBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.4rem',
                boxShadow: `0 0 32px ${outcomeMeta.glowColor}`,
                animation: 'pulse 2s infinite',
              }}>
                {outcomeMeta.icon}
              </div>

              {/* Title and Subtitle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'center' }}>
                <h2 style={{
                  fontSize: 'clamp(1.75rem, 5.5vw, 2.15rem)',
                  fontWeight: '900',
                  color: outcomeMeta.titleColor,
                  textShadow: `0 0 20px ${outcomeMeta.glowColor}`,
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}>
                  {outcomeMeta.title}
                </h2>
                <p style={{
                  fontSize: 'clamp(0.92rem, 2.8vw, 1.02rem)',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  maxWidth: '320px',
                  lineHeight: '1.4',
                }}>
                  {outcomeMeta.subtitle}
                </p>
              </div>

              {/* Score Summary Card */}
              <div style={{
                width: '100%',
                padding: '1.15rem 1rem',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-glass)',
                boxShadow: 'var(--shadow-sm), var(--glass-inner-bevel)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0 0.25rem',
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    CURRENT SCOREBOARD
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: 'var(--color-x)',
                    background: 'rgba(10, 132, 255, 0.12)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid rgba(10, 132, 255, 0.3)',
                    textTransform: 'capitalize'
                  }}>
                    {difficulty} AI
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  padding: '0.2rem 0',
                }}>
                  {/* Player (X) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-x)' }}>
                      {playerName} (X)
                    </span>
                    <span style={{ fontSize: '2.2rem', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--color-x)' }}>
                      {scores.human}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                      DRAWS
                    </span>
                    <span style={{ fontSize: '1.6rem', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {scores.draws}
                    </span>
                  </div>

                  {/* AI Bot (O) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-o)' }}>
                      AI Bot (O)
                    </span>
                    <span style={{ fontSize: '2.2rem', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--color-o)' }}>
                      {scores.ai}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                <Button
                  variant="primary"
                  size="lg"
                  className="btn-block"
                  onClick={handleRematch}
                  icon={RotateCcw}
                  style={{
                    boxShadow: 'var(--glass-specular), 0 8px 28px var(--color-x-glow)',
                    fontSize: '1.1rem',
                    fontWeight: '900',
                  }}
                >
                  PLAY AGAIN
                </Button>

                <div style={{ display: 'flex', gap: '0.65rem', width: '100%' }}>
                  <Button
                    variant="secondary"
                    size="md"
                    className="btn-block"
                    onClick={() => setShowFinishModal(false)}
                    style={{ fontSize: '0.9rem' }}
                  >
                    View Board
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="btn-block"
                    onClick={handleResetScores}
                    style={{ fontSize: '0.9rem' }}
                  >
                    Reset Scores
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  size="md"
                  className="btn-block"
                  onClick={() => {
                    playSound('click');
                    navigate('/');
                  }}
                  icon={HomeIcon}
                  style={{ marginTop: '0.15rem' }}
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Edit Player Name Modal */}
        {isNameModalOpen && createPortal(
          <div className="modal-overlay" onClick={() => setIsNameModalOpen(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit2 size={20} color="var(--color-x)" />
                  Your Player Name
                </h3>
                <button
                  onClick={() => setIsNameModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="edit-name">Display Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    className="text-input"
                    placeholder="Enter your name"
                    value={tempName}
                    maxLength={25}
                    onChange={(e) => setTempName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <Button variant="secondary" type="button" onClick={() => setIsNameModalOpen(false)} className="btn-block">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" className="btn-block">
                    Save Name
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </main>
    </div>
  );
};

export default SinglePlayer;

