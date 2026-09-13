import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Users, Play, Sprout, User, Edit3, Check, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import Header from '../components/Header';
import { getStoredPlayerName, setStoredPlayerName } from '../utils/storage';
import { playSound } from '../utils/sound';

const Home = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(getStoredPlayerName() || 'Bhagyesh');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  const handleSaveName = (e) => {
    if (e) e.preventDefault();
    const finalName = tempName.trim() || 'Player 1';
    setPlayerName(finalName);
    setStoredPlayerName(finalName);
    setIsEditingName(false);
    playSound('pop');
  };

  const handleStartEdit = () => {
    playSound('click');
    setTempName(playerName);
    setIsEditingName(true);
  };

  const handleNavigate = (path) => {
    playSound('click');
    navigate(path);
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Hero Area */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', width: '100%' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1.1rem',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '24px',
            fontSize: 'clamp(0.78rem, 2vw, 0.88rem)',
            fontWeight: '800',
            color: 'var(--color-x)',
            marginBottom: '0.85rem',
            boxShadow: '0 0 16px var(--color-x-glow)'
          }}>
            <Sprout size={16} color="var(--color-x)" />
            <span>5-Round Botanical Arena</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 3.4rem)',
            fontWeight: '900',
            letterSpacing: '-0.03em',
            marginBottom: '0.4rem',
            lineHeight: '1.15'
          }}>
            Welcome to <span className="title-gradient">Tic-Tac-Toe</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', fontWeight: '600' }}>
            Choose your mode and play in real-time
          </p>
        </div>

        {/* Prominent On-Screen Player Profile Bar (Fluidly Scalable on Every Screen) */}
        <div className="glass-card" style={{
          width: '100%',
          maxWidth: '720px',
          padding: 'clamp(0.9rem, 2.5vw, 1.25rem) clamp(1rem, 3vw, 1.5rem)',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '0', flex: 1 }}>
            <div style={{
              width: 'clamp(42px, 6vw, 48px)',
              height: 'clamp(42px, 6vw, 48px)',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1.5px solid var(--border-glass-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-x)',
              boxShadow: '0 0 16px var(--color-x-glow)',
              flexShrink: 0
            }}>
              <User size={24} />
            </div>

            {isEditingName ? (
              <form onSubmit={handleSaveName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="text-input"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
                    maxWidth: '220px',
                    fontWeight: '700'
                  }}
                  value={tempName}
                  maxLength={25}
                  onChange={(e) => setTempName(e.target.value)}
                  autoFocus
                  placeholder="Enter name"
                />
                <Button variant="primary" size="sm" type="submit" icon={Check}>
                  Save
                </Button>
              </form>
            ) : (
              <div style={{ minWidth: '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    CURRENT PLAYER
                  </span>
                  <span style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 6px #22c55e'
                  }}></span>
                </div>
                <div style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.35rem)',
                  fontWeight: '900',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {playerName}
                </div>
              </div>
            )}
          </div>

          {!isEditingName && (
            <button
              onClick={handleStartEdit}
              style={{
                background: 'var(--btn-secondary-bg)',
                border: '1.5px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                padding: '0.45rem 0.95rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-glass-bright)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-glass)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Edit3 size={15} /> Change Name
            </button>
          )}
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
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
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

          {/* Card 2: Multiplayer (Amber Blossom Nature) */}
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
                background: 'rgba(245, 158, 11, 0.14)',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
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
      </main>
    </div>
  );
};

export default Home;
