import React from 'react';
import Button from './Button';

interface ProcessingStatusProps {
  emaLoading: boolean;
  onCancel?: () => void;
  // Real progress tracking
  realProgress?: { current: number; total: number; currentCoin: string };
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  emaLoading,
  onCancel,
  realProgress
}) => {
  if (!emaLoading) {
    return null;
  }

  const currentProgress = realProgress || { current: 0, total: 0, currentCoin: '' };
  const progressPercentage = currentProgress.total > 0 ? (currentProgress.current / currentProgress.total) * 100 : 0;
  const estimatedTimeRemaining = currentProgress.total > 0 ? 
    Math.ceil((currentProgress.total - currentProgress.current) * 2 / 60) : 0; // 2 seconds per request

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 border border-blue-200">
      <div className="text-center mb-6">
        <div className="spinner mx-auto mb-4"></div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Fetching Real Historical Data</h3>
        <p className="text-gray-600">Respecting 30 req/min rate limit - Processing one coin at a time</p>
      </div>

      {/* Progress Bar */}
      {currentProgress.total > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">
              {currentProgress.current}/{currentProgress.total} coins
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {Math.round(progressPercentage)}% complete
            </span>
            <span className="text-xs text-gray-500">
              ~{estimatedTimeRemaining} min remaining
            </span>
          </div>
        </div>
      )}

      {/* Current Status */}
      {currentProgress.currentCoin && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-medium text-blue-800">
              Processing: {currentProgress.currentCoin}
            </span>
          </div>
        </div>
      )}

      {/* Data Source Info */}
      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="text-sm text-green-700">
          <span className="font-medium">Data Source:</span> <button
            onClick={() => {
              if (window.__TAURI__) {
                try {
                  window.__TAURI__.shell.open('https://www.coingecko.com/en/api');
                } catch (_error) {
                  window.open('https://www.coingecko.com/en/api', '_blank', 'noopener,noreferrer');
                }
              } else {
                window.open('https://www.coingecko.com/en/api', '_blank', 'noopener,noreferrer');
              }
            }}
            className="text-green-700 hover:text-green-800 underline"
          >CoinGecko API</button>   (Real Historical Data)
        </div>
        <div className="text-xs text-green-600 mt-1">
          Rate limited to 30 requests/minute - Data cached in localStorage
        </div>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Button
            variant="danger"
            onClick={onCancel}
          >
            Cancel Processing
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus; 