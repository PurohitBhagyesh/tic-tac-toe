import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import ThreeDotMenu from './ThreeDotMenu';
import { playSound } from '../utils/sound';

const Header = ({
  showBack = false,
  backTo = '/',
  title = 'Tic-Tac-Toe',
  showMenu = true,
  onGiveUp = null,
  onLeaveRoom = null,
  isMultiplayer = false,
}) => {
  const navigate = useNavigate();

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
            <Gamepad2 size={20} color="var(--color-x)" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--color-x)', textShadow: '0 0 10px var(--color-x-glow)' }}>TIC</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 3px' }}>•</span>
            <span style={{ color: 'var(--color-o)', textShadow: '0 0 10px var(--color-o-glow)' }}>TAC</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 3px' }}>•</span>
            <span style={{ color: 'var(--color-x)', textShadow: '0 0 10px var(--color-x-glow)' }}>TOE</span>
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
