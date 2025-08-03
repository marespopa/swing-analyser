import { useState } from 'react';

interface RequestQueueItem {
  id: number;
  fn: () => Promise<void>;
  priority: number;
  timestamp: number;
}

interface RateLimitInfo {
  requestsThisMinute: number;
  lastReset: number;
}

export const useRateLimiting = () => {
  const [requestQueue, setRequestQueue] = useState<RequestQueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({ requestsThisMinute: 0, lastReset: Date.now() });

  const MAX_REQUESTS_PER_MINUTE = 30;
  const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

  // Check if we can make a request
  const canMakeRequest = (): boolean => {
    const now = Date.now();
    const timeSinceReset = now - rateLimitInfo.lastReset;

    // Reset counter if a minute has passed
    if (timeSinceReset >= RATE_LIMIT_WINDOW) {
      setRateLimitInfo({ requestsThisMinute: 0, lastReset: now });
      return true;
    }

    return rateLimitInfo.requestsThisMinute < MAX_REQUESTS_PER_MINUTE;
  };

  // Record a request
  const recordRequest = () => {
    setRateLimitInfo(prev => ({
      ...prev,
      requestsThisMinute: prev.requestsThisMinute + 1
    }));
  };

  // Calculate wait time until next available slot
  const getWaitTime = (): number => {
    const now = Date.now();
    const timeSinceReset = now - rateLimitInfo.lastReset;
    const timeUntilReset = RATE_LIMIT_WINDOW - timeSinceReset;

    if (rateLimitInfo.requestsThisMinute >= MAX_REQUESTS_PER_MINUTE) {
      return timeUntilReset;
    }

    return 0;
  };

  // Add request to queue
  const addToQueue = (requestFn: () => Promise<void>, priority: number = 0) => {
    const request: RequestQueueItem = {
      id: Date.now() + Math.random(),
      fn: requestFn,
      priority,
      timestamp: Date.now()
    };

    setRequestQueue(prev => [...prev, request].sort((a, b) => b.priority - a.priority));
  };

  // Process queue
  const processQueue = async () => {
    if (isProcessingQueue || requestQueue.length === 0) return;

    setIsProcessingQueue(true);

    while (requestQueue.length > 0) {
      const waitTime = getWaitTime();

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      if (requestQueue.length > 0) {
        const request = requestQueue[0];
        setRequestQueue(prev => prev.slice(1));

        try {
          recordRequest();
          await request.fn();
        } catch (_error) {
          // Silently handle error
        }
      }
    }

    setIsProcessingQueue(false);
  };

  return {
    rateLimitInfo,
    MAX_REQUESTS_PER_MINUTE,
    canMakeRequest,
    recordRequest,
    getWaitTime,
    addToQueue,
    processQueue,
    isProcessingQueue
  };
}; 