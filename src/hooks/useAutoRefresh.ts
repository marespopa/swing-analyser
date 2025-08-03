import { useState, useEffect } from 'react';

export const useAutoRefresh = (onRefresh: () => Promise<void>) => {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(new Date()); // Initialize with current time
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  
  // Get interval from localStorage or default to 5 minutes (300 seconds)
  const getStoredInterval = (): number => {
    const stored = localStorage.getItem('autoRefreshInterval');
    return stored ? parseInt(stored, 10) : 300;
  };
  
  const [refreshInterval] = useState<number>(getStoredInterval);
  const [countdown, setCountdown] = useState(refreshInterval);

  // Start auto-refresh timer
  const startAutoRefreshTimer = () => {
    if (!autoRefreshEnabled) return;

    // Clear existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // Set new timer using the configurable interval
    const timer = setTimeout(() => {
      onRefresh();
    }, refreshInterval * 1000);

    setRefreshTimer(timer);
  };

  // Stop auto-refresh timer
  const stopAutoRefreshTimer = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      setRefreshTimer(null);
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    if (autoRefreshEnabled) {
      stopAutoRefreshTimer();
    } else {
      startAutoRefreshTimer();
    }
  };

  // Format time since last refresh
  const getTimeSinceRefresh = (): string => {
    if (!lastRefresh) return 'Just now';

    const now = new Date();
    const diffMs = now.getTime() - lastRefresh.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffMins > 0) {
      return `${diffMins}m ${diffSecs}s ago`;
    }
    return `${diffSecs}s ago`;
  };

  // Get time until next auto-refresh
  const getTimeUntilNextRefresh = (): string => {
    if (!autoRefreshEnabled) return 'Disabled';
    if (!lastRefresh) return 'Starting...';

    const now = new Date();
    const nextRefresh = new Date(lastRefresh.getTime() + (refreshInterval * 1000));
    const diffMs = nextRefresh.getTime() - now.getTime();

    if (diffMs <= 0) return 'Refreshing...';

    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    setLastRefresh(new Date());
    setCountdown(refreshInterval); // Reset countdown
    await onRefresh();
  };

  // Auto-refresh timer effect
  useEffect(() => {
    if (autoRefreshEnabled) {
      startAutoRefreshTimer();
    }

    return () => {
      stopAutoRefreshTimer();
    };
  }, [autoRefreshEnabled]);

  // Initial timer start
  useEffect(() => {
    if (autoRefreshEnabled) {
      startAutoRefreshTimer();
    }
  }, []); // Run only once on mount

  // Countdown timer effect
  useEffect(() => {
    if (!autoRefreshEnabled) {
      setCountdown(refreshInterval);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return refreshInterval; // Reset to current interval
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshInterval]);



  return {
    lastRefresh,
    setLastRefresh,
    autoRefreshEnabled,
    countdown,
    refreshInterval,
    handleManualRefresh,
    toggleAutoRefresh,
    getTimeSinceRefresh,
    getTimeUntilNextRefresh
  };
}; 