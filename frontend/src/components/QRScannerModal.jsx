import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [scannerError, setScannerError] = useState(null);
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const scannerElementId = 'qr-reader-container';

    const startScanner = async () => {
      try {
        setIsStarting(true);
        setScannerError(null);

        // Cleanup any existing instance
        if (html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.stop();
          } catch (e) {}
        }

        const html5QrCode = new Html5Qrcode(scannerElementId);
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            // Extract 6-digit code if URL or raw digits
            let code = decodedText.trim();
            const urlMatch = code.match(/\/join\/(\d{6})/);
            if (urlMatch) {
              code = urlMatch[1];
            } else {
              const digitsMatch = code.match(/\b\d{6}\b/);
              if (digitsMatch) {
                code = digitsMatch[0];
              }
            }

            if (code && code.length === 6 && /^\d{6}$/.test(code)) {
              // Stop scanner & call success
              html5QrCode.stop().then(() => {
                onScanSuccess(code);
                onClose();
              }).catch(() => {
                onScanSuccess(code);
                onClose();
              });
            } else {
              setScannerError('Invalid QR code scanned. Looking for 6-digit room code.');
            }
          },
          (errorMessage) => {
            // Ignore normal frame scanning errors
          }
        );

        if (isMounted) setIsStarting(false);
      } catch (err) {
        if (isMounted) {
          console.error('QR Scanner init error:', err);
          setScannerError(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access or enter the 6-digit code manually.'
              : 'Could not access device camera. Please enter code manually.'
          );
          setIsStarting(false);
        }
      }
    };

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(startScanner, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
        } catch (e) {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={20} color="var(--color-x)" />
            Scan Room QR Code
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: '260px',
          background: 'var(--bg-input)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-glass)'
        }}>
          <div id="qr-reader-container" style={{ width: '100%' }}></div>

          {isStarting && !scannerError && (
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.85rem' }}>Starting camera...</span>
            </div>
          )}

          {scannerError && (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#ff4d79' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>{scannerError}</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <Button variant="secondary" size="md" onClick={onClose} className="btn-block">
            Cancel & Enter Code Manually
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QRScannerModal;
