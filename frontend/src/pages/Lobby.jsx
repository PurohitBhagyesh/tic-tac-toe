import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle2, Clock, Loader2, LogOut } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import PlayerCard from '../components/PlayerCard';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../services/api';
import { socketService, connectSocket } from '../services/socket';
import { getStoredPlayerId } from '../utils/storage';

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
    // Player joined event
    const cleanupJoined = socketService.onPlayerJoined(({ room: updatedRoom }) => {
      setRoom(updatedRoom);
    });

    // Ready status update
    const cleanupReady = socketService.onReadyUpdate(({ room: updatedRoom, playerId, ready }) => {
      setRoom(updatedRoom);
      if (playerId === currentUserId) {
        setIsReady(ready);
      }
    });

    // Game starts when both are ready!
    const cleanupStart = socketService.onGameStart(({ room: updatedRoom }) => {
      console.log('🎮 Game start received in Lobby!');
      navigate(`/game/${roomCode}`, {
        state: { room: updatedRoom, player: currentUser }
      });
    });

    // Player left
    const cleanupLeft = socketService.onPlayerLeft(({ room: updatedRoom, leavingPlayer }) => {
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
  const handleToggleReady = async () => {
    if (!roomCode || !currentUserId) return;
    const nextReady = !isReady;
    setIsReady(nextReady);
    socketService.sendReady(roomCode, currentUserId, nextReady);
  };

  // Leave room
  const handleLeaveRoom = async () => {
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#94a3b8' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading Game Lobby...</span>
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
                padding: '0.25rem 0.85rem',
                background: 'rgba(0, 240, 255, 0.1)',
                borderRadius: '16px',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                color: '#00f0ff',
                fontSize: '0.85rem',
                fontWeight: '700',
                fontFamily: 'var(--font-mono)',
                marginBottom: '0.5rem'
              }}>
                ROOM: {roomCode}
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc' }}>
                Game Lobby
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Both players must click Ready to start the 5-round match
              </p>
            </div>

            {/* Players Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              width: '100%',
            }}>
              {/* Player 1 Card */}
              {player1 ? (
                <PlayerCard
                  name={player1.name}
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
                  <span>Waiting for Player 1...</span>
                </div>
              )}

              {/* Player 2 Card */}
              {player2 ? (
                <PlayerCard
                  name={player2.name}
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
                  gap: '0.5rem',
                  border: '1.5px dashed rgba(255,255,255,0.15)',
                  color: '#94a3b8'
                }}>
                  <Loader2 size={24} style={{ animation: 'spin 2s linear infinite', color: '#ff0055' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Waiting for Player 2</span>
                </div>
              )}
            </div>

            {/* Ready Action Section */}
            <div style={{ width: '100%', marginTop: '0.5rem' }}>
              <Button
                variant={isReady ? 'secondary' : 'primary'}
                size="lg"
                className="btn-block"
                onClick={handleToggleReady}
                disabled={!player2}
                icon={isReady ? CheckCircle2 : Clock}
              >
                {isReady ? 'CANCEL READY' : 'READY TO PLAY'}
              </Button>
            </div>

            {/* Status notification */}
            {player2 && (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
                {player1?.ready && player2?.ready ? (
                  <span style={{ color: '#4ade80', fontWeight: '700' }}>Starting match in a moment...</span>
                ) : isReady ? (
                  <span>Waiting for opponent to get ready...</span>
                ) : (
                  <span>Click Ready when you are set!</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Leave Room Modal */}
        <ConfirmModal
          isOpen={showLeaveModal}
          title="Leave Room"
          message="Are you sure you want to leave this lobby?"
          confirmText="Leave Lobby"
          onConfirm={handleLeaveRoom}
          onCancel={() => setShowLeaveModal(false)}
        />
      </main>
    </div>
  );
};

export default Lobby;
