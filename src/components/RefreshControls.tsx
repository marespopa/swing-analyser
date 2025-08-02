import React from 'react';
import Button from './Button';

interface RefreshControlsProps {
  loading: boolean;
  emaLoading: boolean;
  handleManualRefresh: () => void;
  autoRefreshEnabled: boolean;
  toggleAutoRefresh: () => void;
  getTimeSinceRefresh: () => string;
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
  rateLimitInfo,
  MAX_REQUESTS_PER_MINUTE
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Single Refresh Button */}
          <Button
            onClick={handleManualRefresh}
            disabled={loading || emaLoading}
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            {loading || emaLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {loading ? 'Refreshing Data...' : 'Calculating Signals...'}
              </>
            ) : (
              <>
                <span className="mr-2">🔄</span>
                Refresh Data & Signals
              </>
            )}
          </Button>

          {/* Auto-refresh Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Auto-refresh:</span>
            <button
              onClick={toggleAutoRefresh}
              disabled={loading || emaLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                autoRefreshEnabled ? 'bg-emerald-600' : 'bg-gray-200'
              } ${loading || emaLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRefreshEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${
              autoRefreshEnabled ? 'text-emerald-600' : 'text-gray-500'
            }`}>
              {autoRefreshEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          {/* Refresh Status */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{getTimeSinceRefresh()}</span>
          </div>

          {/* Rate Limit Status */}
          <div className="flex items-center gap-2">
            <span>API:</span>
            <span className={`font-medium px-3 py-1 rounded-full text-xs ${
              rateLimitInfo.requestsThisMinute >= MAX_REQUESTS_PER_MINUTE
                ? 'bg-red-100 text-red-700'
                : rateLimitInfo.requestsThisMinute >= MAX_REQUESTS_PER_MINUTE * 0.8
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-emerald-100 text-emerald-700'
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