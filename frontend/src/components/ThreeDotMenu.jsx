import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Volume2, VolumeX, Sun, Moon, BookOpen, LogOut, X, Flag, RotateCcw, SlidersHorizontal } from 'lucide-react';
import Button from './Button';
import { toggleMute, getMuteState, playSound } from '../utils/sound';
import { getStoredTheme, toggleTheme, applyTheme } from '../utils/theme';

// Modern iOS/Material style sliding toggle switch component (Single ON/OFF button, no inside text)
const ToggleSwitch = ({ checked, onChange, activeColor = 'var(--color-x)', label = '' }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      style={{
        width: '46px',
        height: '26px',
        borderRadius: '13px',
        background: checked ? activeColor : 'rgba(100, 116, 139, 0.28)',
        border: `1.5px solid ${checked ? activeColor : 'var(--border-glass)'}`,
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: checked ? `0 0 12px ${activeColor}` : 'none',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        outline: 'none',
      }}
      title={label}
      aria-label={label}
    >
      <span
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.35)',
          position: 'absolute',
          left: checked ? '22px' : '2px',
          transition: 'left 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </button>
  );
};

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* iOS Grouped Settings Card */}
              <div style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--glass-specular)',
                overflow: 'hidden',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}>
                {/* 1. Sound Effects - Clean Single Toggle Button */}
                <div
                  onClick={handleToggleSound}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.95rem 1.15rem',
                    borderBottom: '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isMuted ? 'rgba(148, 163, 184, 0.15)' : 'rgba(10, 132, 255, 0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {isMuted ? <VolumeX size={18} color="var(--text-muted)" /> : <Volume2 size={18} color="var(--color-x)" />}
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Sound Effects
                    </span>
                  </div>

                  <ToggleSwitch
                    checked={!isMuted}
                    onChange={handleToggleSound}
                    activeColor="var(--color-x)"
                    label="Toggle Sound Effects"
                  />
                </div>

                {/* 2. Dark Mode - Clean Single Toggle Button */}
                <div
                  onClick={handleToggleTheme}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.95rem 1.15rem',
                    borderBottom: '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: theme === 'dark' ? 'rgba(94, 92, 230, 0.18)' : 'rgba(255, 149, 0, 0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {theme === 'dark' ? <Moon size={18} color="#5e5ce6" /> : <Sun size={18} color="#ff9500" />}
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Dark Mode
                    </span>
                  </div>

                  <ToggleSwitch
                    checked={theme === 'dark'}
                    onChange={handleToggleTheme}
                    activeColor="var(--color-x)"
                    label="Toggle Dark Mode"
                  />
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
                    width: '100%',
                    padding: '0.95rem 1.15rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(100, 210, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <BookOpen size={18} color="var(--color-accent)" />
                    </div>
                    <span>Game Rules</span>
                  </div>
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>›</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                      justifyContent: 'center',
                      gap: '0.6rem',
                      padding: '0.85rem 1rem',
                      background: 'rgba(10, 132, 255, 0.12)',
                      border: '1px solid rgba(10, 132, 255, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-x)',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: 'var(--glass-specular)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <RotateCcw size={18} color="var(--color-x)" />
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
                      justifyContent: 'center',
                      gap: '0.6rem',
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 69, 58, 0.12)',
                      border: '1px solid rgba(255, 69, 58, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-coral)',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: 'var(--glass-specular)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Flag size={18} color="var(--color-coral)" />
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
                      justifyContent: 'center',
                      gap: '0.6rem',
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 69, 58, 0.12)',
                      border: '1px solid rgba(255, 69, 58, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-coral)',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: 'var(--glass-specular)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <LogOut size={18} />
                    <span>{leaveLabel}</span>
                  </button>
                )}
              </div>
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

              {/* Developer Attribution */}
              <div style={{
                padding: '0.75rem',
                background: 'rgba(10, 132, 255, 0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(10, 132, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                fontWeight: '700',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Developed by:</span>
                <a
                  href="https://github.com/PurohitBhagyesh"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-x)', textDecoration: 'none', fontWeight: '800' }}
                >
                  Bhagyesh Purohit ↗
                </a>
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
