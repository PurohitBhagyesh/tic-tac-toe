import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import ThreeDotMenu from './ThreeDotMenu';

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

  return (
    <header className="header-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {showBack && (
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="btn-icon"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <Link to="/" className="header-brand">
          <div className="header-brand-logo">
            <Gamepad2 size={18} color="#00f0ff" />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
            <span style={{ color: '#00f0ff' }}>TIC</span>
            <span style={{ color: '#ffffff', margin: '0 2px' }}>-</span>
            <span style={{ color: '#ff0055' }}>TAC</span>
            <span style={{ color: '#ffffff', margin: '0 2px' }}>-</span>
            <span style={{ color: '#6366f1' }}>TOE</span>
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
