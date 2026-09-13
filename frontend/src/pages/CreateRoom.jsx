import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, XCircle } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import RoomCode from '../components/RoomCode';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { api } from '../services/api';
import { socketService, connectSocket } from '../services/socket';
import { getStoredPlayerName, setStoredPlayerName, setStoredPlayerId } from '../utils/storage';
import { playSound } from '../utils/sound';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(getStoredPlayerName() || 'Bhagyesh');
  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle room creation
  const handleCreateRoom = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const finalName = playerName.trim() || 'Player 1';
    setStoredPlayerName(finalName);
    playSound('click');

    try {
      const result = await api.createRoom(finalName);
      if (result.success) {
        setRoomData(result);
        setStoredPlayerId(result.player.id);
        playSound('pop');

        // Connect Socket.IO and join channel
        connectSocket();
        socketService.joinRoom(result.roomCode, result.player.id);
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      setErrorMessage(err.message || 'Could not create room. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for Player 2 joining
  useEffect(() => {
    if (!roomData?.roomCode) return;

    const cleanupPlayerJoined = socketService.onPlayerJoined(({ room }) => {
      console.log('Player 2 joined! Navigating to lobby...');
      playSound('win');
      if (room.players.length >= 2) {
        navigate(`/lobby/${roomData.roomCode}`, {
          state: { player: roomData.player, room }
        });
      }
    });

    const cleanupError = socketService.onError(({ message }) => {
      setErrorMessage(message);
    });

    return () => {
      cleanupPlayerJoined();
      cleanupError();
    };
  }, [roomData, navigate]);

  // Cancel room creation
  const handleCancel = async () => {
    playSound('click');
    if (roomData?.roomCode && roomData?.player?.id) {
      try {
        await api.leaveRoom(roomData.roomCode, roomData.player.id);
        socketService.leaveRoom(roomData.roomCode, roomData.player.id);
      } catch (e) {}
    }
    navigate('/multiplayer');
  };

  return (
    <div className="app-container">
      <Header showBack backTo="/multiplayer" />

      <main className="main-content">
        {!roomData ? (
          /* Step 1: Input Host Name */
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
                <Sparkles size={30} color="var(--color-x)" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                Create Game Room
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
                You will play as Host (<span style={{ color: 'var(--color-x)', fontWeight: '900' }}>X</span>)
              </p>
            </div>

            {errorMessage && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '12px',
                color: '#ef4444',
                fontSize: '0.88rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <XCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="host-name">Your Name</label>
                <input
                  id="host-name"
                  type="text"
                  className="text-input"
                  placeholder="e.g. Bhagyesh"
                  value={playerName}
                  maxLength={25}
                  onChange={(e) => setPlayerName(e.target.value)}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="btn-block"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Generate Room Code'}
              </Button>
            </form>
          </div>
        ) : (
          /* Step 2: Room Created -> Display Code, QR & Waiting Status */
          <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                Room Ready!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Share this 6-digit code or QR code with Player 2
              </p>
            </div>

            {/* Room Code with Copy */}
            <RoomCode code={roomData.roomCode} />

            {/* QR Code with Share and Copy Link */}
            <QRCodeDisplay roomCode={roomData.roomCode} />

            {/* Waiting Pulse Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1.25rem',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '24px',
              color: 'var(--color-o)',
              fontWeight: '700',
              fontSize: '0.92rem',
              boxShadow: '0 0 15px var(--color-o-glow)'
            }}>
              <Loader2 size={18} style={{ animation: 'spin 1.5s linear infinite' }} />
              <span>Waiting for Player 2 to join…</span>
            </div>

            {/* Cancel Button */}
            <Button
              variant="danger"
              size="md"
              onClick={handleCancel}
            >
              Cancel Room
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateRoom;
