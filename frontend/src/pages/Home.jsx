import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Users, Play, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import Header from '../components/Header';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#a5b4fc',
            marginBottom: '1rem'
          }}>
            <Sparkles size={14} color="#818cf8" />
            <span>Next-Gen Full-Stack Experience</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Welcome to <span className="title-gradient">Tic-Tac-Toe</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500' }}>
            Choose what to play
          </p>
        </div>

        {/* Game Mode Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '680px',
        }}>
          {/* Card 1: Singleplayer */}
          <div className="glass-card" style={{
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)'
            }}>
              <Bot size={32} color="#00f0ff" />
            </div>

            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.35rem' }}>
                Singleplayer
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Play against AI with Easy, Medium, or Unbeatable Hard Minimax mode.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="btn-block"
              onClick={() => navigate('/singleplayer')}
              icon={Play}
            >
              PLAY
            </Button>
          </div>

          {/* Card 2: Multiplayer */}
          <div className="glass-card" style={{
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'rgba(255, 0, 85, 0.1)',
              border: '1px solid rgba(255, 0, 85, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(255, 0, 85, 0.15)'
            }}>
              <Users size={32} color="#ff0055" />
            </div>

            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.35rem' }}>
                Multiplayer
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Play against another person in real-time with 6-digit codes and QR scanner.
              </p>
            </div>

            <Button
              variant="accent"
              size="lg"
              className="btn-block"
              onClick={() => navigate('/multiplayer')}
              icon={Play}
            >
              PLAY
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
