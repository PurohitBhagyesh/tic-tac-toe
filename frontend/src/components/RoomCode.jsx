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
      background: 'rgba(10, 14, 23, 0.7)',
      border: '1px solid rgba(0, 240, 255, 0.25)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)',
      width: '100%',
      maxWidth: '360px',
      margin: '0.5rem auto'
    }}>
      <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
        Room Code
      </span>

      <div style={{
        fontSize: '2.5rem',
        fontWeight: '900',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.25em',
        color: '#00f0ff',
        textShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
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
