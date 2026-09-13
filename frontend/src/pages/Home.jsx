import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Users, Play, Sparkles, User, Edit3, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import Header from '../components/Header';
import { getStoredPlayerName, setStoredPlayerName } from '../utils/storage';
import { playSound } from '../utils/sound';

const Home = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(getStoredPlayerName() || 'Bhagyesh');
  const [isEditingName, setIsEditingName] = useState(false);

  const handleSaveName = (e) => {
    if (e) e.preventDefault();
    const finalName = playerName.trim() || 'Player 1';
    setPlayerName(finalName);
    setStoredPlayerName(finalName);
    setIsEditingName(false);
    playSound('pop');
  };

  const handleNavigate = (path) => {
    playSound('click');
    navigate(path);
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Hero Title Area */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1.1rem',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: '800',
            color: '#c084fc',
            marginBottom: '1rem',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.25)'
          }}>
            <Sparkles size={15} color="#c084fc" />
            <span>5-Round Real-Time Battle Arena</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.4rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '0.5rem', lineHeight: '1.15' }}>
            Welcome to <span className="title-gradient">Tic-Tac-Toe</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', fontWeight: '600' }}>
            Choose what to play
          </p>
        </div>

        {/* Player Profile Bar (Customize Name) */}
        <div className="glass-card" style={{
          width: '100%',
          maxWidth: '680px',
          padding: '0.9rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1.5px solid var(--border-glass-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-x)',
              boxShadow: '0 0 15px var(--color-x-glow)'
            }}>
              <User size={20} />
            </div>

            {isEditingName ? (
              <form onSubmit={handleSaveName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="text-input"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.95rem', maxWidth: '180px' }}
                  value={playerName}
                  maxLength={25}
                  onChange={(e) => setPlayerName(e.target.value)}
                  autoFocus
                />
                <Button variant="primary" size="sm" type="submit">
                  Save
                </Button>
              </form>
            ) : (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PLAYER NAME
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {playerName}
                </div>
              </div>
            )}
          </div>

          {!isEditingName && (
            <button
              onClick={() => setIsEditingName(true)}
              style={{
                background: 'var(--btn-secondary-bg)',
                border: '1.5px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Edit3 size={14} /> Change
            </button>
          )}
        </div>

        {/* Game Mode Selection Cards (Perfect Equal Heights & Symmetrical Baseline) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '680px',
          alignItems: 'stretch'
        }}>
          {/* Card 1: Singleplayer */}
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
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1.5px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px var(--color-x-glow)',
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

          {/* Card 2: Multiplayer */}
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
                background: 'rgba(251, 113, 133, 0.12)',
                border: '1.5px solid rgba(251, 113, 133, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px var(--color-o-glow)',
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
