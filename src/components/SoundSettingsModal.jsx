import React, { useState } from 'react';
import { audioEngine, ALARM_SOUND_PROFILES } from '../services/audioEngine';
import { alertManager } from '../services/alertManager';
import SoundIcon from './SoundIcon';
import { X, Volume2, Play, Square, Mic, CheckCircle } from 'lucide-react';

export default function SoundSettingsModal({ isOpen, onClose }) {
  const [volume, setVolume] = useState(0.95);
  const [playingSound, setPlayingSound] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  if (!isOpen) return null;

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
  };

  const handlePlaySound = (soundType) => {
    audioEngine.init();
    if (playingSound === soundType) {
      audioEngine.stopAlarm();
      setPlayingSound(null);
    } else {
      setPlayingSound(soundType);
      audioEngine.startAlarm({ soundType });
    }
  };

  const handleStopAll = () => {
    audioEngine.stopAlarm();
    setPlayingSound(null);
  };

  const handleTestTts = () => {
    audioEngine.init();
    audioEngine.speakAlert("Voice callout verified: Bitcoin reached target of sixty-six thousand dollars. Execute trade setup.");
  };

  const handleTestFullAlarm = (soundType) => {
    onClose();
    setTimeout(() => {
      alertManager.testAlarm(soundType);
    }, 200);
  };

  const filteredSounds = filterCategory === 'all'
    ? ALARM_SOUND_PROFILES
    : ALARM_SOUND_PROFILES.filter(s => s.category === filterCategory);

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <Volume2 size={20} />
            </div>
            <div>
              <h3>Sound & Alarm Laboratory</h3>
              <p className="modal-subtitle">{ALARM_SOUND_PROFILES.length} alarm types • Volume calibration</p>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={() => { handleStopAll(); onClose(); }}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-body">
          {/* Master Volume Slider */}
          <div className="settings-section">
            <div className="settings-row-between">
              <label>MASTER ALARM VOLUME</label>
              <span className="volume-percent">{Math.round(volume * 100)}%</span>
            </div>
            <div className="volume-slider-row">
              <Volume2 size={20} className="text-secondary" />
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="slider-input"
              />
            </div>
            <p className="settings-hint">
              For waking up overnight, keep this at 95%–100% and ensure phone media volume is unmuted.
            </p>
          </div>

          {/* Sound Profiles */}
          <div className="settings-section">
            <div className="settings-row-between">
              <label>ALL ALARM SOUND PROFILES ({ALARM_SOUND_PROFILES.length})</label>
              <div className="category-filter-pills">
                {['all', 'emergency', 'classic', 'trading', 'tactical', 'gentle'].map(cat => (
                  <button
                    type="button"
                    key={cat}
                    className={`cat-pill ${filterCategory === cat ? 'active' : ''}`}
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="sound-preview-scroll-list">
              {filteredSounds.map(item => (
                <div key={item.id} className="sound-preview-row">
                  <div className="sound-preview-meta">
                    <span className="sound-preview-title">
                      <span className="sound-icon-tag"><SoundIcon id={item.id} size={15} /></span> {item.name}
                    </span>
                    <span className="sound-preview-desc">{item.desc}</span>
                  </div>
                  <div className="sound-preview-actions">
                    <button
                      type="button"
                      className={`btn-play-preview ${playingSound === item.id ? 'btn-stop-preview' : ''}`}
                      onClick={() => handlePlaySound(item.id)}
                    >
                      {playingSound === item.id ? (
                        <>
                          <Square size={13} /> Stop
                        </>
                      ) : (
                        <>
                          <Play size={13} /> Test
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn-trigger-full"
                      onClick={() => handleTestFullAlarm(item.id)}
                      title="Trigger full-screen alarm experience"
                    >
                      Fire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Text-to-Speech Test */}
          <div className="settings-section">
            <label>SPEECH SYNTHESIS TEST</label>
            <div className="tts-test-box">
              <div className="tts-meta">
                <Mic size={18} />
                <span>Test your device's built-in voice announcement</span>
              </div>
              <button type="button" className="btn-secondary" onClick={handleTestTts}>
                Speak Sample
              </button>
            </div>
          </div>

          {/* Mobile Hardware Badges */}
          <div className="settings-badges-grid">
            <div className="badge-item">
              <CheckCircle size={16} className="text-green" />
              <span>Web Audio API Active</span>
            </div>
            <div className="badge-item">
              <CheckCircle size={16} className="text-green" />
              <span>Screen WakeLock Ready</span>
            </div>
            <div className="badge-item">
              <CheckCircle size={16} className="text-green" />
              <span>Haptic Vibration Ready</span>
            </div>
            <div className="badge-item">
              <CheckCircle size={16} className="text-green" />
              <span>10 Synthesizers Armed</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-primary-alarm" onClick={() => { handleStopAll(); onClose(); }}>
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
