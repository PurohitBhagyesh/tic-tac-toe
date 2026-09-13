import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle2, Clock, Loader2, Play, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import PlayerCard from '../components/PlayerCard';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../services/api';
import { socketService, connectSocket } from '../services/socket';
import { getStoredPlayerId } from '../utils/storage';
import { playSound } from '../utils/sound';

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [room, setRoom] = useState(location.state?.room || null);
  const [currentUser, setCurrentUser] = useState(location.state?.player || null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(!location.state?.room);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentUserId = currentUser?.id || getStoredPlayerId();

  // Load room data & ensure socket connection
  useEffect(() => {
    connectSocket();
    if (roomCode && currentUserId) {
      socketService.joinRoom(roomCode, currentUserId);
    }

    const fetchRoom = async () => {
      try {
        const data = await api.getRoom(roomCode);
        if (data.success) {
          setRoom(data.room);
          const user = data.room.players.find(p => p.id === currentUserId);
          if (user) {
            setCurrentUser(user);
            setIsReady(user.ready);
          }
        }
      } catch (err) {
        console.error('Lobby fetch error:', err);
        setErrorMessage(err.message || 'Room not found.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomCode, currentUserId]);

  // Socket event listeners
  useEffect(() => {
    const cleanupJoined = socketService.onPlayerJoined(({ room: updatedRoom }) => {
      setRoom(updatedRoom);
      playSound('pop');
    });

    const cleanupReady = socketService.onReadyUpdate(({ room: updatedRoom, playerId, ready }) => {
      setRoom(updatedRoom);
      playSound('pop');
      if (playerId === currentUserId) {
        setIsReady(ready);
      }
    });

    const cleanupStart = socketService.onGameStart(({ room: updatedRoom }) => {
      playSound('win');
      navigate(`/game/${roomCode}`, {
        state: { room: updatedRoom, player: currentUser }
      });
    });

    const cleanupLeft = socketService.onPlayerLeft(({ room: updatedRoom }) => {
      setRoom(updatedRoom);
      setIsReady(false);
    });

    return () => {
      cleanupJoined();
      cleanupReady();
      cleanupStart();
      cleanupLeft();
    };
  }, [roomCode, currentUserId, currentUser, navigate]);

  // Toggle Ready
  const handleToggleReady = () => {
    if (!roomCode || !currentUserId) return;
    playSound('click');
    const nextReady = !isReady;
    setIsReady(nextReady);
    socketService.sendReady(roomCode, currentUserId, nextReady);
  };

  // Host starts the game
  const handleHostStartGame = () => {
    if (!roomCode || !currentUserId) return;
    playSound('win');
    socketService.sendHostStart(roomCode, currentUserId);
  };

  // Leave room
  const handleLeaveRoom = async () => {
    playSound('click');
    if (roomCode && currentUserId) {
      socketService.leaveRoom(roomCode, currentUserId);
      try {
        await api.leaveRoom(roomCode, currentUserId);
      } catch (e) {}
    }
    navigate('/multiplayer');
  };

  const player1 = room?.players?.[0] || null;
  const player2 = room?.players?.[1] || null;

  const isHost = player1?.id === currentUserId;
  const bothPlayersReady = player1?.ready && player2?.ready;

  return (
    <div className="app-container">
      <Header
        showBack
        backTo="/multiplayer"
        showMenu
        onLeaveRoom={() => setShowLeaveModal(true)}
      />

      <main className="main-content">
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-x)' }} />
            <span style={{ fontWeight: '800' }}>Entering Game Lobby...</span>
          </div>
        ) : errorMessage ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px' }}>
            <h3 style={{ color: '#ff4d79', marginBottom: '1rem' }}>{errorMessage}</h3>
            <Button variant="primary" onClick={() => navigate('/multiplayer')}>
              Back to Multiplayer
            </Button>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            {/* Lobby Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 1.1rem',
                background: 'rgba(56, 189, 248, 0.14)',
                borderRadius: '24px',
                border: '1.5px solid var(--border-glass-bright)',
                color: 'var(--color-x)',
                fontSize: '0.9rem',
                fontWeight: '900',
                fontFamily: 'var(--font-mono)',
                marginBottom: '0.6rem',
                boxShadow: '0 0 16px var(--color-x-glow)'
              }}>
                ROOM #{roomCode}
              </div>
              <h2 style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                Game Lobby
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Both players click Ready ➔ Host starts the match
              </p>
            </div>

            {/* Players Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              width: '100%',
            }}>
              {/* Player 1 (Host) Card */}
              {player1 ? (
                <PlayerCard
                  name={player1.name || 'Player 1'}
                  symbol="X"
                  score={0}
                  isReady={player1.ready}
                  showReady
                  isConnected={player1.connected}
                  isUser={player1.id === currentUserId}
                />
              ) : (
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', opacity: 0.5 }}>
                  <Users size={32} style={{ margin: '0 auto 0.5rem' }} />
                  <span>Waiting for Host...</span>
                </div>
              )}

              {/* Player 2 (Guest) Card */}
              {player2 ? (
                <PlayerCard
                  name={player2.name || 'Player 2'}
                  symbol="O"
                  score={0}
                  isReady={player2.ready}
                  showReady
                  isConnected={player2.connected}
                  isUser={player2.id === currentUserId}
                />
              ) : (
                <div className="glass-card" style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  border: '1.5px dashed var(--border-glass-bright)',
                  color: 'var(--text-secondary)'
                }}>
                  <Loader2 size={26} style={{ animation: 'spin 2s linear infinite', color: 'var(--color-o)' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: '800' }}>Waiting for Player 2</span>
                </div>
              )}
            </div>

            {/* Ready / Start Actions */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
              {/* If both players are ready and current user is HOST -> SHOW START GAME BUTTON! */}
              {bothPlayersReady && isHost ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="btn-block"
                  onClick={handleHostStartGame}
                  icon={Play}
                  style={{
                    boxShadow: '0 0 30px var(--color-x-glow)',
                    fontSize: '1.2rem',
                    padding: '1.15rem'
                  }}
                >
                  START GAME (ROUND 1/5)
                </Button>
              ) : (
                /* Regular Ready Toggle Button */
                <Button
                  variant={isReady ? 'secondary' : 'primary'}
                  size="lg"
                  className="btn-block"
                  onClick={handleToggleReady}
                  disabled={!player2}
                  icon={isReady ? CheckCircle2 : Play}
                >
                  {isReady ? 'CANCEL READY' : 'READY TO PLAY'}
                </Button>
              )}
            </div>

            {/* Status notification */}
            {player2 && (
              <div style={{
                color: 'var(--text-secondary)',
                fontSize: '0.92rem',
                textAlign: 'center',
                fontWeight: '700',
                padding: '0.5rem 1rem',
                borderRadius: '16px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)'
              }}>
                {bothPlayersReady ? (
                  isHost ? (
                    <span style={{ color: 'var(--color-x)', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <Sparkles size={16} /> Both players ready! Click "START GAME" above.
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-x)', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <Clock size={16} /> Both players ready! Waiting for Host to start the game...
                    </span>
                  )
                ) : isReady ? (
                  <span>Waiting for opponent to click Ready...</span>
                ) : (
                  <span>Click Ready when you are prepared!</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Leave Room Modal */}
        <ConfirmModal
          isOpen={showLeaveModal}
          title="Leave Room"
          message="Are you sure you want to exit this lobby?"
          confirmText="Leave Lobby"
          onConfirm={handleLeaveRoom}
          onCancel={() => setShowLeaveModal(false)}
        />
      </main>
    </div>
  );
};

export default Lobby;
