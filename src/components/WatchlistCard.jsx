import React from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

import { formatAssetPrice, getDisplaySymbol } from '../services/marketData';

export default function WatchlistCard({ asset, liveData, onAddAlert }) {
  const price = liveData ? liveData.price : asset.price;
  const change = liveData ? liveData.change24h : asset.change24h;
  const tickDir = liveData ? liveData.tickDirection : 'neutral';
  const isPositive = change >= 0;
  const isForex = asset.category === 'forex';

  return (
    <div className={`watchlist-card ${tickDir === 'up' ? 'tick-up' : tickDir === 'down' ? 'tick-down' : ''}`}>
      <div className="card-top-row">
        <div className="card-symbol-col">
          <div className="card-name-group">
            <span className="card-symbol-text">{getDisplaySymbol(asset.symbol)}</span>
            <span className={`card-badge-cat cat-${asset.category}`}>{asset.category.toUpperCase()}</span>
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
          <span className="card-price-value">{!isForex ? '$' : ''}{formatAssetPrice(price, asset.category)}</span>
        </div>
        <div className={`card-change-pill ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{isPositive ? `+${change}%` : `${change}%`}</span>
        </div>
      </div>
    </div>
  );
}
