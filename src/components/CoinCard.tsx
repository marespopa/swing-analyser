import React from 'react';
import { formatPrice, formatMarketCap, formatPercentage, getPriceChange, getTimeframeLabel } from '../utils/formatters';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_4h_in_currency: number | null;
  price_change_percentage_24h: number;
}

interface CoinCardProps {
  coin: Coin;
  index: number;
  timeframe: string;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, index, timeframe }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 text-blue-800 text-sm font-bold px-2 py-1 rounded-full min-w-[2rem] text-center">
            #{index + 1}
          </div>
          <img
            src={coin.image}
            alt={coin.name}
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{coin.name}</h3>
            <p className="text-sm text-blue-600 font-medium">{coin.symbol.toUpperCase()}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPrice(coin.current_price)}
          </div>
          <div className="text-sm font-medium">
            {formatPercentage(getPriceChange(coin, timeframe))}
            <span className="text-gray-500 ml-1">({getTimeframeLabel(coin, timeframe)})</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Market Cap:</span>
            <span className="font-medium text-gray-900">{formatMarketCap(coin.market_cap)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Volume (24h):</span>
            <span className="font-medium text-gray-900">{formatMarketCap(coin.total_volume)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Circulating Supply:</span>
            <span className="font-medium text-gray-900 text-right">
              {coin.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinCard; 