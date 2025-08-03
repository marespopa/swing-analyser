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
  price_change_percentage_7d_in_currency?: number | null;
}

export const getPriceChange = (coin: Coin, timeframe: string): number | null => {
  switch (timeframe) {
    case '1h':
      return coin.price_change_percentage_1h_in_currency ?? null;
    case '1d':
      return coin.price_change_percentage_24h;
    case '1w':
      return coin.price_change_percentage_7d_in_currency ?? null;
    default:
      return coin.price_change_percentage_24h;
  }
};

export const getPriceChangeWithFallback = (coin: Coin, timeframe: string): { value: number | null; actualTimeframe: string } => {
  switch (timeframe) {
    case '1h':
      if (coin.price_change_percentage_1h_in_currency !== null && coin.price_change_percentage_1h_in_currency !== undefined) {
        return { value: coin.price_change_percentage_1h_in_currency, actualTimeframe: '1h' };
      }
      return { value: coin.price_change_percentage_24h, actualTimeframe: '24h' };
    case '1d':
      return { value: coin.price_change_percentage_24h, actualTimeframe: '24h' };
    case '1w':
      if (coin.price_change_percentage_7d_in_currency !== null && coin.price_change_percentage_7d_in_currency !== undefined) {
        return { value: coin.price_change_percentage_7d_in_currency, actualTimeframe: '7d' };
      }
      return { value: coin.price_change_percentage_24h, actualTimeframe: '24h' };
    default:
      return { value: coin.price_change_percentage_24h, actualTimeframe: '24h' };
  }
};

export const getTrendArrows = (coin: Coin): React.ReactElement => {
  const getArrow = (change: number | null | undefined, label: string) => {
    if (change === null || change === undefined) {
      return React.createElement('span', { 
        className: 'text-gray-400 text-xs', 
        title: `${label}: N/A` 
      }, '○');
    }
    
    const isBullish = change > 0;
    const color = isBullish ? 'text-green-500' : 'text-red-500';
    const arrow = isBullish ? '↗' : '↘';
    
    return React.createElement('span', { 
      className: `${color} text-xs font-bold`, 
      title: `${label}: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%` 
    }, arrow);
  };

  const arrows = [
    getArrow(coin.price_change_percentage_1h_in_currency, '1h'),
    getArrow(coin.price_change_percentage_24h, '24h'),
    getArrow(coin.price_change_percentage_7d_in_currency, '7d')
  ];

  return React.createElement('div', { 
    className: 'flex gap-1 items-center' 
  }, ...arrows);
};

export const getTrendStrength = (coin: Coin): { strength: string; color: string; arrows: number } => {
  const changes = [
    coin.price_change_percentage_1h_in_currency,
    coin.price_change_percentage_24h,
    coin.price_change_percentage_7d_in_currency
  ].filter(change => change !== null && change !== undefined);

  if (changes.length === 0) {
    return { strength: 'Neutral', color: 'text-gray-500', arrows: 0 };
  }

  const bullishCount = changes.filter(change => change! > 0).length;
  const bearishCount = changes.filter(change => change! < 0).length;
  const total = changes.length;

  if (bullishCount === total) {
    return { strength: 'Strong Bullish', color: 'text-green-600', arrows: 3 };
  } else if (bearishCount === total) {
    return { strength: 'Strong Bearish', color: 'text-red-600', arrows: 0 };
  } else if (bullishCount > bearishCount) {
    return { strength: 'Bullish', color: 'text-green-500', arrows: bullishCount };
  } else if (bearishCount > bullishCount) {
    return { strength: 'Bearish', color: 'text-red-500', arrows: bullishCount };
  } else {
    return { strength: 'Mixed', color: 'text-yellow-500', arrows: bullishCount };
  }
}; 

 