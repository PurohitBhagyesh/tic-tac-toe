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

const CreateRoom = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(getStoredPlayerName() || '');
  const [roomData, setRoomData] = useState(null); // { roomCode, player, room }
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle room creation via REST API
  const handleCreateRoom = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const finalName = playerName.trim() || 'Player 1';
    setStoredPlayerName(finalName);

    try {
      const result = await api.createRoom(finalName);
      if (result.success) {
        setRoomData(result);
        setStoredPlayerId(result.player.id);

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
      // If room has 2 players, transition to lobby
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
                <Sparkles size={28} color="#00f0ff" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc' }}>
                Create Game Room
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                You will play as Player 1 (<span style={{ color: '#00f0ff', fontWeight: '800' }}>X</span>)
              </p>
            </div>

            {errorMessage && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(255, 0, 85, 0.15)',
                border: '1px solid rgba(255, 0, 85, 0.3)',
                borderRadius: '10px',
                color: '#ff4d79',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <XCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="host-name">Enter your name</label>
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
                {isLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Room'}
              </Button>
            </form>
          </div>
        ) : (
          /* Step 2: Room Created -> Display Code, QR & Waiting Status */
          <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc' }}>
                Room Created!
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Share the 6-digit code or QR code with Player 2
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
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '20px',
              color: '#facc15',
              fontWeight: '600',
              fontSize: '0.9rem'
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
