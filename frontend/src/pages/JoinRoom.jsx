import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LogIn, Camera, AlertCircle, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import QRScannerModal from '../components/QRScannerModal';
import { api } from '../services/api';
import { socketService, connectSocket } from '../services/socket';
import { getStoredPlayerName, setStoredPlayerName, setStoredPlayerId } from '../utils/storage';
import { playSound } from '../utils/sound';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { roomCode: paramCode } = useParams();

  const [roomCode, setRoomCode] = useState(paramCode || '');
  const [playerName, setPlayerName] = useState(getStoredPlayerName() || '');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize parameter if passed via URL
  useEffect(() => {
    if (paramCode && paramCode.length === 6) {
      setRoomCode(paramCode);
    }
  }, [paramCode]);

  const handleJoin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const cleanCode = roomCode.trim();
    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setErrorMessage('Please enter a valid 6-digit room code.');
      return;
    }

    const finalName = playerName.trim() || 'Player 2';
    setStoredPlayerName(finalName);
    setIsLoading(true);
    playSound('click');

    try {
      const result = await api.joinRoom(cleanCode, finalName);
      if (result.success) {
        setStoredPlayerId(result.player.id);
        playSound('win');

        // Initialize Socket.IO connection and join room
        connectSocket();
        socketService.joinRoom(cleanCode, result.player.id);

        // Navigate to Lobby
        navigate(`/lobby/${cleanCode}`, {
          state: { player: result.player, room: result.room }
        });
      } else {
        setErrorMessage(result.error || 'Could not join room.');
      }
    } catch (err) {
      console.error('Failed to join room:', err);
      setErrorMessage(err.message || 'Room not found or server is offline.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanSuccess = (scannedCode) => {
    playSound('pop');
    setRoomCode(scannedCode);
    setErrorMessage('');
  };

  return (
    <div className="app-container">
      <Header showBack backTo="/multiplayer" />

      <main className="main-content">
        <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '2.25rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'rgba(245, 158, 11, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 0 20px var(--color-o-glow)'
            }}>
              <LogIn size={30} color="var(--color-o)" />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)' }}>
              Join Game Room
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
              Enter 6-digit code or scan host’s QR code
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
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            {/* Room Code Input + QR Scanner Button */}
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label" htmlFor="join-code">6-Digit Room Code</label>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setIsScannerOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-x)',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}
                >
                  <Camera size={15} /> Scan QR
                </button>
              </div>

              <input
                id="join-code"
                type="text"
                className="text-input"
                placeholder="e.g. 482731"
                value={roomCode}
                maxLength={6}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.35rem',
                  letterSpacing: '0.18em',
                  textAlign: 'center',
                  fontWeight: '800',
                  color: 'var(--color-x)'
                }}
                onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))}
                autoFocus={!paramCode}
              />
            </div>

            {/* Player Name Input */}
            <div className="input-group">
              <label className="input-label" htmlFor="player-name">Your Name</label>
              <input
                id="player-name"
                type="text"
                className="text-input"
                placeholder="e.g. Rahul"
                value={playerName}
                maxLength={25}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="btn-block"
              disabled={isLoading || roomCode.length !== 6}
            >
              {isLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Join Game'}
            </Button>
          </form>
        </div>

        {/* QR Code Scanner Camera Modal */}
        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      </main>
    </div>
  );
};

export default JoinRoom;
