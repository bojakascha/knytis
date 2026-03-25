import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useI18n } from '../i18n/useI18n';

interface InviteModalProps {
  code: string;
  open: boolean;
  onClose: () => void;
}

export function InviteModal({ code, open, onClose }: InviteModalProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const joinUrl = new URL(
    `join?code=${encodeURIComponent(code)}`,
    `${window.location.origin}${import.meta.env.BASE_URL}`,
  ).href;

  useEffect(() => {
    if (!open || !canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, joinUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#f4f7fb', light: '#00000000' },
    });
  }, [open, joinUrl]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h2>{t('invite.title')}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label={t('invite.closeAria')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="invite-qr">
          <canvas ref={canvasRef} />
        </div>

        <p className="invite-hint">{t('invite.hint')}</p>

        <div className="invite-link-row">
          <input className="invite-link" value={joinUrl} readOnly onClick={(e) => (e.target as HTMLInputElement).select()} />
          <button type="button" className="copy-btn" onClick={handleCopy}>
            {copied ? t('common.copied') : t('common.copy')}
          </button>
        </div>

        <div className="invite-code-row">
          <span className="muted">{t('invite.orManual')}</span>
          <span className="share-code-value">{code}</span>
        </div>
      </div>
    </div>
  );
}
