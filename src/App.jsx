import React, { useState, useEffect } from 'react';
import './App.css';
import { alertManager } from './services/alertManager';
import { marketDataService, DEFAULT_WATCHLIST } from './services/marketData';
import { audioEngine } from './services/audioEngine';
import AlarmModal from './components/AlarmModal';
import AddAlertModal from './components/AddAlertModal';
import NightstandClock from './components/NightstandClock';
import SoundSettingsModal from './components/SoundSettingsModal';
import ConnectPhoneModal from './components/ConnectPhoneModal';
import WatchlistCard from './components/WatchlistCard';
import AlertItem from './components/AlertItem';
import { 
  Bell, 
  Plus, 
  Moon, 
  Volume2, 
  Sliders, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  CheckCircle
} from 'lucide-react';

export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({});
  const [currentTab, setCurrentTab] = useState('alerts'); // 'alerts' | 'watchlist' | 'history'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalSymbol, setAddModalSymbol] = useState('BTCUSDT');
  const [isNightstandOpen, setIsNightstandOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [audioArmed, setAudioArmed] = useState(false);
  const [showTestTools, setShowTestTools] = useState(false);

  // Initialize Market Data & Subscriptions
  useEffect(() => {
    marketDataService.start();

    // Subscribe to price changes
    const unsubPrices = marketDataService.subscribe((prices, symbol, tick) => {
      setCurrentPrices({ ...prices });
      // When price updates, evaluate against active alerts
      if (symbol && tick) {
        alertManager.evaluatePrice(symbol, tick.price, tick.prevPrice);
      }
    });

    // Subscribe to alert list changes
    const unsubAlerts = alertManager.subscribeAlerts((loadedAlerts, loadedHistory) => {
      setAlerts([...loadedAlerts]);
      setHistory([...loadedHistory]);
    });

    // Subscribe to active ringing alarm
    const unsubAlarm = alertManager.subscribeAlarm((curAlarm) => {
      setActiveAlarm(curAlarm);
      if (curAlarm) {
        setAudioArmed(true);
      }
    });

    return () => {
      unsubPrices();
      unsubAlerts();
      unsubAlarm();
      marketDataService.stop();
    };
  }, []);

  // Unlock AudioContext on first tap
  const handleArmAudio = () => {
    audioEngine.init();
    setAudioArmed(true);
    // Play a gentle confirm chime
    audioEngine.previewSound('sonar');
  };

  const handleOpenAddModal = (sym = 'BTCUSDT') => {
    setAddModalSymbol(sym);
    setIsAddModalOpen(true);
  };

  const handleSimulateSpike = (sym, target) => {
    marketDataService.simulatePriceSpike(sym, target);
  };

  const activeAlertsCount = alerts.filter(a => a.active).length;

  return (
    <div className="app-root">
      {/* App Container */}
      <div className="app-shell">
        
        {/* Clean, Refined Header */}
        <header className="app-header">
          <div className="header-brand-col">
            <div className="app-logo">
              <Bell size={18} className="logo-icon" />
            </div>
            <div>
              <h2 className="app-title">TradeAlarm</h2>
              <div className="app-status-badge">
                <span className="status-dot"></span>
                <span>Live Feed Active</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            {/* Audio Unlock / Armed Indicator */}
            {!audioArmed ? (
              <button 
                type="button" 
                className="btn-arm-audio"
                onClick={handleArmAudio}
                title="Tap once to enable speaker wake-up alarms"
              >
                <Volume2 size={14} />
                <span>Arm Sound</span>
              </button>
            ) : (
              <div className="audio-armed-pill" title="Speakers armed to ring">
                <ShieldCheck size={13} className="text-green" />
                <span>Sound Ready</span>
              </div>
            )}

            {/* Test Tools Toggle (Discreet) */}
            <button
              type="button"
              className={`btn-header-icon ${showTestTools ? 'active-icon' : ''}`}
              onClick={() => setShowTestTools(!showTestTools)}
              title="Toggle Quick Test Tools"
            >
              <Zap size={16} />
            </button>

            {/* Nightstand Bedside Mode */}
            <button
              type="button"
              className="btn-header-icon"
              onClick={() => setIsNightstandOpen(true)}
              title="Bedside / Nightstand Mode"
            >
              <Moon size={16} />
            </button>

            {/* Connect & Run on Phone Button */}
            <button
              type="button"
              className="btn-header-icon"
              onClick={() => setIsPhoneModalOpen(true)}
              title="Install on Mobile Phone"
            >
              <Smartphone size={16} />
            </button>

            {/* Sound Calibration Settings */}
            <button
              type="button"
              className="btn-header-icon"
              onClick={() => setIsSettingsOpen(true)}
              title="Sound & Volume Settings"
            >
              <Sliders size={16} />
            </button>
          </div>
        </header>

        {/* Collapsible Subtle Test Bar (Only shown when user taps the Zap icon) */}
        {showTestTools && (
          <div className="test-banner-bar">
            <div className="test-banner-content">
              <span className="test-label">Test Trigger:</span>
              <button 
                type="button" 
                className="btn-test-trigger"
                onClick={() => alertManager.testAlarm('siren')}
              >
                Siren
              </button>
              <button 
                type="button" 
                className="btn-test-trigger"
                onClick={() => alertManager.testAlarm('digital')}
              >
                Digital
              </button>
              <button 
                type="button" 
                className="btn-test-trigger"
                onClick={() => handleSimulateSpike('BTCUSDT', 66050)}
              >
                Spike BTC
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="tabs-nav-bar">
          <button
            type="button"
            className={`tab-btn ${currentTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setCurrentTab('alerts')}
          >
            <Bell size={16} />
            <span>Armed Levels</span>
            {activeAlertsCount > 0 && (
              <span className="tab-badge">{activeAlertsCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`tab-btn ${currentTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setCurrentTab('watchlist')}
          >
            <Activity size={16} />
            <span>Live Watchlist</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${currentTab === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentTab('history')}
          >
            <Clock size={16} />
            <span>History</span>
            {history.length > 0 && (
              <span className="tab-badge-subtle">{history.length}</span>
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <main className="app-main-content">
          {/* TAB 1: ARMED ALERTS */}
          {currentTab === 'alerts' && (
            <div className="tab-pane">
              <div className="pane-header-row">
                <div>
                  <h3 className="pane-title">Active Price Level Alarms</h3>
                  <p className="pane-subtitle">
                    {activeAlertsCount} armed • Continuous wake-up alarm on price cross
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-add-primary"
                  onClick={() => handleOpenAddModal('BTCUSDT')}
                >
                  <Plus size={18} />
                  <span>New Level</span>
                </button>
              </div>

              {alerts.length === 0 ? (
                <div className="empty-state-card glass-card">
                  <Bell size={40} className="empty-icon" />
                  <h4>No Price Alerts Set</h4>
                  <p>Add your key support and resistance levels to wake you up when reached.</p>
                  <button
                    type="button"
                    className="btn-add-primary mt-3"
                    onClick={() => handleOpenAddModal('BTCUSDT')}
                  >
                    <Plus size={18} />
                    <span>Create Your First Alert</span>
                  </button>
                </div>
              ) : (
                <div className="alerts-list-grid">
                  {alerts.map(alert => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      livePrice={currentPrices[alert.symbol]?.price}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE MARKET WATCHLIST */}
          {currentTab === 'watchlist' && (
            <div className="tab-pane">
              <div className="pane-header-row">
                <div>
                  <h3 className="pane-title">Real-Time Markets</h3>
                  <p className="pane-subtitle">
                    Zero-latency Binance Crypto WebSocket & Live Forex / Gold
                  </p>
                </div>
              </div>

              <div className="watchlist-grid">
                {DEFAULT_WATCHLIST.map(asset => (
                  <WatchlistCard
                    key={asset.symbol}
                    asset={asset}
                    liveData={currentPrices[asset.symbol]}
                    onAddAlert={(sym) => handleOpenAddModal(sym)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ALARM TRIGGER HISTORY */}
          {currentTab === 'history' && (
            <div className="tab-pane">
              <div className="pane-header-row">
                <div>
                  <h3 className="pane-title">Triggered Alarm History</h3>
                  <p className="pane-subtitle">Log of triggered levels and reaction times</p>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="empty-state-card glass-card">
                  <Clock size={40} className="empty-icon" />
                  <h4>No Triggered Alarms Yet</h4>
                  <p>When price breaches your target, alarm logs and reaction times will appear here.</p>
                </div>
              ) : (
                <div className="history-list">
                  {history.map((item, idx) => (
                    <div key={item.historyId || idx} className="history-item-card glass-card">
                      <div className="history-main-info">
                        <div className="history-symbol-row">
                          <strong className="history-sym">{item.symbol.replace('USDT', '')}</strong>
                          <span className="history-time">
                            {new Date(item.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <div className="history-price-meta">
                          Triggered @ <strong>${Number(item.targetPrice).toLocaleString()}</strong>
                          {item.reactionTime && (
                            <span className="reaction-tag">Reaction: {item.reactionTime}</span>
                          )}
                        </div>
                      </div>
                      <div className="history-badge-status">
                        <CheckCircle size={16} className="text-green" />
                        <span>Dismissed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Floating Quick Action Button on Mobile */}
        <button
          type="button"
          className="fab-add-alert"
          onClick={() => handleOpenAddModal('BTCUSDT')}
          title="Add New Price Alert"
        >
          <Plus size={24} />
        </button>

        {/* Bedside Mode Overlay */}
        {isNightstandOpen && (
          <NightstandClock
            onClose={() => setIsNightstandOpen(false)}
            alerts={alerts}
            currentPrices={currentPrices}
          />
        )}

        {/* Full-Screen Wake-up Alarm Modal */}
        <AlarmModal alarm={activeAlarm} />

        {/* Add Alert Modal */}
        {isAddModalOpen && (
          <AddAlertModal
            key={`${addModalSymbol}-${isAddModalOpen}`}
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            currentPrices={currentPrices}
            initialSymbol={addModalSymbol}
          />
        )}

        {/* Sound & Volume Settings Modal */}
        <SoundSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Connect Android Phone Modal */}
        <ConnectPhoneModal
          isOpen={isPhoneModalOpen}
          onClose={() => setIsPhoneModalOpen(false)}
        />
      </div>
    </div>
  );
}
