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
          alignItems: 'stretch'
        }}>
          {/* Create Room */}
          <div className="glass-card" style={{
            padding: '2.25rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'space-between',
            height: '100%',
            minHeight: '330px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              flex: 1
            }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '22px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1.5px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px var(--color-x-glow)',
                marginBottom: '1.25rem'
              }}>
                <PlusCircle size={34} color="var(--color-x)" />
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Create Room
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.92rem',
                lineHeight: '1.5',
                minHeight: '3.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Host a new room, get a 6-digit code, and share the QR code with your friend.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="btn-block"
              onClick={() => navigate('/create-room')}
              style={{ marginTop: '1.25rem' }}
            >
              Create Room
            </Button>
          </div>

          {/* Join Room */}
          <div className="glass-card" style={{
            padding: '2.25rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'space-between',
            height: '100%',
            minHeight: '330px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              flex: 1
            }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '22px',
                background: 'rgba(251, 113, 133, 0.12)',
                border: '1.5px solid rgba(251, 113, 133, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px var(--color-o-glow)',
                marginBottom: '1.25rem'
              }}>
                <LogIn size={34} color="var(--color-o)" />
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Join Room
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.92rem',
                lineHeight: '1.5',
                minHeight: '3.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Enter an existing 6-digit code or scan the host’s QR code with your camera.
              </p>
            </div>

            <Button
              variant="accent"
              size="lg"
              className="btn-block"
              onClick={() => navigate('/join')}
              style={{ marginTop: '1.25rem' }}
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
