import React from 'react';
import { Coin, EMAData } from '../types';

interface AnalyzedCoin extends Coin {
  emaData: EMAData;
}

interface AnalysisSummaryProps {
  swingSignals: AnalyzedCoin[];
  allAnalyzedCoins: AnalyzedCoin[];
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({
  swingSignals,
  allAnalyzedCoins
}) => {
  if (allAnalyzedCoins.length === 0) {
    return null;
  }

  const highScoreCount = allAnalyzedCoins.filter(c => c.emaData.swingTradingScore >= 70).length;
  const mediumScoreCount = allAnalyzedCoins.filter(c => c.emaData.swingTradingScore >= 50 && c.emaData.swingTradingScore < 70).length;
  const lowScoreCount = allAnalyzedCoins.filter(c => c.emaData.swingTradingScore < 50).length;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-blue-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-800">{swingSignals.length}</div>
          <div className="text-sm text-green-700">Buy Signals</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-800">{highScoreCount}</div>
          <div className="text-sm text-blue-700">High Score (70+)</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-800">{mediumScoreCount}</div>
          <div className="text-sm text-yellow-700">Medium Score (50-69)</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-800">{lowScoreCount}</div>
          <div className="text-sm text-gray-700">Low Score (&lt;50)</div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSummary; 