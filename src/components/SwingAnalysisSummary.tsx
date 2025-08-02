import React from 'react';
import { Coin } from '../types';

interface SwingAnalysisSummaryProps {
  totalCoins: number;
  analyzedCoins: Coin[];
  swingSignals: Coin[];
  isVisible: boolean;
}

const SwingAnalysisSummary: React.FC<SwingAnalysisSummaryProps> = ({
  totalCoins,
  analyzedCoins,
  swingSignals,
  isVisible
}) => {
  if (!isVisible || analyzedCoins.length === 0) {
    return null;
  }

  // Calculate statistics
  const momentumCoins = analyzedCoins.filter(coin => coin.price_change_percentage_24h > 5).length;
  const buySignals = swingSignals.length;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Swing Analysis Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-800">{totalCoins}</div>
          <div className="text-xs text-blue-600">Total Available</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-800">{analyzedCoins.length}</div>
          <div className="text-xs text-green-600">Analyzed</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-lg font-bold text-purple-800">{buySignals}</div>
          <div className="text-xs text-purple-600">Buy Signals</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-lg font-bold text-orange-800">{momentumCoins}</div>
          <div className="text-xs text-orange-600">High Momentum</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Selection Criteria Applied:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
          <div>✓ Filtered out stablecoins (USDT, USDC, BUSD, etc.)</div>
          <div>✓ Minimum market cap: $50M</div>
          <div>✓ Minimum 24h volume: $5M</div>
          <div>✓ Prioritized by trading volume</div>
          <div>✓ Included momentum leaders</div>
          <div>✓ Included large-cap leaders</div>
        </div>
      </div>

      {analyzedCoins.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Top Analyzed Coins:</h4>
          <div className="flex flex-wrap gap-2">
            {analyzedCoins.slice(0, 8).map((coin) => (
              <span
                key={coin.id}
                className={`px-2 py-1 text-xs rounded-full ${
                  swingSignals.some(signal => signal.id === coin.id)
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {coin.symbol.toUpperCase()}
                {swingSignals.some(signal => signal.id === coin.id) && ' ✓'}
              </span>
            ))}
            {analyzedCoins.length > 8 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{analyzedCoins.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SwingAnalysisSummary; 