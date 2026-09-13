import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Users, Play, Swords } from 'lucide-react';
import Button from '../components/Button';
import Header from '../components/Header';
import { playSound } from '../utils/sound';

const Home = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    playSound('click');
    navigate(path);
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Hero Area */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 1.15rem',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1.5px solid var(--border-glass-bright)',
            borderRadius: '24px',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
            fontWeight: '800',
            color: 'var(--color-x)',
            marginBottom: '1rem',
            boxShadow: '0 0 16px var(--color-x-glow)'
          }}>
            <Swords size={16} color="var(--color-x)" />
            <span>5-Round Battle Arena</span>
          </div>

          <h1 className="hero-title">
            <span className="hero-title-prefix">Welcome to</span>
            <span className="title-gradient">Tic-Tac-Toe</span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            fontWeight: '600',
            marginTop: '0.35rem',
            letterSpacing: '-0.01em'
          }}>
            Choose your mode and play in real-time
          </p>
        </div>

        {/* Game Mode Selection Cards (Aesthetic Nature Styled & Pixel Equal Heights) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '720px',
          alignItems: 'stretch'
        }}>
          {/* Card 1: Singleplayer (Emerald Nature) */}
          <div className="glass-card" style={{
            padding: '2.25rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'space-between',
            height: '100%',
            minHeight: '340px'
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
                background: 'rgba(56, 189, 248, 0.14)',
                border: '1.5px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--color-x-glow)',
                marginBottom: '1.25rem'
              }}>
                <Bot size={36} color="var(--color-x)" />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Singleplayer
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                minHeight: '3.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Play against AI with Easy, Medium, or Unbeatable Hard Minimax mode.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="btn-block"
              onClick={() => handleNavigate('/singleplayer')}
              icon={Play}
              style={{ marginTop: '1.25rem' }}
            >
              PLAY
            </Button>
          </div>

          {/* Card 2: Multiplayer (Royal Indigo Bluish) */}
          <div className="glass-card" style={{
            padding: '2.25rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'space-between',
            height: '100%',
            minHeight: '340px'
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
                background: 'rgba(129, 140, 248, 0.14)',
                border: '1.5px solid rgba(129, 140, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--color-o-glow)',
                marginBottom: '1.25rem'
              }}>
                <Users size={36} color="var(--color-o)" />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Multiplayer
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                minHeight: '3.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Play with a friend in real-time with 6-digit codes and instant camera QR scanner.
              </p>
            </div>

            <Button
              variant="accent"
              size="lg"
              className="btn-block"
              onClick={() => handleNavigate('/multiplayer')}
              icon={Play}
              style={{ marginTop: '1.25rem' }}
            >
              PLAY
            </Button>
          </div>
        </div>

        {/* Developer Credit Footer */}
        <footer style={{
          marginTop: '2.5rem',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
          fontSize: '0.88rem',
          fontWeight: '700',
          color: 'var(--text-muted)',
        }}>
          <span>Developed by</span>
          <a
            href="https://github.com/PurohitBhagyesh"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--color-x)',
              textDecoration: 'none',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'all 0.2s ease',
            }}
          >
            Bhagyesh Purohit ↗
          </a>
        </footer>
      </main>
    </div>
  );
};

export default Home;

