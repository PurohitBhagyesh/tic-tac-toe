import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Bot, RotateCcw, Home as HomeIcon, Check, Timer, Clock, AlertTriangle, Sparkles } from 'lucide-react';
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

  // Setup state
  const [isConfigured, setIsConfigured] = useState(false);
  const [playerName, setPlayerName] = useState(getStoredPlayerName() || 'Bhagyesh');
  const [difficulty, setDifficulty] = useState(getStoredDifficulty() || 'medium');
  const [timerSetting, setTimerSetting] = useState(getStoredSinglePlayerTimer() || 60);

  // Game state
  const [board, setBoard] = useState(resetBoard());
  const [currentTurn, setCurrentTurn] = useState('X'); // Player = X, AI = O
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ human: 0, ai: 0, draws: 0 });
  const [timeLeft, setTimeLeft] = useState(timerSetting);

  // Format seconds to mm:ss or 0:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Finish setup
  const handleFinishSetup = (e) => {
    if (e) e.preventDefault();
    const finalName = playerName.trim() || 'Player 1';
    setPlayerName(finalName);
    setStoredPlayerName(finalName);
    setStoredDifficulty(difficulty);
    setStoredSinglePlayerTimer(timerSetting);
    setTimeLeft(timerSetting);
    setIsConfigured(true);
    playSound('pop');
  };

  // Turn Timer effect for Human Player (X)
  useEffect(() => {
    if (!isConfigured || currentTurn !== 'X' || winnerInfo || isDraw || isAiThinking) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired!
          clearInterval(interval);
          handlePlayerTimeout();
          return 0;
        }

        // Sound cues for final 5 seconds
        if (prev <= 6 && prev > 1) {
          playSound('tick');
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConfigured, currentTurn, winnerInfo, isDraw, isAiThinking]);

  // Handle Player Timeout Loss
  const handlePlayerTimeout = () => {
    playSound('timeout');
    setWinnerInfo({ winner: 'O', timeout: true });
    setScores((prev) => ({ ...prev, ai: prev.ai + 1 }));
  };

  // Human player move
  const handleCellClick = (index) => {
    if (winnerInfo || isDraw || currentTurn !== 'X' || isAiThinking || board[index] !== null) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    playSound('move_x');

    const win = checkWinner(newBoard);
    if (win) {
      setWinnerInfo(win);
      setScores(prev => ({ ...prev, human: prev.human + 1 }));
      playSound('win');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      return;
    }

    if (checkDraw(newBoard)) {
      setIsDraw(true);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      playSound('draw');
      return;
    }

    setCurrentTurn('O');
  };

  // AI Turn handler with smooth realistic delay
  useEffect(() => {
    if (!isConfigured || currentTurn !== 'O' || winnerInfo || isDraw) return;

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      const aiMoveIndex = getAIMove(board, difficulty, 'O', 'X');

      if (aiMoveIndex !== null && aiMoveIndex !== undefined) {
        const newBoard = [...board];
        newBoard[aiMoveIndex] = 'O';
        setBoard(newBoard);
        playSound('move_o');

        const win = checkWinner(newBoard);
        if (win) {
          setWinnerInfo(win);
          setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
        } else if (checkDraw(newBoard)) {
          setIsDraw(true);
          setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
          playSound('draw');
        } else {
          setCurrentTurn('X');
          setTimeLeft(timerSetting); // Reset timer for player's new turn
        }
      }
      setIsAiThinking(false);
    }, 420);

    return () => clearTimeout(timer);
  }, [currentTurn, isConfigured, board, difficulty, winnerInfo, isDraw, timerSetting]);

  // Rematch
  const handleRematch = () => {
    playSound('pop');
    setBoard(resetBoard());
    setWinnerInfo(null);
    setIsDraw(false);
    setCurrentTurn('X');
    setTimeLeft(timerSetting);
    setIsAiThinking(false);
  };

  // Timer color and progress calculation
  const timerPercentage = Math.max(0, Math.min(100, (timeLeft / timerSetting) * 100));
  const isTimeCritical = timeLeft <= 5 && currentTurn === 'X' && !winnerInfo && !isDraw;
  const isTimeWarning = timeLeft <= 10 && currentTurn === 'X' && !winnerInfo && !isDraw;

  return (
    <div className="app-container">
      <Header showBack backTo="/" />

      <main className="main-content">
        {!isConfigured ? (
          /* Setup View */
          <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '2.25rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: 'rgba(56, 189, 248, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                border: '1.5px solid rgba(56, 189, 248, 0.4)',
                boxShadow: '0 0 20px var(--color-x-glow)'
              }}>
                <Bot size={30} color="var(--color-x)" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                Singleplayer Setup
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
                Set your name, difficulty, and turn timer
              </p>
            </div>

            <form onSubmit={handleFinishSetup} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              {/* Player Name */}
              <div className="input-group">
                <label className="input-label" htmlFor="player-name">Player Name</label>
                <input
                  id="player-name"
                  type="text"
                  className="text-input"
                  placeholder="Enter your name"
                  value={playerName}
                  maxLength={25}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>

              {/* Difficulty Selector */}
              <div className="input-group">
                <label className="input-label">Difficulty</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                  {['Easy', 'Medium', 'Hard'].map((lvl) => {
                    const isSelected = difficulty.toLowerCase() === lvl.toLowerCase();
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setDifficulty(lvl.toLowerCase());
                        }}
                        style={{
                          padding: '0.85rem 0.5rem',
                          borderRadius: '14px',
                          border: isSelected ? '1.5px solid var(--color-x)' : '1px solid var(--border-glass)',
                          background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
                          color: isSelected ? 'var(--color-x)' : 'var(--text-secondary)',
                          fontWeight: '800',
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem',
                          boxShadow: isSelected ? '0 0 15px var(--color-x-glow)' : 'none'
                        }}
                      >
                        {lvl}
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Turn Timer Selector (30s, 1m, 2m) */}
              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="input-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Timer size={16} color="var(--color-x)" /> Turn Timer (Min 30s • Max 2m)
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                  {[
                    { label: '30 Sec', value: 30, desc: 'Fast Pace' },
                    { label: '1 Min', value: 60, desc: 'Standard' },
                    { label: '2 Min', value: 120, desc: 'Strategic' },
                  ].map((option) => {
                    const isSelected = timerSetting === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setTimerSetting(option.value);
                        }}
                        style={{
                          padding: '0.75rem 0.4rem',
                          borderRadius: '14px',
                          border: isSelected ? '1.5px solid var(--color-x)' : '1px solid var(--border-glass)',
                          background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
                          color: isSelected ? 'var(--color-x)' : 'var(--text-secondary)',
                          fontWeight: '800',
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.2rem',
                          boxShadow: isSelected ? '0 0 15px var(--color-x-glow)' : 'none'
                        }}
                      >
                        <span>{option.label}</span>
                        <span style={{ fontSize: '0.72rem', opacity: 0.75, fontWeight: '500' }}>
                          {option.desc}
                        </span>
                        {isSelected && <Check size={14} style={{ marginTop: '2px' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <Button type="submit" variant="primary" size="lg" className="btn-block">
                  Finish & Play
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Game View */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Scoreboard */}
            <div className="players-match-bar">
              <PlayerCard
                name={playerName}
                symbol="X"
                score={scores.human}
                isActiveTurn={currentTurn === 'X' && !winnerInfo && !isDraw}
                isUser
              />

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

            {/* Turn Timer Bar & Badge */}
            {!winnerInfo && !isDraw && (
              <div style={{
                width: '100%',
                maxWidth: '380px',
                margin: '0.5rem 0 0.75rem',
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

            {/* Turn / Outcome Commentary */}
            {!winnerInfo && !isDraw ? (
              <PlayerStatus
                message={currentTurn === 'X' ? (isTimeCritical ? '⚠️ Hurry up! Time running out!' : 'Your Turn') : 'AI is thinking...'}
                isThinking={isAiThinking}
                highlight={currentTurn === 'X' ? (isTimeCritical ? 'o' : 'x') : 'o'}
              />
            ) : (
              <div style={{ margin: '0.5rem 0', textAlign: 'center' }}>
                {winnerInfo?.winner === 'X' && (
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--color-x)', textShadow: '0 0 16px var(--color-x-glow)' }}>
                    🎉 You are the Winner!
                  </h3>
                )}
                {winnerInfo?.winner === 'O' && (
                  <div style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '16px',
                    background: winnerInfo?.timeout ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                    border: `1.5px solid ${winnerInfo?.timeout ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.35)'}`,
                    boxShadow: winnerInfo?.timeout ? '0 0 20px rgba(239, 68, 68, 0.3)' : '0 0 16px var(--color-o-glow)',
                    display: 'inline-block'
                  }}>
                    <h3 style={{
                      fontSize: '1.3rem',
                      fontWeight: '900',
                      color: winnerInfo?.timeout ? '#ef4444' : 'var(--color-o)',
                      margin: 0,
                    }}>
                      {winnerInfo?.timeout ? '⏳ You ran out of time! You lose!' : '💀 You Lose!'}
                    </h3>
                  </div>
                )}
                {isDraw && (
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-secondary)' }}>
                    🤝 It’s a Draw!
                  </h3>
                )}
              </div>
            )}

            {/* 3x3 Board */}
            <GameBoard
              board={board}
              onCellClick={handleCellClick}
              disabled={Boolean(winnerInfo || isDraw || currentTurn !== 'X' || isAiThinking)}
              winningLine={winnerInfo?.winningLine}
            />

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', width: '100%', maxWidth: '380px' }}>
              <Button
                variant="primary"
                size="md"
                className="btn-block"
                onClick={handleRematch}
                icon={RotateCcw}
              >
                Rematch
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
        )}
      </main>
    </div>
  );
};

export default SinglePlayer;
