import React from 'react';
import { Coin, EMAData } from '../types';
import Button from './Button';

interface AnalyzedCoin extends Coin {
  emaData: EMAData;
}

interface SwingStrategyProps {
  emaLoading: boolean;
  swingSignals: AnalyzedCoin[];
  allAnalyzedCoins: AnalyzedCoin[];
  loading: boolean;
  onRefresh: () => void;
  onRecalculateSignals: () => void;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
  getTimeSinceRefresh: () => string;
  countdown: number;
  rateLimitInfo: { requestsThisMinute: number };
  MAX_REQUESTS_PER_MINUTE: number;
}

const SwingStrategy: React.FC<SwingStrategyProps> = ({
  emaLoading,
  swingSignals,
  allAnalyzedCoins,
  loading,
  onRefresh,
  onRecalculateSignals,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  getTimeSinceRefresh,
  countdown,
  rateLimitInfo,
  MAX_REQUESTS_PER_MINUTE
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhanced Swing Strategy</h2>
        <p className="text-gray-600">Advanced Technical Analysis for Quality Swing Trading Signals</p>

        {/* Data Source Info */}
        <div className="mt-4 flex justify-center">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <div className="text-sm text-green-700">
              <span className="font-medium">Data Source:</span> CoinGecko API (Pro) + Real Technical Analysis
            </div>
            <div className="text-xs text-green-600 mt-1">
              Enhanced rate limits with API key - Real EMA/RSI calculations using 200 days of historical data
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-800">
            {emaLoading ? '...' : swingSignals.length}
          </div>
          <div className="text-sm text-green-700">Quality Signals</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">
            {emaLoading ? '...' : allAnalyzedCoins.length}
          </div>
          <div className="text-sm text-blue-700">Analyzed Coins</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">3:1</div>
          <div className="text-sm text-blue-700">Risk/Reward</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-800">35-65</div>
          <div className="text-sm text-purple-700">RSI Range</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-800">↑20%</div>
          <div className="text-sm text-orange-700">Volume Up</div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-indigo-800">100</div>
          <div className="text-sm text-indigo-700">Quality Score</div>
        </div>
      </div>

      {/* Refresh Controls for Swing Strategy */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onRefresh}
              disabled={loading || emaLoading}
              variant="primary"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Refresh Data
                </>
              )}
            </Button>

            <Button
              onClick={onRecalculateSignals}
              disabled={emaLoading}
              variant="success"
            >
              {emaLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <span>📊</span>
                  Recalculate Signals
                </>
              )}
            </Button>

            <Button
              onClick={onToggleAutoRefresh}
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
                <span className="font-medium text-green-600">
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
    </div>
  );
};

export default SwingStrategy; 