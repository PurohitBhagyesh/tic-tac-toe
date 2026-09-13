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
          background: 'rgba(15, 23, 42, 0.55)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00f0ff'
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
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Player Name
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc' }}>
                  {playerName}
                </div>
              </div>
            )}
          </div>

          {!isEditingName && (
            <button
              onClick={() => setIsEditingName(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-glass)',
                color: '#94a3b8',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
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

        {/* Game Mode Selection Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '680px',
        }}>
          {/* Card 1: Singleplayer */}
          <div className="glass-card" style={{
            padding: '2.25rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.25rem',
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '22px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1.5px solid rgba(0, 240, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.25)'
            }}>
              <Bot size={36} color="#00f0ff" />
            </div>

            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f8fafc', marginBottom: '0.4rem' }}>
                Singleplayer
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Play against AI with Easy, Medium, or Unbeatable Hard Minimax mode.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="btn-block"
              onClick={() => handleNavigate('/singleplayer')}
              icon={Play}
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
            gap: '1.25rem',
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '22px',
              background: 'rgba(255, 0, 122, 0.12)',
              border: '1.5px solid rgba(255, 0, 122, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(255, 0, 122, 0.25)'
            }}>
              <Users size={36} color="#ff007a" />
            </div>

            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f8fafc', marginBottom: '0.4rem' }}>
                Multiplayer
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Play with a friend in real-time with 6-digit codes and instant camera QR scanner.
              </p>
            </div>

            <Button
              variant="accent"
              size="lg"
              className="btn-block"
              onClick={() => handleNavigate('/multiplayer')}
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
