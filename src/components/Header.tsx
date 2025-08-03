import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import Button from './Button';
import { tradeStatsAtom } from '../stores/tradeLogStore';

interface HeaderProps {
  loading: boolean;
  onOpenSettings?: () => void;
  // Refresh controls props
  handleManualRefresh?: () => void;
  autoRefreshEnabled?: boolean;
  toggleAutoRefresh?: () => void;
  refreshInterval?: number;
  getTimeSinceRefresh?: () => string;
  rateLimitInfo?: {
    requestsThisMinute: number;
    lastReset: number;
  };
  MAX_REQUESTS_PER_MINUTE?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  loading, 
  onOpenSettings,
  handleManualRefresh,
  autoRefreshEnabled = false,
  toggleAutoRefresh,
  refreshInterval,
  getTimeSinceRefresh,
  rateLimitInfo,
  MAX_REQUESTS_PER_MINUTE = 30
}) => {
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'market'; // Remove leading slash
  const tradeStats = useAtomValue(tradeStatsAtom);

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                Swing Analyser
              </h1>
              {onOpenSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenSettings}
                  className="p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <title>Settings</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Button>
              )}
            </div>
            <p className="text-gray-600">Real-time cryptocurrency analysis & trading insights</p>
          </div>

          {/* Compact Refresh Controls - Only show on market data pages */}
          {handleManualRefresh && activeTab !== 'trades' && (
            <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
              {/* Refresh Button */}
              <Button
                onClick={handleManualRefresh}
                disabled={loading}
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <span className="mr-1">🔄</span>
                    Refresh
                  </>
                )}
              </Button>

              {/* Auto-refresh Toggle */}
              {toggleAutoRefresh && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">Auto:</span>
                  <button
                    onClick={toggleAutoRefresh}
                    disabled={loading}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                      autoRefreshEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        autoRefreshEnabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-medium ${
                    autoRefreshEnabled ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {autoRefreshEnabled ? 'ON' : 'OFF'}
                  </span>
                  {refreshInterval && (
                    <span className="text-xs text-gray-500">
                      ({Math.floor(refreshInterval / 60)}m)
                    </span>
                  )}

                </div>
              )}

              {/* Last Updated */}
              {getTimeSinceRefresh && (
                <div className="text-xs text-gray-500">
                  Updated: {getTimeSinceRefresh()}
                </div>
              )}

              {/* Rate Limit */}
              {rateLimitInfo && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">API:</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    rateLimitInfo.requestsThisMinute >= MAX_REQUESTS_PER_MINUTE
                      ? 'bg-red-100 text-red-700'
                      : rateLimitInfo.requestsThisMinute >= MAX_REQUESTS_PER_MINUTE * 0.8
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {rateLimitInfo.requestsThisMinute}/{MAX_REQUESTS_PER_MINUTE}
                  </span>
                </div>
              )}
            </div>
          )}



          {/* Trade Stats for Trades Tab */}
          {!loading && activeTab === 'trades' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-800">
                    {tradeStats.totalTrades}
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">
                    Total Trades
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">
                    {tradeStats.winningTrades}
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    Winning Trades
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-800">
                    {tradeStats.losingTrades}
                  </div>
                  <div className="text-sm text-red-700 font-medium">
                    Losing Trades
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-800">
                    {tradeStats.winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    Win Rate
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      

    </header>
  );
};

export default Header; 