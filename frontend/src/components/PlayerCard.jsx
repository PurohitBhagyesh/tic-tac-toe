import React from 'react';
import { CheckCircle2, Clock, WifiOff } from 'lucide-react';

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

  return (
    <div className={`player-card ${activeTurnClass}`}>
      <div className={`player-avatar-badge ${isX ? 'badge-x' : 'badge-o'}`}>
        {symbol}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <span className="player-card-name" title={name}>
          {name} {isUser && <span style={{ color: '#6366f1', fontSize: '0.75rem' }}>(You)</span>}
        </span>

        {!isConnected && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ff4d79', fontSize: '0.7rem' }}>
            <WifiOff size={10} /> Disconnected
          </span>
        )}
      </div>

      <div className="player-score-badge">
        {score}
      </div>

      {showReady && (
        <div style={{ marginTop: '4px' }}>
          {isReady ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: '700',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <CheckCircle2 size={12} /> Ready
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: '700',
              background: 'rgba(234, 179, 8, 0.12)',
              color: '#facc15',
              border: '1px solid rgba(234, 179, 8, 0.3)'
            }}>
              <Clock size={12} /> Waiting
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
