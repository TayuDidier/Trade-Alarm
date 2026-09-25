// Persistent Trading Alert Manager
// Stores unlimited alerts locally, checks live price ticks, and triggers unmissable alarms

import { audioEngine } from './audioEngine';

const STORAGE_KEY = 'tradealarm_alerts_v1';
const HISTORY_KEY = 'tradealarm_history_v1';

export class AlertManager {
  constructor() {
    this.alerts = this.loadAlerts();
    this.history = this.loadHistory();
    this.activeAlarm = null; // Currently sounding alarm
    this.alarmListeners = new Set();
    this.changeListeners = new Set();
    this.lastTriggerTimes = {}; // Debounce tracker
  }

  loadAlerts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading alerts from localStorage', e);
    }
    // Default starter alerts for demonstration
    return [
      {
        id: 'default-btc-1',
        symbol: 'BTCUSDT',
        name: 'Bitcoin',
        targetPrice: 66000.00,
        condition: 'above',
        sound: 'siren',
        enableTts: true,
        strategyNote: 'Major 4H Resistance Breakout - Confirm with Volume',
        priority: 'critical',
        active: true,
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'default-eth-1',
        symbol: 'ETHUSDT',
        name: 'Ethereum',
        targetPrice: 2600.00,
        condition: 'below',
        sound: 'digital',
        enableTts: true,
        strategyNote: 'Support level liquidity sweep zone',
        priority: 'high',
        active: true,
        createdAt: Date.now() - 7200000,
      },
      {
        id: 'default-gold-1',
        symbol: 'XAUUSD',
        name: 'Gold Spot',
        targetPrice: 2660.00,
        condition: 'above',
        sound: 'klaxon',
        enableTts: true,
        strategyNote: 'All-time high retest - Watch DXY correlation',
        priority: 'critical',
        active: true,
        createdAt: Date.now() - 1800000,
      }
    ];
  }

  saveAlerts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.alerts));
    } catch (e) {
      console.warn('Error saving alerts', e);
    }
    this.notifyChanges();
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading history', e);
    }
    return [];
  }

  saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history.slice(0, 50)));
    } catch (e) {
      console.warn('Error saving history', e);
    }
  }

  subscribeAlerts(callback) {
    this.changeListeners.add(callback);
    callback(this.alerts, this.history);
    return () => this.changeListeners.delete(callback);
  }

  subscribeAlarm(callback) {
    this.alarmListeners.add(callback);
    callback(this.activeAlarm);
    return () => this.alarmListeners.delete(callback);
  }

  notifyChanges() {
    this.changeListeners.forEach(cb => cb(this.alerts, this.history));
  }

  notifyAlarm() {
    this.alarmListeners.forEach(cb => cb(this.activeAlarm));
  }

  addAlert(alertData) {
    const newAlert = {
      id: 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: Date.now(),
      active: true,
      ...alertData
    };
    this.alerts.unshift(newAlert);
    this.saveAlerts();
    return newAlert;
  }

  toggleAlert(id) {
    this.alerts = this.alerts.map(a => a.id === id ? { ...a, active: !a.active } : a);
    this.saveAlerts();
  }

  deleteAlert(id) {
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.saveAlerts();
  }

  updateAlert(id, updatedFields) {
    this.alerts = this.alerts.map(a => a.id === id ? { ...a, ...updatedFields } : a);
    this.saveAlerts();
  }

  // Check incoming price against all active alerts
  evaluatePrice(symbol, currentPrice, prevPrice) {
    // If an alarm is already blaring, don't interrupt it with a second one
    if (this.activeAlarm) return;

    this.alerts.forEach(alert => {
      if (!alert.active || alert.symbol !== symbol) return;

      const target = parseFloat(alert.targetPrice);
      let isTriggered = false;

      // Detect Crossing conditions
      if (alert.condition === 'above' && currentPrice >= target) {
        // Trigger if it crossed up or if first checked above target
        isTriggered = true;
      } else if (alert.condition === 'below' && currentPrice <= target) {
        isTriggered = true;
      } else if (alert.condition === 'cross') {
        const crossedUp = prevPrice < target && currentPrice >= target;
        const crossedDown = prevPrice > target && currentPrice <= target;
        if (crossedUp || crossedDown) isTriggered = true;
      }

      // Check snooze or debounce
      if (alert.snoozedUntil && Date.now() < alert.snoozedUntil) {
        isTriggered = false;
      }

      if (isTriggered) {
        this.triggerAlarm(alert, currentPrice);
      }
    });
  }

  // Trigger the full-blown persistent alarm!
  triggerAlarm(alert, currentPrice) {
    // Prevent double firing within 10 seconds for the same alert
    const lastTime = this.lastTriggerTimes[alert.id] || 0;
    if (Date.now() - lastTime < 10000) return;
    this.lastTriggerTimes[alert.id] = Date.now();

    // Prepare speech text
    const cleanSym = alert.symbol.replace('USDT', '').replace('USD', '');
    const direction = alert.condition === 'above' ? 'crossed above' : 'dropped below';
    const ttsText = alert.enableTts
      ? `Attention! ${cleanSym} ${direction} ${alert.targetPrice}. ${alert.strategyNote || 'Check your charts.'}`
      : null;

    // Start Audio Engine
    audioEngine.startAlarm({
      soundType: alert.sound || 'siren',
      ttsText
    });

    // Set Active Alarm State
    this.activeAlarm = {
      id: alert.id,
      symbol: alert.symbol,
      name: alert.name,
      targetPrice: alert.targetPrice,
      currentPrice: currentPrice,
      condition: alert.condition,
      sound: alert.sound || 'siren',
      strategyNote: alert.strategyNote,
      priority: alert.priority || 'high',
      triggeredAt: Date.now()
    };

    // Mark alert as triggered/deactivated or record in history
    this.history.unshift({
      ...this.activeAlarm,
      historyId: 'hist_' + Date.now(),
      status: 'triggered'
    });
    this.saveHistory();

    // Automatically deactivate one-time alerts so they don't spam
    this.alerts = this.alerts.map(a => a.id === alert.id ? { ...a, active: false, lastTriggered: Date.now() } : a);
    this.saveAlerts();

    this.notifyAlarm();
  }

  // Dismiss alarm
  dismissAlarm() {
    audioEngine.stopAlarm();
    if (this.activeAlarm) {
      // Record reaction time in history
      const reactionSec = Math.round((Date.now() - this.activeAlarm.triggeredAt) / 1000);
      this.history = this.history.map(item => {
        if (item.id === this.activeAlarm.id && item.triggeredAt === this.activeAlarm.triggeredAt) {
          return { ...item, dismissedAt: Date.now(), reactionTime: `${reactionSec}s`, status: 'dismissed' };
        }
        return item;
      });
      this.saveHistory();
    }
    this.activeAlarm = null;
    this.notifyAlarm();
    this.notifyChanges();
  }

  // Snooze alarm for N minutes
  snoozeAlarm(minutes = 5) {
    audioEngine.stopAlarm();
    if (this.activeAlarm) {
      const snoozedUntil = Date.now() + (minutes * 60 * 1000);
      const alertId = this.activeAlarm.id;
      this.alerts = this.alerts.map(a => a.id === alertId ? { ...a, active: true, snoozedUntil } : a);
      this.saveAlerts();
    }
    this.activeAlarm = null;
    this.notifyAlarm();
  }

  // Trigger manual test alarm
  testAlarm(soundType = 'siren') {
    const mockAlert = {
      id: 'test-alarm-' + Date.now(),
      symbol: 'BTCUSDT',
      name: 'Bitcoin',
      targetPrice: 68500.00,
      condition: 'above',
      sound: soundType,
      enableTts: true,
      strategyNote: 'TEST ALARM: Testing mobile wake-up speaker volume and siren loop.',
      priority: 'critical',
      active: true,
      createdAt: Date.now()
    };
    this.triggerAlarm(mockAlert, 68520.00);
  }
}

export const alertManager = new AlertManager();
