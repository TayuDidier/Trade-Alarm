import React, { useState } from 'react';
import { alertManager } from '../services/alertManager';
import { ALARM_SOUND_PROFILES } from '../services/audioEngine';
import { 
  Bell, 
  BellOff, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Mic, 
  Play, 
  Edit3, 
  Check, 
  X,
  FileText
} from 'lucide-react';

import SoundIcon from './SoundIcon';

export default function AlertItem({ alert, livePrice }) {
  const isAbove = alert.condition === 'above';
  const target = parseFloat(alert.targetPrice);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(alert.strategyNote || '');

  const calculateDistance = () => {
    if (!livePrice) return null;
    const diff = target - livePrice;
    const pct = (diff / livePrice) * 100;
    return {
      diff: Math.abs(diff),
      pct: Math.abs(pct).toFixed(2),
      isApproaching: (isAbove && diff > 0) || (!isAbove && diff < 0),
    };
  };

  const dist = calculateDistance();

  const handleToggle = () => {
    alertManager.toggleAlert(alert.id);
  };

  const handleDelete = () => {
    alertManager.deleteAlert(alert.id);
  };

  const handleManualTest = () => {
    alertManager.triggerAlarm(alert, livePrice || target);
  };

  const handleSaveDescription = () => {
    alertManager.updateAlert(alert.id, {
      strategyNote: descriptionValue.trim()
    });
    setIsEditingDescription(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveDescription();
    } else if (e.key === 'Escape') {
      setDescriptionValue(alert.strategyNote || '');
      setIsEditingDescription(false);
    }
  };

  const matchedSound = ALARM_SOUND_PROFILES.find(s => s.id === alert.sound);
  const soundLabel = matchedSound ? matchedSound.name : 'Alarm';

  return (
    <div className={`alert-item-card ${alert.active ? 'is-active' : 'is-inactive'}`}>
      <div className="alert-item-header">
        <div className="alert-item-symbol-group">
          <div className={`condition-indicator-icon ${isAbove ? 'icon-above' : 'icon-below'}`}>
            {isAbove ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
          <div>
            <div className="alert-symbol-title">
              <strong>{alert.symbol.replace('USDT', '')}</strong>
              <span className="condition-tag">
                {isAbove ? 'CROSSES ABOVE' : 'DROPS BELOW'}
              </span>
            </div>
            <div className="alert-target-price">
              Target: <strong>${target.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>

        {/* Active Toggle Switch */}
        <div className="alert-item-actions-top">
          <button
            type="button"
            className={`alert-toggle-pill ${alert.active ? 'pill-active' : 'pill-paused'}`}
            onClick={handleToggle}
            title={alert.active ? 'Pause Alert' : 'Arm Alert'}
          >
            {alert.active ? <Bell size={14} /> : <BellOff size={14} />}
            <span>{alert.active ? 'Armed' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Proximity / Distance Row */}
      {livePrice && dist && alert.active && (
        <div className="alert-proximity-row">
          <div className="proximity-info">
            <span className="live-cur-price">Live: ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="dist-chip">
              {dist.diff < 50 ? '🔥 Very Close: ' : 'Distance: '}
              ${dist.diff.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({dist.pct}%)
            </span>
          </div>
        </div>
      )}

      {/* EDITABLE STRATEGY / ALARM DESCRIPTION SECTION */}
      <div className="alert-description-container">
        {isEditingDescription ? (
          <div className="inline-description-editor">
            <input
              type="text"
              className="input-inline-desc"
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your custom trade plan, trigger rule, or reminder..."
              autoFocus
            />
            <div className="inline-desc-actions">
              <button 
                type="button" 
                className="btn-save-desc" 
                onClick={handleSaveDescription}
                title="Save Description"
              >
                <Check size={14} />
              </button>
              <button 
                type="button" 
                className="btn-cancel-desc" 
                onClick={() => {
                  setDescriptionValue(alert.strategyNote || '');
                  setIsEditingDescription(false);
                }}
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="alert-description-view"
            onClick={() => setIsEditingDescription(true)}
            title="Click to edit alarm description"
          >
            <div className="description-text-wrap">
              <FileText size={13} className="desc-quote-icon" />
              {alert.strategyNote && alert.strategyNote.trim() ? (
                <span className="alert-note-snippet">"{alert.strategyNote}"</span>
              ) : (
                <span className="alert-note-empty">+ Add custom trade description or action plan...</span>
              )}
            </div>
            <button 
              type="button" 
              className="btn-edit-desc-icon" 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingDescription(true);
              }}
              title="Edit Description"
            >
              <Edit3 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Card Footer with Sound Tag, Test Button, and Delete */}
      <div className="alert-item-footer">
        <div className="alert-sound-badges">
          <span className="sound-badge" title={soundLabel}>
            <SoundIcon id={alert.sound} size={13} className="sound-badge-icon" />
            <span>{soundLabel}</span>
          </span>
          {alert.enableTts && (
            <span className="tts-badge" title="Voice Announcement Enabled">
              <Mic size={12} />
              Voice
            </span>
          )}
        </div>

        <div className="alert-btn-group">
          <button
            type="button"
            className="btn-alert-test"
            onClick={handleManualTest}
            title="Test Trigger Alarm"
          >
            <Play size={12} />
            <span>Test</span>
          </button>
          <button
            type="button"
            className="btn-alert-delete"
            onClick={handleDelete}
            title="Delete Alert"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
