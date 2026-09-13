import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import Button from './Button';

const QRCodeDisplay = ({ roomCode }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const joinUrl = `${window.location.origin}/join/${roomCode}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Play Tic-Tac-Toe with me!',
          text: `Join my Tic-Tac-Toe game room: ${roomCode}`,
          url: joinUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '1.25rem',
      background: 'var(--bg-input)',
      border: '1.5px solid var(--border-glass)',
      borderRadius: 'var(--radius-lg)',
      width: '100%',
      maxWidth: '360px',
      margin: '0.5rem auto'
    }}>
      <div style={{
        padding: '12px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-md)',
        display: 'inline-block'
      }}>
        <QRCodeSVG
          value={joinUrl}
          size={160}
          level="H"
          includeMargin={false}
        />
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '280px' }}>
        Have your friend scan this QR code with their phone camera to join instantly!
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
        <Button
          variant="secondary"
          size="md"
          onClick={handleShare}
          icon={Share2}
        >
          Share Room
        </Button>
        <Button
          variant={copiedLink ? 'accent' : 'secondary'}
          size="md"
          onClick={handleCopyLink}
          icon={copiedLink ? Check : LinkIcon}
        >
          {copiedLink ? 'Link Copied!' : 'Copy Link'}
        </Button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
