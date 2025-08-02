import React from 'react';
import Button from './Button';

interface RefreshControlsProps {
  loading: boolean;
  emaLoading: boolean;
  handleManualRefresh: () => void;
  autoRefreshEnabled: boolean;
  toggleAutoRefresh: () => void;
  getTimeSinceRefresh: () => string;
  countdown: number;
  rateLimitInfo: {
    requestsThisMinute: number;
    lastReset: number;
  };
  MAX_REQUESTS_PER_MINUTE: number;
}

const RefreshControls: React.FC<RefreshControlsProps> = ({
  loading,
  emaLoading,
  handleManualRefresh,
  autoRefreshEnabled,
  toggleAutoRefresh,
  getTimeSinceRefresh,
  countdown,
  rateLimitInfo,
  MAX_REQUESTS_PER_MINUTE
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-8 border border-blue-200">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleManualRefresh}
            disabled={loading || emaLoading}
            variant="primary"
          >
            {loading || emaLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {loading ? 'Refreshing...' : 'Calculating...'}
              </>
            ) : (
              <>
                <span>🔄</span>
                Refresh Now
              </>
            )}
          </Button>

          <Button
            onClick={toggleAutoRefresh}
            variant={autoRefreshEnabled ? 'success' : 'secondary'}
          >
            <span>{autoRefreshEnabled ? '⏰' : '⏸️'}</span>
            {autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>Last refresh:</span>
            <span className="font-medium">{getTimeSinceRefresh()}</span>
          </div>

          {autoRefreshEnabled && (
            <div className="flex items-center gap-1">
              <span>Next refresh:</span>
              <span className="font-medium text-blue-600">
                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Rate Limit Status */}
          <div className="flex items-center gap-1">
            <span>API:</span>
            <span className={`font-medium px-2 py-1 rounded-full text-xs ${
              rateLimitInfo.requestsThisMinute >= MAX_REQUESTS_PER_MINUTE
                ? 'bg-red-100 text-red-700'
                : rateLimitInfo.requestsThisMinute >= MAX_REQUESTS_PER_MINUTE * 0.8
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
            }`}>
              {rateLimitInfo.requestsThisMinute}/{MAX_REQUESTS_PER_MINUTE}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefreshControls; 