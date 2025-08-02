import React from 'react';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(price);
};

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toLocaleString()}`;
};

export const formatPercentage = (percentage: number | null | undefined): React.ReactElement => {
  if (percentage === null || percentage === undefined) return React.createElement('span', { className: 'text-gray-400' }, 'N/A');
  const color = percentage >= 0 ? 'text-green-500' : 'text-red-500';
  return React.createElement('span', { className: color }, `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`);
};

interface Coin {
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_4h_in_currency: number | null;
  price_change_percentage_24h: number;
}

export const getPriceChange = (coin: Coin, timeframe: string): number | null => {
  switch (timeframe) {
    case '1h':
      return coin.price_change_percentage_1h_in_currency;
    case '4h':
      // Try 4h data first, fallback to 24h if not available
      return coin.price_change_percentage_4h_in_currency !== null && coin.price_change_percentage_4h_in_currency !== undefined
        ? coin.price_change_percentage_4h_in_currency
        : coin.price_change_percentage_24h;
    case '24h':
      return coin.price_change_percentage_24h;
    default:
      return coin.price_change_percentage_24h;
  }
};

export const getTimeframeLabel = (coin: Coin, timeframe: string): string => {
  switch (timeframe) {
    case '1h':
      return coin.price_change_percentage_1h_in_currency !== null && coin.price_change_percentage_1h_in_currency !== undefined ? '1h' : '24h';
    case '4h':
      return coin.price_change_percentage_4h_in_currency !== null && coin.price_change_percentage_4h_in_currency !== undefined ? '4h' : '24h';
    case '24h':
      return '24h';
    default:
      return '24h';
  }
}; 