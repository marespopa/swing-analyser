import React from 'react';
import { formatPrice, formatMarketCap, formatPercentage, getPriceChangeWithFallback, getTrendArrows, getTrendStrength } from '../utils/formatters';

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
  onClick?: (coin: Coin) => void;
  onRefreshData?: (coin: Coin) => void;
  isRefreshing?: boolean;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, index, timeframe, onClick }) => {
  const { value: priceChange, actualTimeframe } = getPriceChangeWithFallback(coin, timeframe);
  const isPositive = priceChange !== null && priceChange >= 0;

  // Calculate price range percentage for visual indicator
  const priceRange = coin.high_24h - coin.low_24h;
  const currentPosition = ((coin.current_price - coin.low_24h) / priceRange) * 100;

  const handleClick = () => {
    if (onClick) {
      onClick(coin);
    }
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group relative ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      onClick={handleClick}
    >
      {/* Dark overlay on hover - covers entire card */}
      {onClick && (
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-80 transition-opacity duration-300 rounded-2xl z-10"></div>
      )}
      
      <div className="relative p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
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
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-lg">
              #{index + 1}
            </div>
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
              <span className="text-gray-500 font-normal">({actualTimeframe})</span>
            </div>
            
            {/* Trend Arrows - All Timeframes */}
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-500 mr-1">Trend:</span>
              {getTrendArrows(coin)}
            </div>
            
            {/* Trend Strength */}
            {(() => {
              const trendInfo = getTrendStrength(coin);
              return (
                <div className={`text-xs font-medium ${trendInfo.color} mt-1`}>
                  {trendInfo.strength} ({trendInfo.arrows}/3 arrows)
                </div>
              );
            })()}
          </div>
        </div>

        {/* Price Range Visual Indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>24h Range</span>
            <span className="font-medium">{formatPrice(coin.low_24h)} - {formatPrice(coin.high_24h)}</span>
          </div>
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            {/* Background track */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-100 via-yellow-100 to-green-100"></div>
            
            {/* Current price indicator */}
            <div 
              className="absolute top-0 h-full w-1 bg-gray-800 rounded-full shadow-sm transition-all duration-300"
              style={{ left: `${Math.max(0, Math.min(100, currentPosition))}%` }}
            ></div>
            
            {/* Price labels */}
            <div className="absolute -top-6 left-0 text-xs text-gray-500 font-medium">
              {formatPrice(coin.low_24h)}
            </div>
            <div className="absolute -top-6 right-0 text-xs text-gray-500 font-medium">
              {formatPrice(coin.high_24h)}
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-gray-600 font-medium">
              Current: {formatPrice(coin.current_price)}
            </span>
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

        {/* Analysis indicator */}
        {onClick && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
            <div className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700 hover:border-emerald-800 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
              <span className="text-white text-sm font-medium">📊</span>
              <span className="text-white text-sm font-medium">Analyze</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinCard; 