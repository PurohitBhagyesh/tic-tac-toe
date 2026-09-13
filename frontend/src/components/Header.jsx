import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import ThreeDotMenu from './ThreeDotMenu';
import { toggleMute, getMuteState, playSound } from '../utils/sound';

const Header = ({
  showBack = false,
  backTo = '/',
  title = 'Tic-Tac-Toe',
  showMenu = false,
  onGiveUp = null,
  onLeaveRoom = null,
  isMultiplayer = false,
}) => {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(getMuteState());

  const handleSoundToggle = () => {
    const newState = toggleMute();
    setMuted(newState);
    if (!newState) {
      playSound('pop');
    }
  };

  return (
    <header className="header-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {showBack && (
          <button
            onClick={() => {
              playSound('click');
              backTo ? navigate(backTo) : navigate(-1);
            }}
            className="btn-icon"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <Link
          to="/"
          className="header-brand"
          onClick={() => playSound('click')}
        >
          <div className="header-brand-logo">
            <Gamepad2 size={20} color="#00f0ff" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#00f0ff', textShadow: '0 0 10px rgba(0,240,255,0.4)' }}>TIC</span>
            <span style={{ color: '#ffffff', margin: '0 3px', opacity: 0.6 }}>•</span>
            <span style={{ color: '#ff007a', textShadow: '0 0 10px rgba(255,0,122,0.4)' }}>TAC</span>
            <span style={{ color: '#ffffff', margin: '0 3px', opacity: 0.6 }}>•</span>
            <span style={{ color: '#8b5cf6', textShadow: '0 0 10px rgba(139,92,246,0.4)' }}>TOE</span>
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Sound FX Toggle Button */}
        <button
          onClick={handleSoundToggle}
          className="btn-icon"
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: muted ? '#64748b' : '#00f0ff',
            borderColor: muted ? 'var(--border-glass)' : 'rgba(0,240,255,0.3)'
          }}
          title={muted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {showMenu && (
          <ThreeDotMenu
            onGiveUp={onGiveUp}
            onLeaveRoom={onLeaveRoom}
            isMultiplayer={isMultiplayer}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
