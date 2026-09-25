import React, { useState } from 'react';
import { X, Smartphone, QrCode, Copy, Check, ShieldCheck } from 'lucide-react';

export default function ConnectPhoneModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:5173';

  if (!isOpen) return null;

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}&bgcolor=14-18-24&color=99-102-241&margin=10`;

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <Smartphone size={22} />
            </div>
            <div>
              <h3>Run on Your Android Phone</h3>
              <p className="modal-subtitle">Instant PWA installation • Zero setup needed</p>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="phone-connect-body">
          {/* QR Code Section */}
          <div className="qr-code-box">
            <div className="qr-img-wrapper">
              <img src={qrCodeUrl} alt="Scan QR Code to open on phone" className="qr-image" />
            </div>
            <p className="qr-hint">
              <QrCode size={16} /> Scan with your <strong>Android Phone Camera</strong>
            </p>
          </div>

          {/* Direct URL */}
          <div className="url-copy-section">
            <label>OR OPEN THIS LINK ON YOUR PHONE:</label>
            <div className="url-copy-box">
              <span className="url-text">{currentUrl}</span>
              <button 
                type="button" 
                className="btn-copy-url" 
                onClick={() => handleCopy(currentUrl)}
              >
                {copied ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 3 Step Android Home Screen Installation */}
          <div className="install-steps-container">
            <h4>How to Install on Android Home Screen:</h4>
            
            <div className="install-step-item">
              <div className="step-num">1</div>
              <div className="step-desc">
                <strong>Connect to the same Wi-Fi</strong>
                <span>Ensure your Android phone is on the same local Wi-Fi network as this PC.</span>
              </div>
            </div>

            <div className="install-step-item">
              <div className="step-num">2</div>
              <div className="step-desc">
                <strong>Open in Chrome & Tap "Tap to Arm Sound"</strong>
                <span>Tap anywhere on the phone screen once so Android grants speaker audio permissions.</span>
              </div>
            </div>

            <div className="install-step-item">
              <div className="step-num">3</div>
              <div className="step-desc">
                <strong>Install App (PWA)</strong>
                <span>Tap the <strong>Three Dots (⋮)</strong> at the top right of Chrome ➔ tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
              </div>
            </div>
          </div>

          {/* Hardware Feature Highlights on Android */}
          <div className="android-features-pill-row">
            <div className="android-feat-pill">
              <ShieldCheck size={14} className="text-green" />
              <span>Full-Screen Standalone (No URL bar)</span>
            </div>
            <div className="android-feat-pill">
              <ShieldCheck size={14} className="text-green" />
              <span>Hardware Vibration Enabled</span>
            </div>
            <div className="android-feat-pill">
              <ShieldCheck size={14} className="text-green" />
              <span>OLED Screen WakeLock Supported</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-primary-alarm" onClick={onClose}>
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
