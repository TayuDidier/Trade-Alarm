import React, { useState } from 'react';
import { alertManager } from '../services/alertManager';
import { audioEngine, ALARM_SOUND_PROFILES } from '../services/audioEngine';
import { DEFAULT_WATCHLIST } from '../services/marketData';
import SoundIcon from './SoundIcon';
import { 
  X, 
  Play, 
  Square, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Mic, 
  Sparkles, 
  ArrowRight,
  Check
} from 'lucide-react';

export default function AddAlertModal({ isOpen, onClose, currentPrices, initialSymbol = 'BTCUSDT' }) {
  const [modalTab, setModalTab] = useState('price'); // 'price' | 'sound'
  const [symbol, setSymbol] = useState(initialSymbol);

  const initialLive = currentPrices && currentPrices[initialSymbol] ? currentPrices[initialSymbol].price : null;
  const defaultTarget = initialLive 
    ? (initialLive * 1.01 > 10 ? (initialLive * 1.01).toFixed(2) : (initialLive * 1.01).toFixed(4))
    : '';

  const [targetPrice, setTargetPrice] = useState(defaultTarget);
  const [condition, setCondition] = useState('above');
  const [sound, setSound] = useState('siren');
  const [enableTts, setEnableTts] = useState(true);
  const [strategyNote, setStrategyNote] = useState('');
  const [playingPreviewId, setPlayingPreviewId] = useState(null);

  const DESCRIPTION_TEMPLATES = [
    'Take Profit - Scale 50%',
    'Stop Loss - Check Risk',
    'Liquidity Sweep Watch',
    'Breakout Confirmed',
    'Retest of Key Level',
  ];

  if (!isOpen) return null;

  const currentLive = currentPrices && currentPrices[symbol] ? currentPrices[symbol].price : null;

  const handleSelectSymbol = (newSym) => {
    setSymbol(newSym);
    if (currentPrices && currentPrices[newSym]) {
      const cur = currentPrices[newSym].price;
      const suggested = condition === 'above' ? cur * 1.01 : cur * 0.99;
      setTargetPrice(suggested > 10 ? suggested.toFixed(2) : suggested.toFixed(4));
    }
  };

  const handleUseCurrentPrice = () => {
    if (currentLive) {
      setTargetPrice(currentLive > 10 ? currentLive.toFixed(2) : currentLive.toFixed(4));
    }
  };

  const handleAddPercentage = (pct) => {
    if (currentLive) {
      const calculated = currentLive * (1 + pct / 100);
      setTargetPrice(calculated > 10 ? calculated.toFixed(2) : calculated.toFixed(4));
      if (pct > 0) setCondition('above');
      if (pct < 0) setCondition('below');
    }
  };

  const handlePreviewSound = (soundType) => {
    audioEngine.init();
    if (playingPreviewId === soundType) {
      audioEngine.stopAlarm();
      setPlayingPreviewId(null);
    } else {
      setPlayingPreviewId(soundType);
      audioEngine.previewSound(soundType);
      setTimeout(() => setPlayingPreviewId(null), 3300);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetPrice || isNaN(targetPrice)) return;

    const matchedAsset = DEFAULT_WATCHLIST.find(i => i.symbol === symbol);

    alertManager.addAlert({
      symbol,
      name: matchedAsset ? matchedAsset.name : symbol,
      targetPrice: parseFloat(targetPrice),
      condition,
      sound,
      enableTts,
      strategyNote: strategyNote.trim() || 'Key Price Level Reached',
      priority: 'critical'
    });

    audioEngine.stopAlarm();
    onClose();
  };

  const getDistancePercent = () => {
    if (!currentLive || !targetPrice || isNaN(targetPrice)) return null;
    const diff = parseFloat(targetPrice) - currentLive;
    const pct = (diff / currentLive) * 100;
    return pct.toFixed(2);
  };

  const distPct = getDistancePercent();
  const selectedSoundObj = ALARM_SOUND_PROFILES.find(s => s.id === sound);

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card clean-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <Bell size={18} />
            </div>
            <div>
              <h3>Set Price Level Alarm</h3>
              <p className="modal-subtitle">Wake-up sound and voice callout on price trigger</p>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => { audioEngine.stopAlarm(); onClose(); }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Segment Tabs: Clean & Modern */}
        <div className="modal-segment-tabs">
          <button
            type="button"
            className={`modal-seg-btn ${modalTab === 'price' ? 'active' : ''}`}
            onClick={() => setModalTab('price')}
          >
            <span>1. Price & Direction</span>
          </button>
          <button
            type="button"
            className={`modal-seg-btn ${modalTab === 'sound' ? 'active' : ''}`}
            onClick={() => setModalTab('sound')}
          >
            <span>2. Sound & Trade Plan</span>
            <span className="seg-indicator-badge">
              <SoundIcon id={sound} size={12} />
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* TAB 1: PRICE & CONDITION */}
          {modalTab === 'price' && (
            <div className="modal-tab-content">
              {/* Trading Pair Chips */}
              <div className="form-group mb-3">
                <label className="field-label">TRADING ASSET</label>
                <div className="symbol-chips-grid">
                  {DEFAULT_WATCHLIST.map((item) => (
                    <button
                      type="button"
                      key={item.symbol}
                      className={`chip-button ${symbol === item.symbol ? 'selected' : ''}`}
                      onClick={() => handleSelectSymbol(item.symbol)}
                    >
                      <span className="chip-symbol">{item.symbol.replace('USDT', '')}</span>
                      <span className="chip-price">
                        ${currentPrices[item.symbol] ? currentPrices[item.symbol].price.toLocaleString() : item.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Toggle: Breakout vs Breakdown */}
              <div className="form-group mb-3">
                <label className="field-label">TRIGGER CONDITION</label>
                <div className="condition-toggle-row">
                  <button
                    type="button"
                    className={`condition-btn ${condition === 'above' ? 'active-above' : ''}`}
                    onClick={() => setCondition('above')}
                  >
                    <TrendingUp size={15} />
                    <span>Crosses Above (Breakout)</span>
                  </button>
                  <button
                    type="button"
                    className={`condition-btn ${condition === 'below' ? 'active-below' : ''}`}
                    onClick={() => setCondition('below')}
                  >
                    <TrendingDown size={15} />
                    <span>Drops Below (Breakdown)</span>
                  </button>
                </div>
              </div>

              {/* Target Price Input */}
              <div className="form-group mb-2">
                <div className="label-with-action">
                  <label className="field-label">TARGET PRICE LEVEL</label>
                  {currentLive && (
                    <button type="button" className="btn-text-action" onClick={handleUseCurrentPrice}>
                      Current Live: ${currentLive.toLocaleString()}
                    </button>
                  )}
                </div>

                <div className="input-price-wrapper">
                  <span className="currency-prefix">$</span>
                  <input
                    type="number"
                    step="any"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="0.00"
                    required
                    className="input-price-large"
                  />
                </div>

                {/* Quick % Offset Pills */}
                <div className="quick-percentages-row">
                  <button type="button" onClick={() => handleAddPercentage(-3)}>-3%</button>
                  <button type="button" onClick={() => handleAddPercentage(-1)}>-1%</button>
                  <button type="button" onClick={() => handleAddPercentage(0.5)}>+0.5%</button>
                  <button type="button" onClick={() => handleAddPercentage(1)}>+1%</button>
                  <button type="button" onClick={() => handleAddPercentage(3)}>+3%</button>
                  {distPct !== null && (
                    <span className={`distance-indicator ${Number(distPct) >= 0 ? 'text-green' : 'text-red'}`}>
                      {Number(distPct) >= 0 ? `+${distPct}%` : `${distPct}%`} from live
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Sound & Note Summary Row with Link to Step 2 */}
              <div className="modal-summary-card" onClick={() => setModalTab('sound')}>
                <div className="summary-card-info">
                  <span className="summary-card-title">Sound Profile:</span>
                  <div className="summary-card-sound-pill">
                    <SoundIcon id={sound} size={14} className="summary-sound-icon" />
                    <span className="summary-card-val">
                      {selectedSoundObj ? selectedSoundObj.name : 'Air Raid Siren'}
                      {enableTts ? ' • Voice Callout ON' : ''}
                    </span>
                  </div>
                </div>
                <button type="button" className="btn-link-edit">
                  <span>Customize</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SOUND & TRADE PLAN (Clean, Modern, Uncluttered) */}
          {modalTab === 'sound' && (
            <div className="modal-tab-content">
              {/* Clean Sound Profile Grid (No Categories, Modern SVG Icons) */}
              <div className="form-group mb-3">
                <div className="label-with-action">
                  <label className="field-label">ALARM SOUND PROFILE</label>
                  <span className="char-hint">Tap card to select • Tap play to test</span>
                </div>

                <div className="sound-chips-grid">
                  {ALARM_SOUND_PROFILES.map((s) => {
                    const isSelected = sound === s.id;
                    const isPlaying = playingPreviewId === s.id;
                    return (
                      <div
                        key={s.id}
                        className={`sound-chip-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSound(s.id)}
                      >
                        <div className="sound-chip-left">
                          <div className={`sound-chip-icon-box ${isSelected ? 'icon-box-active' : ''}`}>
                            <SoundIcon id={s.id} size={15} />
                          </div>
                          <div className="sound-chip-text">
                            <span className="sound-chip-title">{s.name}</span>
                          </div>
                        </div>

                        <div className="sound-chip-actions">
                          <button
                            type="button"
                            className={`btn-preview-mini ${isPlaying ? 'preview-playing' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewSound(s.id);
                            }}
                            title={isPlaying ? 'Stop Preview' : 'Preview Sound'}
                          >
                            {isPlaying ? <Square size={11} /> : <Play size={11} />}
                          </button>
                          {isSelected && (
                            <div className="sound-check-indicator">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trade Plan / Action Note Section */}
              <div className="form-group mb-3">
                <div className="label-with-action">
                  <label className="field-label">TRADE PLAN / ACTION NOTE (OPTIONAL)</label>
                  <span className="char-hint">Spoken aloud if voice enabled</span>
                </div>
                
                <input
                  type="text"
                  value={strategyNote}
                  onChange={(e) => setStrategyNote(e.target.value)}
                  placeholder="e.g. Daily FVG filled • Watch 5M order book for short entry"
                  className="input-text-prominent"
                />

                {/* Clean Wrap Preset Chips */}
                <div className="quick-templates-wrap">
                  <span className="template-label"><Sparkles size={11} /> Presets:</span>
                  <div className="template-chips-flow">
                    {DESCRIPTION_TEMPLATES.map((tmpl, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className="chip-template"
                        onClick={() => setStrategyNote(tmpl)}
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voice Text-to-Speech Toggle Bar */}
              <div className="form-group mb-1">
                <div className="voice-toggle-row" onClick={() => setEnableTts(!enableTts)}>
                  <div className="voice-toggle-left">
                    <div className="voice-icon-box">
                      <Mic size={16} />
                    </div>
                    <div>
                      <span className="voice-toggle-title">Voice Announcement (TTS)</span>
                      <span className="voice-toggle-desc">Speaks your trade plan aloud on speaker during alarm</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableTts}
                    onChange={(e) => setEnableTts(e.target.checked)}
                    className="custom-switch"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="modal-actions">
            {modalTab === 'price' ? (
              <>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => { audioEngine.stopAlarm(); onClose(); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-alarm">
                  <Bell size={16} />
                  <span>Arm Alarm Level</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setModalTab('price')}
                >
                  Back to Price
                </button>
                <button type="submit" className="btn-primary-alarm">
                  <Bell size={16} />
                  <span>Save & Arm Level</span>
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
