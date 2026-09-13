import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Bot, User, RotateCcw, Home as HomeIcon, Check } from 'lucide-react';
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
} from '../utils/storage';

const SinglePlayer = () => {
  const navigate = useNavigate();

  // Setup state
  const [isConfigured, setIsConfigured] = useState(false);
  const [playerName, setPlayerName] = useState(getStoredPlayerName() || 'Player 1');
  const [difficulty, setDifficulty] = useState(getStoredDifficulty() || 'medium');

  // Game state
  const [board, setBoard] = useState(resetBoard());
  const [currentTurn, setCurrentTurn] = useState('X'); // Player = X, AI = O
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null); // { winner: 'X'|'O', winningLine: [...] }
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ human: 0, ai: 0, draws: 0 });

  // Handle game finish button in setup
  const handleFinishSetup = (e) => {
    if (e) e.preventDefault();
    const finalName = playerName.trim() || 'Player 1';
    setPlayerName(finalName);
    setStoredPlayerName(finalName);
    setStoredDifficulty(difficulty);
    setIsConfigured(true);
  };

  // Human player move handler
  const handleCellClick = (index) => {
    if (winnerInfo || isDraw || currentTurn !== 'X' || isAiThinking || board[index] !== null) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    // Check outcome
    const win = checkWinner(newBoard);
    if (win) {
      setWinnerInfo(win);
      setScores(prev => ({ ...prev, human: prev.human + 1 }));
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      return;
    }

    if (checkDraw(newBoard)) {
      setIsDraw(true);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      return;
    }

    // Pass turn to AI
    setCurrentTurn('O');
  };

  // AI Turn handler with realistic short delay
  useEffect(() => {
    if (!isConfigured || currentTurn !== 'O' || winnerInfo || isDraw) return;

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      const aiMoveIndex = getAIMove(board, difficulty, 'O', 'X');

      if (aiMoveIndex !== null && aiMoveIndex !== undefined) {
        const newBoard = [...board];
        newBoard[aiMoveIndex] = 'O';
        setBoard(newBoard);

        const win = checkWinner(newBoard);
        if (win) {
          setWinnerInfo(win);
          setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
        } else if (checkDraw(newBoard)) {
          setIsDraw(true);
          setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        } else {
          setCurrentTurn('X');
        }
      }
      setIsAiThinking(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [currentTurn, isConfigured, board, difficulty, winnerInfo, isDraw]);

  // Rematch
  const handleRematch = () => {
    setBoard(resetBoard());
    setWinnerInfo(null);
    setIsDraw(false);
    setCurrentTurn('X');
    setIsAiThinking(false);
  };

  return (
    <div className="app-container">
      <Header showBack backTo="/" />

      <main className="main-content">
        {!isConfigured ? (
          /* Setup View */
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(0, 240, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                border: '1px solid rgba(0, 240, 255, 0.3)'
              }}>
                <Bot size={28} color="#00f0ff" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc' }}>
                Singleplayer Setup
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Choose your name and AI difficulty
              </p>
            </div>

            <form onSubmit={handleFinishSetup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

              <div className="input-group">
                <label className="input-label">Difficulty</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {['Easy', 'Medium', 'Hard'].map((lvl) => {
                    const isSelected = difficulty.toLowerCase() === lvl.toLowerCase();
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl.toLowerCase())}
                        style={{
                          padding: '0.75rem 0.5rem',
                          borderRadius: '12px',
                          border: isSelected ? '1.5px solid #00f0ff' : '1px solid var(--border-glass)',
                          background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? '#00f0ff' : '#94a3b8',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        {lvl}
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <Button type="submit" variant="primary" size="lg" className="btn-block">
                  Finish
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
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>VS</span>
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

            {/* Turn / Outcome Commentary */}
            {!winnerInfo && !isDraw ? (
              <PlayerStatus
                message={currentTurn === 'X' ? 'Your Turn' : 'AI is thinking...'}
                isThinking={isAiThinking}
                highlight={currentTurn === 'X' ? 'x' : 'o'}
              />
            ) : (
              <div style={{ margin: '0.5rem 0', textAlign: 'center' }}>
                {winnerInfo?.winner === 'X' && (
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#00f0ff', textShadow: '0 0 15px rgba(0,240,255,0.5)' }}>
                    🎉 You are the Winner!
                  </h3>
                )}
                {winnerInfo?.winner === 'O' && (
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ff0055', textShadow: '0 0 15px rgba(255,0,85,0.5)' }}>
                    💀 You Lose!
                  </h3>
                )}
                {isDraw && (
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#cbd5e1' }}>
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
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', width: '100%', maxWidth: '380px' }}>
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
                onClick={() => navigate('/')}
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
