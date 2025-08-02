import React from 'react';
import { formatPrice, formatMarketCap, formatPercentage, getPriceChange, getTimeframeLabel } from '../utils/formatters';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_4h_in_currency: number | null;
  price_change_percentage_24h: number;
  market_cap_change_percentage_24h: number;
  ath: number;
  ath_change_percentage: number;
}

interface CoinCardProps {
  coin: Coin;
  index: number;
  timeframe: string;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, index, timeframe }) => {
  const priceChange = getPriceChange(coin, timeframe);
  const isPositive = priceChange !== null && priceChange >= 0;
  const isPositive1h = coin.price_change_percentage_1h_in_currency !== null && coin.price_change_percentage_1h_in_currency >= 0;

  // Calculate price range percentage for visual indicator
  const priceRange = coin.high_24h - coin.low_24h;
  const currentPosition = ((coin.current_price - coin.low_24h) / priceRange) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group relative">
      {/* Gradient overlay for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold px-3 py-1.5 rounded-full min-w-[2.5rem] text-center shadow-sm">
              #{index + 1}
            </div>
            <div className="relative">
              <img
                src={coin.image}
                alt={coin.name}
                className="w-12 h-12 rounded-xl shadow-sm border-2 border-white"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
          
          {/* Market cap rank badge */}
          <div className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-lg">
            #{coin.market_cap_rank}
          </div>
        </div>

        {/* Coin Info */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{coin.name}</h3>
          <p className="text-emerald-600 font-semibold text-sm">{coin.symbol.toUpperCase()}</p>
        </div>

        {/* Price Section */}
        <div className="mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-3">
            {formatPrice(coin.current_price)}
          </div>
          
          {/* Price Change Indicators */}
          <div className="space-y-2">
            {/* Main timeframe change */}
            <div className={`flex items-center gap-2 text-sm font-semibold ${
              priceChange !== null ? (isPositive ? 'text-emerald-600' : 'text-red-600') : 'text-gray-500'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                priceChange !== null ? (isPositive ? 'bg-emerald-100' : 'bg-red-100') : 'bg-gray-100'
              }`}>
                {priceChange !== null && <span className="text-lg">{isPositive ? '↗' : '↘'}</span>}
              </div>
              <span>{formatPercentage(priceChange)}</span>
              <span className="text-gray-500 font-normal">({getTimeframeLabel(coin, timeframe)})</span>
            </div>
            
            {/* 1h momentum */}
            {coin.price_change_percentage_1h_in_currency !== null && (
              <div className={`flex items-center gap-2 text-xs font-medium ${
                isPositive1h ? 'text-emerald-500' : 'text-red-500'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isPositive1h ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  <span>{isPositive1h ? '↗' : '↘'}</span>
                </div>
                <span>{coin.price_change_percentage_1h_in_currency.toFixed(2)}% (1h)</span>
              </div>
            )}
          </div>
        </div>

        {/* Price Range Visual Indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>24h Range</span>
            <span className="font-medium">{currentPosition.toFixed(1)}%</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                isPositive ? 'bg-emerald-500' : 'bg-red-500'
              }`}
              style={{ width: `${currentPosition}%` }}
            ></div>
            <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1">
              <span className="text-xs text-gray-400">${coin.low_24h.toFixed(2)}</span>
              <span className="text-xs text-gray-400">${coin.high_24h.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-4">
          {/* Market Cap */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Market Cap</span>
              <span className="text-sm font-bold text-gray-900">{formatMarketCap(coin.market_cap)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Volume (24h)</span>
              <span className="text-sm font-bold text-gray-900">{formatMarketCap(coin.total_volume)}</span>
            </div>
          </div>

          {/* ATH */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">All-Time High</span>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">${coin.ath.toFixed(2)}</div>
                <div className={`text-xs font-medium ${coin.ath_change_percentage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {coin.ath_change_percentage >= 0 ? '+' : ''}{coin.ath_change_percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover effect indicator */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

export default CoinCard; 