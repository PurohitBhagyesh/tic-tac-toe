import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Flag, Play, Loader2, Timer, Clock } from 'lucide-react';
import Header from '../components/Header';
import GameBoard from '../components/GameBoard';
import PlayerCard from '../components/PlayerCard';
import PlayerStatus from '../components/PlayerStatus';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../services/api';
import { socketService, connectSocket } from '../services/socket';
import { getStoredPlayerId } from '../utils/storage';
import { playSound } from '../utils/sound';

const Game = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [room, setRoom] = useState(location.state?.room || null);
  const [currentUser, setCurrentUser] = useState(location.state?.player || null);
  const [showGiveUpModal, setShowGiveUpModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [roundNotification, setRoundNotification] = useState(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [isTransitioningRound, setIsTransitioningRound] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  const currentUserId = currentUser?.id || getStoredPlayerId();

  // Calculate synchronized remaining time from turnStartedAt
  useEffect(() => {
    if (!room?.match || room.match.status !== 'in_progress') return;

    const startedAt = room.match.turnStartedAt || Date.now();
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const initialRemaining = Math.max(0, 120 - elapsed);
    setTimeLeft(initialRemaining);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // If it's my turn and timer reached 0, emit timeout
          const p1 = room.players?.[0];
          const isP1 = currentUser?.id === p1?.id;
          const mySym = isP1 ? 'X' : 'O';
          if (room.match.currentTurn === mySym && room.match.status === 'in_progress') {
            playSound('timeout');
            socketService.sendTimeout(roomCode, currentUser.id);
          }
          return 0;
        }

        // Sound cue for final 5 seconds on user's turn
        const p1 = room.players?.[0];
        const isP1 = currentUser?.id === p1?.id;
        const mySym = isP1 ? 'X' : 'O';
        if (room.match.currentTurn === mySym && prev <= 6 && prev > 1) {
          playSound('tick');
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room?.match?.currentTurn, room?.match?.turnStartedAt, room?.match?.status, currentUser, roomCode]);

  // Load and join room socket
  useEffect(() => {
    connectSocket();
    if (roomCode && currentUserId) {
      socketService.joinRoom(roomCode, currentUserId);
    }

    const fetchLatestRoom = async () => {
      try {
        const data = await api.getRoom(roomCode);
        if (data.success) {
          setRoom(data.room);
          const user = data.room.players.find(p => p.id === currentUserId);
          if (user) setCurrentUser(user);

          // If match already ended, navigate to result
          if (data.room.status === 'finished' || data.room.match?.status === 'match_ended') {
            navigate(`/result/${roomCode}`, {
              state: { room: data.room, player: user }
            });
          }
        }
      } catch (err) {
        console.error('Fetch game error:', err);
      }
    };

    fetchLatestRoom();
  }, [roomCode, currentUserId, navigate]);

  // Socket.IO real-time game events
  useEffect(() => {
    // 1. Move updates
    const cleanupUpdate = socketService.onGameUpdate(({ room: updatedRoom, lastMove }) => {
      setRoom(updatedRoom);
      setIsTransitioningRound(false);

      if (lastMove) {
        const isHost = lastMove.playerId === updatedRoom.players?.[0]?.id;
        playSound(isHost ? 'move_x' : 'move_o');
      }
    });

    // 2. Round ended
    const cleanupRoundEnd = socketService.onRoundEnd(({ room: updatedRoom, roundWinner, currentRound, message }) => {
      setRoom(updatedRoom);
      setRoundNotification(message);

      if (roundWinner === currentUser?.symbol) {
        playSound('win');
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      } else if (roundWinner === 'draw') {
        playSound('draw');
      } else {
        playSound('draw');
      }
    });

    // 3. Match ended (after 5 rounds or give up)
    const cleanupMatchEnd = socketService.onMatchEnd(({ room: updatedRoom }) => {
      setRoom(updatedRoom);
      navigate(`/result/${roomCode}`, {
        state: { room: updatedRoom, player: currentUser }
      });
    });

    // 4. Opponent left
    const cleanupPlayerLeft = socketService.onPlayerLeft(({ room: updatedRoom, message }) => {
      setRoom(updatedRoom);
      setOpponentDisconnected(true);
      alert(message || 'Your opponent left the game.');
      navigate('/multiplayer');
    });

    // 5. Opponent temporary disconnected
    const cleanupPlayerDisconnected = socketService.onPlayerDisconnected(() => {
      setOpponentDisconnected(true);
    });

    return () => {
      cleanupUpdate();
      cleanupRoundEnd();
      cleanupMatchEnd();
      cleanupPlayerLeft();
      cleanupPlayerDisconnected();
    };
  }, [roomCode, currentUser, navigate]);

  const match = room?.match;
  const player1 = room?.players?.[0];
  const player2 = room?.players?.[1];

  const isPlayer1 = currentUser?.id === player1?.id;
  const mySymbol = isPlayer1 ? 'X' : 'O';
  const isMyTurn = match?.currentTurn === mySymbol && match?.status === 'in_progress';

  // Handle cell click (Request move from authoritative server)
  const handleCellClick = (cellIndex) => {
    if (!isMyTurn || match?.board[cellIndex] !== null || match?.status !== 'in_progress') {
      return;
    }
    socketService.sendMove(roomCode, currentUser.id, cellIndex);
  };

  // Trigger Next Round
  const handleNextRound = () => {
    playSound('pop');
    setIsTransitioningRound(true);
    setRoundNotification(null);
    socketService.sendNextRound(roomCode);
  };

  // Give up
  const handleGiveUpConfirm = () => {
    playSound('draw');
    setShowGiveUpModal(false);
    if (roomCode && currentUser?.id) {
      socketService.sendGiveUp(roomCode, currentUser.id);
    }
  };

  // Leave room
  const handleLeaveConfirm = async () => {
    playSound('click');
    setShowLeaveModal(false);
    if (roomCode && currentUser?.id) {
      socketService.leaveRoom(roomCode, currentUser.id);
      try {
        await api.leaveRoom(roomCode, currentUser.id);
      } catch (e) {}
    }
    navigate('/multiplayer');
  };

  if (!room || !match) {
    return (
      <div className="app-container">
        <Header showBack backTo="/multiplayer" />
        <main className="main-content">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#94a3b8' }}>
            <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#00f0ff' }} />
            <span style={{ fontWeight: '700' }}>Connecting to arena...</span>
          </div>
        </main>
      </div>
    );
  }

  const isRoundEnded = match.status === 'round_ended';
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  const timerPercentage = Math.max(0, Math.min(100, (timeLeft / 120) * 100));
  const isTimeCritical = timeLeft <= 10 && !isRoundEnded;
  const isTimeWarning = timeLeft <= 30 && !isRoundEnded;
  const activePlayerName = match.currentTurn === 'X' ? (player1?.name || 'Player 1') : (player2?.name || 'Player 2');

  // In-board center overlay message card for round completion
  const getRoundOverlay = () => {
    if (!isRoundEnded) return null;

    const isDraw = match.roundWinner === 'draw';
    const isWinnerMe = match.roundWinner === mySymbol;
    const winnerName = match.roundWinner === 'X' ? (player1?.name || 'Player 1') : (player2?.name || 'Player 2');

    if (isDraw) {
      return (
        <>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
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
              Round {match.currentRound} Draw!
            </span>
            <span style={{
              fontSize: 'clamp(0.88rem, 2.7vw, 0.98rem)',
              fontWeight: '700',
              color: 'var(--text-secondary)',
            }}>
              Scores tied this round
            </span>
          </div>
        </>
      );
    }

    if (isWinnerMe) {
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
              Round {match.currentRound} Victory!
            </span>
            <span style={{
              fontSize: 'clamp(0.88rem, 2.7vw, 0.98rem)',
              fontWeight: '700',
              color: 'var(--text-secondary)',
            }}>
              You won this round!
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
            Round {match.currentRound} Defeat!
          </span>
          <span style={{
            fontSize: 'clamp(0.88rem, 2.7vw, 0.98rem)',
            fontWeight: '700',
            color: 'var(--text-secondary)',
          }}>
            {winnerName} won this round
          </span>
        </div>
      </>
    );
  };

  return (
    <div className="app-container">
      <Header
        showBack={false}
        showMenu
        onGiveUp={() => setShowGiveUpModal(true)}
        onLeaveRoom={() => setShowLeaveModal(true)}
        isMultiplayer
      />

      <main className="main-content">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* 5-Round Match Scoreboard */}
          <div className="players-match-bar">
            {player1 && (
              <PlayerCard
                name={player1.name || 'Player 1'}
                symbol="X"
                score={match.scores.X}
                isActiveTurn={match.currentTurn === 'X' && match.status === 'in_progress'}
                isConnected={player1.connected}
                isUser={player1.id === currentUser?.id}
              />
            )}

            <div className="match-vs-divider">
              <span className="round-pill">
                Round {match.currentRound} of {match.maxRounds}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', marginTop: '2px' }}>
                VS
              </span>
            </div>

            {player2 && (
              <PlayerCard
                name={player2.name || 'Player 2'}
                symbol="O"
                score={match.scores.O}
                isActiveTurn={match.currentTurn === 'O' && match.status === 'in_progress'}
                isConnected={player2.connected}
                isUser={player2.id === currentUser?.id}
              />
            )}
          </div>

          {/* Turn & Match Commentary */}
          <PlayerStatus
            message={
              isRoundEnded
                ? `Round ${match.currentRound} Complete`
                : isMyTurn
                ? (isTimeCritical ? '⚠️ Hurry up! 2m Timer Running Out!' : 'Your Turn')
                : `${activePlayerName}'s Turn`
            }
            isThinking={!isMyTurn && !isRoundEnded}
            highlight={isRoundEnded ? 'x' : isMyTurn ? (mySymbol === 'X' ? 'x' : 'o') : null}
          />

          {/* Mandatory 2-Minute Turn Timer Bar & Badge */}
          {!isRoundEnded && (
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
                    color: isMyTurn ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}>
                    {isMyTurn ? 'Your Turn Time (2m limit)' : `${activePlayerName}'s Time (2m limit)`}
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

          {/* 3x3 Interactive Game Board with Blurred In-Board Overlay */}
          <GameBoard
            board={match.board}
            onCellClick={handleCellClick}
            disabled={!isMyTurn || isRoundEnded}
            winningLine={match.winningLine}
            overlay={getRoundOverlay()}
          />

          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', width: '100%', maxWidth: '380px' }}>
            {isRoundEnded && match.currentRound < match.maxRounds ? (
              <Button
                variant="primary"
                size="lg"
                className="btn-block"
                onClick={handleNextRound}
                disabled={isTransitioningRound}
                icon={Play}
              >
                {isTransitioningRound ? 'Loading Next Round...' : 'NEXT ROUND'}
              </Button>
            ) : (
              <Button
                variant="danger"
                size="md"
                className="btn-block"
                onClick={() => {
                  playSound('click');
                  setShowGiveUpModal(true);
                }}
                icon={Flag}
              >
                Give Up
              </Button>
            )}
          </div>
        </div>

        {/* Give Up Confirmation Modal */}
        <ConfirmModal
          isOpen={showGiveUpModal}
          title="Give Up Match"
          message="Are you sure you want to give up? Your opponent will be declared the winner of this match."
          confirmText="Give Up"
          confirmVariant="danger"
          onConfirm={handleGiveUpConfirm}
          onCancel={() => setShowGiveUpModal(false)}
        />

        {/* Leave Room Confirmation Modal */}
        <ConfirmModal
          isOpen={showLeaveModal}
          title="Leave Room"
          message="Are you sure you want to leave? This will exit the active match."
          confirmText="Leave Room"
          confirmVariant="danger"
          onConfirm={handleLeaveConfirm}
          onCancel={() => setShowLeaveModal(false)}
        />
      </main>
    </div>
  );
};

export default Game;
