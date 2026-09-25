import React from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

export default function WatchlistCard({ asset, liveData, onAddAlert }) {
  const price = liveData ? liveData.price : asset.price;
  const change = liveData ? liveData.change24h : asset.change24h;
  const tickDir = liveData ? liveData.tickDirection : 'neutral';
  const isPositive = change >= 0;

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '0.00';
    if (val >= 1000) return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (val >= 1) return val.toFixed(2);
    return val.toFixed(4);
  };

  return (
    <div className={`watchlist-card ${tickDir === 'up' ? 'tick-up' : tickDir === 'down' ? 'tick-down' : ''}`}>
      <div className="card-top-row">
        <div className="card-symbol-col">
          <div className="card-name-group">
            <span className="card-symbol-text">{asset.symbol.replace('USDT', '')}</span>
            <span className="card-badge-cat">{asset.category.toUpperCase()}</span>
          </div>
          <span className="card-full-name">{asset.name}</span>
        </div>
        <button
          type="button"
          className="btn-card-add-alert"
          onClick={() => onAddAlert(asset.symbol)}
          title={`Set Alarm for ${asset.symbol}`}
        >
          <Plus size={16} />
          <span>Alert</span>
        </button>
      </div>

      <div className="card-bottom-row">
        <div className="card-price-container">
          <span className="card-price-value">${formatPrice(price)}</span>
        </div>
        <div className={`card-change-pill ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{isPositive ? `+${change}%` : `${change}%`}</span>
        </div>
      </div>
    </div>
  );
}
