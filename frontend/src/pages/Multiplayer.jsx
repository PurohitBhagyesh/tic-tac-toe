import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, LogIn, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';

const Multiplayer = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <Header showBack backTo="/" />

      <main className="main-content">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(255, 0, 85, 0.1)',
            border: '1px solid rgba(255, 0, 85, 0.3)',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#ff4d79',
            marginBottom: '1rem'
          }}>
            <Sparkles size={14} color="#ff0055" />
            <span>Real-Time Online Matches</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Multiplayer Mode
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500' }}>
            Create a custom room or join an existing game with a 6-digit code / QR
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '650px',
        }}>
          {/* Create Room */}
          <div className="glass-card" style={{
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.25rem',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PlusCircle size={30} color="#00f0ff" />
            </div>

            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.35rem' }}>
                Create Room
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Host a new room, get a 6-digit code, and share the QR code with your friend.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="btn-block"
              onClick={() => navigate('/create-room')}
            >
              Create Room
            </Button>
          </div>

          {/* Join Room */}
          <div className="glass-card" style={{
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.25rem',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LogIn size={30} color="#818cf8" />
            </div>

            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.35rem' }}>
                Join Room
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Enter an existing 6-digit code or scan the host’s QR code with your camera.
              </p>
            </div>

            <Button
              variant="accent"
              size="lg"
              className="btn-block"
              onClick={() => navigate('/join')}
            >
              Join Room
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Multiplayer;
