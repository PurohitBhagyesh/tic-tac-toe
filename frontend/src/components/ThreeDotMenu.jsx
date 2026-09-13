import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Volume2, VolumeX, Sun, Moon, BookOpen, LogOut, X, Flag, RotateCcw, SlidersHorizontal } from 'lucide-react';
import Button from './Button';
import { toggleMute, getMuteState, playSound } from '../utils/sound';
import { getStoredTheme, toggleTheme, applyTheme } from '../utils/theme';

const ThreeDotMenu = ({
  onGiveUp = null,
  giveUpLabel = 'Give Up Match',
  onRestart = null,
  restartLabel = 'Restart Match',
  onLeaveRoom = null,
  leaveLabel = 'Exit / Leave Room',
  isMultiplayer = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteState());
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowRules(false);
      }
    };
    if (isOpen || showRules) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showRules]);

  const handleToggleSound = () => {
    const nextMuted = toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      playSound('pop');
    }
  };

  const handleToggleTheme = () => {
    playSound('click');
    const nextTheme = toggleTheme();
    setTheme(nextTheme);
  };

  return (
    <>
      <button
        onClick={() => {
          playSound('click');
          setIsOpen(true);
        }}
        className="btn-icon"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title="Game Options & Settings"
        aria-label="Game options and settings menu"
      >
        <MoreVertical size={20} />
      </button>

      {/* Options & Settings Modal (Portaled to document.body for perfect viewport centering) */}
      {isOpen && createPortal(
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <SlidersHorizontal size={20} color="var(--color-x)" />
                Game Options
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                aria-label="Close options"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* 1. Mute Audio Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'var(--bg-input)',
                border: '1.5px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {isMuted ? <VolumeX size={20} color="var(--text-muted)" /> : <Volume2 size={20} color="var(--color-x)" />}
                  <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Game Audio FX
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSound}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    border: '1.5px solid var(--border-glass)',
                    background: isMuted ? 'rgba(255,255,255,0.06)' : 'rgba(56, 189, 248, 0.2)',
                    color: isMuted ? 'var(--text-muted)' : 'var(--color-x)',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  {isMuted ? 'MUTED' : 'ENABLED'}
                </button>
              </div>

              {/* 2. Dark / Light Mode Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'var(--bg-input)',
                border: '1.5px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {theme === 'dark' ? <Moon size={20} color="#38bdf8" /> : <Sun size={20} color="#f59e0b" />}
                  <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Theme Appearance
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleTheme}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    border: '1.5px solid var(--border-glass)',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: 'var(--color-x)',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {theme === 'dark' ? 'DARK MODE' : 'LIGHT MODE'}
                </button>
              </div>

              {/* 3. Game Rules Button */}
              <button
                type="button"
                onClick={() => {
                  playSound('pop');
                  setIsOpen(false);
                  setShowRules(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-input)',
                  border: '1.5px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <BookOpen size={20} color="var(--color-x)" />
                  <span>Game Rules</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>➔</span>
              </button>

              {/* 4. Restart Option */}
              {onRestart && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onRestart();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.85rem 1rem',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1.5px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-x)',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={20} color="var(--color-x)" />
                  <span>{restartLabel}</span>
                </button>
              )}

              {/* 5. Give Up Option */}
              {onGiveUp && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onGiveUp();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.85rem 1rem',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1.5px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#f43f5e',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  <Flag size={20} color="#f43f5e" />
                  <span>{giveUpLabel}</span>
                </button>
              )}

              {/* 6. Exit / Leave Room Button */}
              {onLeaveRoom && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onLeaveRoom();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.85rem 1rem',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1.5px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#f43f5e',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={20} />
                  <span>{leaveLabel}</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rules Modal (Portaled to document.body) */}
      {showRules && createPortal(
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={22} color="var(--color-x)" />
                Game Rules
              </h3>
              <button
                onClick={() => setShowRules(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                aria-label="Close rules"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <strong style={{ color: 'var(--color-x)' }}>1. Objective:</strong> Place 3 of your marks (X or O) in a horizontal, vertical, or diagonal row to score a point.
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <strong style={{ color: 'var(--color-o)' }}>2. 5-Round Match:</strong> Matches consist of 5 competitive rounds. The player with the most round points wins the match!
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <strong style={{ color: 'var(--color-x)' }}>3. Ready System:</strong> Both players must hit Ready in the lobby. Once both are ready, the Host starts the match!
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <strong style={{ color: '#f59e0b' }}>4. Rematch:</strong> After all 5 rounds, both players can vote for a Rematch to start a fresh battle.
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <Button variant="primary" onClick={() => setShowRules(false)}>
                Got it!
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ThreeDotMenu;
