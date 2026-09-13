import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Flag, Play, Loader2 } from 'lucide-react';
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

  const currentUserId = currentUser?.id || getStoredPlayerId();

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
          {!isRoundEnded ? (
            <PlayerStatus
              message={isMyTurn ? 'Your Turn' : "Opponent's Turn"}
              isThinking={!isMyTurn}
              highlight={isMyTurn ? (mySymbol === 'X' ? 'x' : 'o') : null}
            />
          ) : (
            <div style={{
              margin: '0.5rem 0',
              padding: '0.6rem 1.4rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1.5px solid var(--border-glass-bright)',
              borderRadius: '24px',
              textAlign: 'center',
              boxShadow: '0 0 20px var(--color-x-glow)'
            }}>
              <span style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--color-x)' }}>
                {match.roundWinner === 'draw'
                  ? '🤝 Round Draw!'
                  : `🎉 ${match.roundWinner === 'X' ? (player1?.name || 'Player 1') : (player2?.name || 'Player 2')} won Round ${match.currentRound}!`}
              </span>
            </div>
          )}

          {/* 3x3 Interactive Game Board */}
          <GameBoard
            board={match.board}
            onCellClick={handleCellClick}
            disabled={!isMyTurn || isRoundEnded}
            winningLine={match.winningLine}
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
