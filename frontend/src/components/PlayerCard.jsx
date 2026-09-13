import React from 'react';
import { CheckCircle2, Clock, WifiOff, User } from 'lucide-react';

const PlayerCard = ({
  name = 'Player',
  symbol = 'X',
  score = 0,
  isActiveTurn = false,
  isReady = false,
  showReady = false,
  isConnected = true,
  isUser = false,
}) => {
  const isX = symbol === 'X';
  const activeTurnClass = isActiveTurn ? (isX ? 'active-turn-x' : 'active-turn-o') : '';
  const displayName = name && name.trim() ? name.trim() : (isX ? 'Player 1' : 'Player 2');

  return (
    <div className={`player-card ${activeTurnClass}`}>
      {/* Symbol Badge */}
      <div className={`player-avatar-badge ${isX ? 'badge-x' : 'badge-o'}`}>
        {symbol}
      </div>

      {/* Name and Tags */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '100%', justifyContent: 'center' }}>
          <span className="player-card-name" title={displayName}>
            {displayName}
          </span>
        </div>

        {isUser && (
          <span style={{
            padding: '2px 9px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.68rem',
            fontWeight: '800',
            background: 'rgba(10, 132, 255, 0.15)',
            color: 'var(--color-x)',
            border: '1px solid rgba(10, 132, 255, 0.35)',
            letterSpacing: '0.04em',
            boxShadow: 'var(--glass-specular)'
          }}>
            YOU
          </span>
        )}

        {!isConnected && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-coral)', fontSize: '0.7rem', fontWeight: '700' }}>
            <WifiOff size={10} /> Disconnected
          </span>
        )}
      </div>

      {/* Live Score Counter */}
      <div className="player-score-badge" style={{ color: isX ? 'var(--color-x)' : 'var(--color-o)' }}>
        {score}
      </div>

      {/* Ready Badge */}
      {showReady && (
        <div style={{ marginTop: '2px' }}>
          {isReady ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.72rem',
              fontWeight: '800',
              background: 'rgba(48, 209, 88, 0.16)',
              color: 'var(--color-mint)',
              border: '1px solid rgba(48, 209, 88, 0.35)',
              boxShadow: '0 0 12px rgba(48, 209, 88, 0.25)'
            }}>
              <CheckCircle2 size={12} /> READY
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.72rem',
              fontWeight: '800',
              background: 'rgba(255, 149, 0, 0.14)',
              color: 'var(--color-amber)',
              border: '1px solid rgba(255, 149, 0, 0.35)'
            }}>
              <Clock size={12} /> WAITING
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
