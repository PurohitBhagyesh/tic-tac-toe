import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Trophy, Frown, Award, RotateCcw, Home, Loader2, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import { api } from '../services/api';
import { socketService, connectSocket } from '../services/socket';
import { getStoredPlayerId } from '../utils/storage';

const Result = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [room, setRoom] = useState(location.state?.room || null);
  const [currentUser, setCurrentUser] = useState(location.state?.player || null);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);
  const [isLoading, setIsLoading] = useState(!location.state?.room);

  const currentUserId = currentUser?.id || getStoredPlayerId();

  useEffect(() => {
    connectSocket();
    if (roomCode && currentUserId) {
      socketService.joinRoom(roomCode, currentUserId);
    }

    const fetchResult = async () => {
      try {
        const data = await api.getRoom(roomCode);
        if (data.success) {
          setRoom(data.room);
          const user = data.room.players.find(p => p.id === currentUserId);
          if (user) setCurrentUser(user);

          // Check if current user already voted for rematch
          if (data.room.rematchVotes?.includes(currentUserId)) {
            setRematchRequested(true);
          }
        }
      } catch (err) {
        console.error('Result fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [roomCode, currentUserId]);

  // Handle Confetti and rematch listeners
  useEffect(() => {
    if (!room?.match) return;

    const match = room.match;
    const player1 = room.players?.[0];
    const isPlayer1 = currentUser?.id === player1?.id;
    const mySymbol = isPlayer1 ? 'X' : 'O';

    if (match.matchWinner === mySymbol) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    }

    // Rematch update from opponent
    const cleanupRematchUpdate = socketService.onRematchUpdate(({ room: updatedRoom, votedPlayer }) => {
      setRoom(updatedRoom);
      if (votedPlayer?.id !== currentUserId) {
        setOpponentWantsRematch(true);
      }
    });

    // Rematch accepted by both -> restart game!
    const cleanupGameStart = socketService.onGameStart(({ room: updatedRoom }) => {
      navigate(`/game/${roomCode}`, {
        state: { room: updatedRoom, player: currentUser }
      });
    });

    return () => {
      cleanupRematchUpdate();
      cleanupGameStart();
    };
  }, [room, currentUser, currentUserId, roomCode, navigate]);

  const handleRematch = () => {
    if (!roomCode || !currentUserId) return;
    setRematchRequested(true);
    socketService.sendRematch(roomCode, currentUserId);
  };

  const match = room?.match;
  const player1 = room?.players?.[0];
  const player2 = room?.players?.[1];

  const isPlayer1 = currentUser?.id === player1?.id;
  const mySymbol = isPlayer1 ? 'X' : 'O';

  let outcomeType = 'draw'; // 'win', 'lose', 'draw'
  if (match?.matchWinner === mySymbol) {
    outcomeType = 'win';
  } else if (match?.matchWinner && match?.matchWinner !== 'draw') {
    outcomeType = 'lose';
  }

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#94a3b8' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Calculating Final Match Results...</span>
          </div>
        ) : (
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '460px',
            padding: '2.25rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.5rem'
          }}>
            {/* Outcome Icon & Title */}
            <div>
              {outcomeType === 'win' && (
                <>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '24px',
                    background: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)'
                  }}>
                    <Trophy size={40} color="#00f0ff" />
                  </div>
                  <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#00f0ff', letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
                    You Are The Winner!
                  </h1>
                </>
              )}

              {outcomeType === 'lose' && (
                <>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '24px',
                    background: 'rgba(255, 0, 85, 0.15)',
                    border: '1px solid rgba(255, 0, 85, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    boxShadow: '0 0 30px rgba(255, 0, 85, 0.3)'
                  }}>
                    <Frown size={40} color="#ff0055" />
                  </div>
                  <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#ff0055', letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(255,0,85,0.4)' }}>
                    You Are The Loser!
                  </h1>
                </>
              )}

              {outcomeType === 'draw' && (
                <>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '24px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)'
                  }}>
                    <Award size={40} color="#818cf8" />
                  </div>
                  <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#cbd5e1', letterSpacing: '-0.02em' }}>
                    Match Draw!
                  </h1>
                </>
              )}
            </div>

            {/* Final Score Board */}
            <div style={{
              width: '100%',
              padding: '1.25rem',
              background: 'rgba(10, 14, 23, 0.7)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
                Final Score (5 Rounds)
              </span>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#00f0ff' }}>
                    {player1?.name || 'Player 1'} (X)
                  </span>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                    {match?.scores?.X || 0}
                  </span>
                </div>

                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#64748b' }}>-</span>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#ff0055' }}>
                    {player2?.name || 'Player 2'} (O)
                  </span>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                    {match?.scores?.O || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Rematch Notification & Status */}
            {opponentWantsRematch && !rematchRequested && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#4ade80',
                fontSize: '0.9rem',
                fontWeight: '700'
              }}>
                <Sparkles size={16} />
                <span>Opponent wants a rematch!</span>
              </div>
            )}

            {rematchRequested && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#facc15',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Waiting for opponent to accept rematch…</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <Button
                variant="primary"
                size="lg"
                className="btn-block"
                onClick={handleRematch}
                disabled={rematchRequested}
                icon={RotateCcw}
              >
                {rematchRequested ? 'Rematch Requested' : 'Rematch'}
              </Button>

              <Button
                variant="secondary"
                size="md"
                className="btn-block"
                onClick={() => navigate('/')}
                icon={Home}
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

export default Result;
