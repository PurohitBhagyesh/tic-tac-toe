import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Trophy, Frown, Award, RotateCcw, Home, Loader2, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import { api } from '../services/api';
import { socketService, connectSocket } from '../services/socket';
import { getStoredPlayerId } from '../utils/storage';
import { playSound } from '../utils/sound';

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

  // Handle Confetti, sounds, and rematch listeners
  useEffect(() => {
    if (!room?.match) return;

    const match = room.match;
    const player1 = room.players?.[0];
    const isPlayer1 = currentUser?.id === player1?.id;
    const mySymbol = isPlayer1 ? 'X' : 'O';

    if (match.matchWinner === mySymbol) {
      playSound('win');
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
    } else if (match.matchWinner === 'draw') {
      playSound('draw');
    } else {
      playSound('draw');
    }

    // Rematch update from opponent
    const cleanupRematchUpdate = socketService.onRematchUpdate(({ room: updatedRoom, votedPlayer }) => {
      setRoom(updatedRoom);
      playSound('pop');
      if (votedPlayer?.id !== currentUserId) {
        setOpponentWantsRematch(true);
      }
    });

    // Rematch accepted by both -> restart game!
    const cleanupGameStart = socketService.onGameStart(({ room: updatedRoom }) => {
      playSound('win');
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
    playSound('click');
    setRematchRequested(true);
    socketService.sendRematch(roomCode, currentUserId);
  };

  const match = room?.match;
  const player1 = room?.players?.[0];
  const player2 = room?.players?.[1];

  const isPlayer1 = currentUser?.id === player1?.id;
  const mySymbol = isPlayer1 ? 'X' : 'O';

  let outcomeType = 'draw';
  if (match?.matchWinner === mySymbol) {
    outcomeType = 'win';
  } else if (match?.matchWinner && match?.matchWinner !== 'draw') {
    outcomeType = 'lose';
  }

  const p1Name = player1?.name || 'Player 1';
  const p2Name = player2?.name || 'Player 2';

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#94a3b8' }}>
            <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#00f0ff' }} />
            <span style={{ fontWeight: '700' }}>Calculating Final Match Results...</span>
          </div>
        ) : (
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '460px',
            padding: '2.5rem 1.85rem',
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
                    width: '80px',
                    height: '80px',
                    borderRadius: '26px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1.5px solid rgba(16, 185, 129, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    boxShadow: '0 0 30px var(--color-x-glow)'
                  }}>
                    <Trophy size={44} color="var(--color-x)" />
                  </div>
                  <h1 style={{ fontSize: '2.1rem', fontWeight: '900', color: 'var(--color-x)', letterSpacing: '-0.02em', textShadow: '0 0 20px var(--color-x-glow)' }}>
                    You Are The Winner!
                  </h1>
                </>
              )}

              {outcomeType === 'lose' && (
                <>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '26px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1.5px solid rgba(245, 158, 11, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    boxShadow: '0 0 30px var(--color-o-glow)'
                  }}>
                    <Frown size={44} color="var(--color-o)" />
                  </div>
                  <h1 style={{ fontSize: '2.1rem', fontWeight: '900', color: 'var(--color-o)', letterSpacing: '-0.02em', textShadow: '0 0 20px var(--color-o-glow)' }}>
                    You Are The Loser!
                  </h1>
                </>
              )}

              {outcomeType === 'draw' && (
                <>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '26px',
                    background: 'rgba(52, 211, 153, 0.12)',
                    border: '1.5px solid rgba(52, 211, 153, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    boxShadow: '0 0 25px var(--color-x-glow)'
                  }}>
                    <Award size={44} color="var(--color-x)" />
                  </div>
                  <h1 style={{ fontSize: '2.1rem', fontWeight: '900', color: 'var(--text-secondary)', letterSpacing: '-0.02em' }}>
                    Match Draw!
                  </h1>
                </>
              )}
            </div>

            {/* Final Score Board */}
            <div style={{
              width: '100%',
              padding: '1.4rem',
              background: 'var(--bg-input)',
              border: '1.5px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                FINAL SCORE (5 ROUNDS)
              </span>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-x)' }}>
                    {p1Name} (X)
                  </span>
                  <span style={{ fontSize: '2.6rem', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--color-x)' }}>
                    {match?.scores?.X || 0}
                  </span>
                </div>

                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-muted)' }}>-</span>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-o)' }}>
                    {p2Name} (O)
                  </span>
                  <span style={{ fontSize: '2.6rem', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--color-o)' }}>
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
                fontSize: '0.92rem',
                fontWeight: '800'
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
                color: '#fbbf24',
                fontSize: '0.92rem',
                fontWeight: '700'
              }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Waiting for opponent to accept rematch…</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
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
                onClick={() => {
                  playSound('click');
                  navigate('/');
                }}
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
