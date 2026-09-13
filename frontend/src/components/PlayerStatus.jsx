import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const PlayerStatus = ({
  message = 'Your Turn',
  isThinking = false,
  highlight = null, // 'x', 'o', 'accent'
}) => {
  let color = 'var(--text-secondary)';
  if (highlight === 'x') color = 'var(--color-x)';
  if (highlight === 'o') color = 'var(--color-o)';
  if (highlight === 'accent') color = '#a855f7';

  return (
    <div className="status-comment-badge" style={{ color }}>
      {isThinking ? (
        <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        <Sparkles size={16} />
      )}
      <span>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PlayerStatus;
