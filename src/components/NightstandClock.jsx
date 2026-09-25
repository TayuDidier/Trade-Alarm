import React, { useState, useEffect } from 'react';
import { alertManager } from '../services/alertManager';
import { ShieldCheck, X, Bell } from 'lucide-react';

export default function NightstandClock({ onClose, alerts, currentPrices }) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = alerts.filter(a => a.active);

  return (
    <div className="nightstand-overlay">
      {/* Top Bar */}
      <div className="nightstand-top-bar">
        <div className="armed-badge">
          <span className="pulsing-shield"></span>
          <ShieldCheck size={18} />
          <span>BEDSIDE MONITOR ARMED ({activeAlerts.length} ALERTS ACTIVE)</span>
        </div>
        <button type="button" className="btn-exit-nightstand" onClick={onClose}>
          <X size={18} />
          <span>Exit Bedside Mode</span>
        </button>
      </div>

      {/* Main Nightstand Clock */}
      <div className="nightstand-center">
        <div className="nightstand-time">{timeStr}</div>
        <div className="nightstand-date">{dateStr}</div>

        <p className="nightstand-hint">
          Screen locked awake • Audio set to wake you up on price trigger
        </p>

        {/* Live Monitored Ticker Strip */}
        <div className="nightstand-tickers-strip">
          {activeAlerts.slice(0, 4).map(alert => {
            const live = currentPrices[alert.symbol];
            const livePrice = live ? live.price : '...';
            return (
              <div key={alert.id} className="nightstand-ticker-pill">
                <span className="ticker-sym">{alert.symbol.replace('USDT', '')}</span>
                <span className="ticker-target">Alarm @ ${Number(alert.targetPrice).toLocaleString()}</span>
                <span className="ticker-live">Live: ${typeof livePrice === 'number' ? livePrice.toLocaleString() : livePrice}</span>
              </div>
            );
          })}
        </div>

        {/* Test Wake-up button */}
        <div className="nightstand-test-row">
          <button 
            type="button" 
            className="btn-nightstand-test"
            onClick={() => alertManager.testAlarm('siren')}
          >
            <Bell size={16} />
            <span>Test Wake-Up Alarm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
