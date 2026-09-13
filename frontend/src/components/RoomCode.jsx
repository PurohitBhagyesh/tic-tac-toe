import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Button from './Button';

const RoomCode = ({ code = '000000' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1.25rem 1.5rem',
      background: 'var(--bg-input)',
      border: '1.5px solid var(--border-glass-bright)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      width: '100%',
      maxWidth: '360px',
      margin: '0.5rem auto'
    }}>
      <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
        ROOM CODE
      </span>

      <div style={{
        fontSize: '2.5rem',
        fontWeight: '900',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.25em',
        color: 'var(--color-x)',
        textShadow: '0 0 16px var(--color-x-glow)',
        paddingLeft: '0.25em' // visual balance
      }}>
        {code}
      </div>

      <Button
        variant={copied ? 'secondary' : 'primary'}
        size="md"
        onClick={handleCopy}
        icon={copied ? Check : Copy}
      >
        {copied ? 'Code Copied!' : 'Copy Code'}
      </Button>
    </div>
  );
};

export default RoomCode;
