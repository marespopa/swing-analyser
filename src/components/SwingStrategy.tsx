import React from 'react';
import { Coin, EMAData } from '../types';

interface AnalyzedCoin extends Coin {
  emaData: EMAData;
}

interface SwingStrategyProps {
  emaLoading: boolean;
  swingSignals: AnalyzedCoin[];
  allAnalyzedCoins: AnalyzedCoin[];
}

const SwingStrategy: React.FC<SwingStrategyProps> = ({
  emaLoading,
  swingSignals,
  allAnalyzedCoins
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900">Swing Strategy</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">200d Data</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">EMA/RSI</span>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-medium">{emaLoading ? '...' : swingSignals.length}</span>
            <span className="text-gray-600">Signals</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">{emaLoading ? '...' : allAnalyzedCoins.length}</span>
            <span className="text-gray-600">Analyzed</span>
          </div>
        </div>
      </div>

      {/* Compact Guidelines */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <span className="text-gray-700">Risk 1-2% per trade, 3:1 R/R ratio</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✅</span>
            <span className="text-gray-700">Follow plan, wait for signals</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">❌</span>
            <span className="text-gray-700">No emotional decisions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwingStrategy; 