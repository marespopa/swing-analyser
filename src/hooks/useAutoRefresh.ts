import { useState, useEffect } from 'react';

export const useAutoRefresh = (onRefresh: () => Promise<void>) => {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(new Date()); // Initialize with current time
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds

  // Start auto-refresh timer
  const startAutoRefreshTimer = () => {
    if (!autoRefreshEnabled) return;

    // Clear existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // Set new timer for 15 minutes (900,000 ms)
    const timer = setTimeout(() => {
      onRefresh();
    }, 900000);

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
    const nextRefresh = new Date(lastRefresh.getTime() + 900000); // 15 minutes
    const diffMs = nextRefresh.getTime() - now.getTime();

    if (diffMs <= 0) return 'Refreshing...';

    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    setLastRefresh(new Date());
    setCountdown(900); // Reset countdown
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
      setCountdown(300);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 900; // Reset to 15 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  return {
    lastRefresh,
    setLastRefresh,
    autoRefreshEnabled,
    countdown,
    handleManualRefresh,
    toggleAutoRefresh,
    getTimeSinceRefresh,
    getTimeUntilNextRefresh
  };
}; 