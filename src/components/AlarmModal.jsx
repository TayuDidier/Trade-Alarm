import React, { useState, useEffect } from 'react';
import { alertManager } from '../services/alertManager';
import { ALARM_SOUND_PROFILES } from '../services/audioEngine';
import { DEFAULT_WATCHLIST, formatAssetPrice, getDisplaySymbol } from '../services/marketData';
import SoundIcon from './SoundIcon';
import { AlertTriangle, BellOff, Clock, ExternalLink, ShieldAlert } from 'lucide-react';

export default function AlarmModal({ alarm }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!alarm) return;
    const startTime = alarm.triggeredAt || Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [alarm]);

  if (!alarm) return null;

  const matchedAsset = DEFAULT_WATCHLIST.find(i => i.symbol === alarm.symbol);
  const isForex = matchedAsset?.category === 'forex';

  const formatElapsed = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDismiss = () => {
    alertManager.dismissAlarm();
  };

  const handleSnooze = (mins) => {
    alertManager.snoozeAlarm(mins);
  };

  const getTradingViewUrl = () => {
    if (matchedAsset && matchedAsset.tvSymbol) {
      return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(matchedAsset.tvSymbol)}`;
    }
    let clean = alarm.symbol;
    if (clean.endsWith('USDT')) clean = 'BINANCE:' + clean;
    else if (clean === 'XAUUSD') clean = 'OANDA:XAUUSD';
    else if (clean === 'EURUSD') clean = 'FX:EURUSD';
    else if (clean === 'GBPUSD') clean = 'FX:GBPUSD';
    else if (clean === 'US30') clean = 'DJ:DJI';
    else if (clean === 'SPX') clean = 'SP:SPX';
    else if (clean === 'NAS100') clean = 'NASDAQ:NDX';
    else if (clean === 'GER40') clean = 'INDEX:DAX';
    else if (clean === 'UK100') clean = 'INDEX:FTSE';
    return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(clean)}`;
  };

  const matchedSound = ALARM_SOUND_PROFILES.find(s => s.id === alarm.sound);
  const soundName = matchedSound ? matchedSound.name : 'Air Raid Siren';

  return (
    <div className="alarm-overlay">
      <div className="alarm-container pulsing-glow">
        {/* Pulsing Header */}
        <div className="alarm-badge-row">
          <div className="alarm-pulsing-badge">
            <span className="live-dot-pulse"></span>
            CRITICAL PRICE ALERT TRIGGERED
          </div>
          <div className="alarm-timer-chip">
            <Clock size={16} />
            <span>Active: {formatElapsed(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Ticker & Price Display */}
        <div className="alarm-hero-section">
          <div className="alarm-symbol-tag">
            <ShieldAlert size={28} className="alarm-icon-wiggle" />
            <h1>{getDisplaySymbol(alarm.symbol)}</h1>
          </div>
          <div className="alarm-price-row">
            <div className="alarm-price-box">
              <span className="price-label">TRIGGER LEVEL</span>
              <span className="price-value target">{!isForex ? '$' : ''}{formatAssetPrice(alarm.targetPrice, matchedAsset?.category)}</span>
            </div>
            <div className="alarm-price-divider">➔</div>
            <div className="alarm-price-box">
              <span className="price-label">LIVE PRICE</span>
              <span className="price-value live">{!isForex ? '$' : ''}{formatAssetPrice(alarm.currentPrice, matchedAsset?.category)}</span>
            </div>
          </div>
        </div>

        {/* Strategy Note */}
        {alarm.strategyNote && (
          <div className="alarm-strategy-card">
            <div className="strategy-card-header">
              <AlertTriangle size={16} className="text-warning" />
              <span>STRATEGY / ACTION NOTE</span>
            </div>
            <p className="strategy-note-text">"{alarm.strategyNote}"</p>
          </div>
        )}

        {/* Sound Status */}
        <div className="alarm-sound-indicator">
          <SoundIcon id={alarm.sound} size={16} className="volume-pulse-icon" />
          <span>Looping Sound: <strong>{soundName}</strong> (Bypassing Silent Mode)</span>
        </div>

        {/* Primary Action Buttons */}
        <div className="alarm-actions-grid">
          {/* Big Tactile Dismiss Button */}
          <button 
            type="button" 
            className="alarm-btn-dismiss"
            onClick={handleDismiss}
          >
            <BellOff size={28} />
            <div className="btn-text-col">
              <span className="main-title">DISMISS ALARM</span>
              <span className="sub-title">Silence sound & record reaction</span>
            </div>
          </button>

          {/* Snooze Options */}
          <div className="alarm-snooze-row">
            <button 
              type="button" 
              className="alarm-btn-snooze"
              onClick={() => handleSnooze(5)}
            >
              <Clock size={18} />
              <span>Snooze 5 Min</span>
            </button>
            <button 
              type="button" 
              className="alarm-btn-snooze"
              onClick={() => handleSnooze(10)}
            >
              <Clock size={18} />
              <span>Snooze 10 Min</span>
            </button>
          </div>

          {/* Direct Chart Link */}
          <a 
            href={getTradingViewUrl()} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="alarm-btn-chart"
          >
            <ExternalLink size={18} />
            <span>Open Chart on TradingView</span>
          </a>
        </div>
      </div>
    </div>
  );
}
