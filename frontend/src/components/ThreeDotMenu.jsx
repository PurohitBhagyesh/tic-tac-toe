import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, BookOpen, Flag, LogOut, X } from 'lucide-react';
import Button from './Button';

const ThreeDotMenu = ({ onGiveUp, onLeaveRoom, isMultiplayer = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-icon"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title="Game Options"
      >
        <MoreVertical size={20} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '120%',
          right: 0,
          width: '180px',
          background: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 50,
          overflow: 'hidden',
          padding: '0.4rem'
        }}>
          <button
            onClick={() => {
              setIsOpen(false);
              setShowRules(true);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 0.75rem',
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.9rem',
              fontWeight: '500',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <BookOpen size={16} color="#00f0ff" />
            Game Rules
          </button>

          {isMultiplayer && onGiveUp && (
            <button
              onClick={() => {
                setIsOpen(false);
                onGiveUp();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.6rem 0.75rem',
                background: 'transparent',
                border: 'none',
                color: '#ff4d79',
                fontSize: '0.9rem',
                fontWeight: '500',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 0, 85, 0.12)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <Flag size={16} color="#ff0055" />
              Give Up
            </button>
          )}

          {onLeaveRoom && (
            <button
              onClick={() => {
                setIsOpen(false);
                onLeaveRoom();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.6rem 0.75rem',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.9rem',
                fontWeight: '500',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <LogOut size={16} />
              Leave Room
            </button>
          )}
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} color="#00f0ff" />
                Game Rules
              </h3>
              <button
                onClick={() => setShowRules(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.5' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                <strong style={{ color: '#00f0ff' }}>1. Board & Objective:</strong> Place 3 of your marks (X or O) in a horizontal, vertical, or diagonal row to win a round.
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                <strong style={{ color: '#ff0055' }}>2. 5-Round Matches:</strong> Multiplayer matches consist of exactly 5 competitive rounds. The player with the highest score at the end wins!
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                <strong style={{ color: '#a855f7' }}>3. Turns & Draws:</strong> Players alternate starting turns each round. If all 9 cells are filled without a 3-in-a-row, it is a Draw (0 points).
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                <strong style={{ color: '#eab308' }}>4. Forfeits & Rematches:</strong> Giving up forfeits the match to your opponent. When a match ends, both players can agree to a Rematch!
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <Button variant="primary" onClick={() => setShowRules(false)}>
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDotMenu;
