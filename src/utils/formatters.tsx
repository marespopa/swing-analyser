import React from "react";

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

export const formatPercentage = (percentage: number | null | undefined): React.ReactNode | string => {
  if (percentage === null || percentage === undefined) {
    return <span className="text-gray-400">N/A</span>;
  }
  const color = percentage >= 0 ? 'text-green-500' : 'text-red-500';
  return (
    <span className={color}>
      {percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
    </span>
  );
};

export const getTimeSinceRefresh = (lastRefresh: Date | null): string => {
  if (!lastRefresh) return 'Never';
  
  const now = new Date();
  const diffMs = now.getTime() - lastRefresh.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);
  
  if (diffMins > 0) {
    return `${diffMins}m ${diffSecs}s ago`;
  }
  return `${diffSecs}s ago`;
};

export const getTimeUntilNextRefresh = (autoRefreshEnabled: boolean, lastRefresh: Date | null, countdown: number): string => {
  if (!autoRefreshEnabled || !lastRefresh) return 'Disabled';
  
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}; 