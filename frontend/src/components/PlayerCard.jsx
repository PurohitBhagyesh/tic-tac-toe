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
            padding: '1px 8px',
            borderRadius: '10px',
            fontSize: '0.68rem',
            fontWeight: '800',
            background: 'rgba(56, 189, 248, 0.18)',
            color: 'var(--color-x)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            letterSpacing: '0.04em'
          }}>
            YOU
          </span>
        )}

        {!isConnected && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ef4444', fontSize: '0.7rem' }}>
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
              padding: '2px 9px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: '800',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.2)'
            }}>
              <CheckCircle2 size={12} /> READY
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 9px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: '800',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.3)'
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
