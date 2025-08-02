import React, { useState, useMemo } from 'react';
import { Coin, EMAData } from '../types';
import Button from './Button';

interface AnalyzedCoin extends Coin {
  emaData: EMAData;
}

interface SwingSignalsProps {
  swingSignals: AnalyzedCoin[];
  allAnalyzedCoins: AnalyzedCoin[];
  emaLoading: boolean;
}

type ViewMode = 'buy-signals' | 'all-signals';
type SortOption = 'score' | 'signal' | 'price-change' | 'market-cap' | 'volume';

const SwingSignals: React.FC<SwingSignalsProps> = ({
  swingSignals,
  allAnalyzedCoins,
  emaLoading
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('buy-signals');
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort coins based on current settings
  const filteredAndSortedCoins = useMemo(() => {
    let filtered = viewMode === 'buy-signals' ? swingSignals : allAnalyzedCoins;
    
    // Sort the filtered coins
    return [...filtered].sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (sortBy) {
        case 'score':
          aValue = a.emaData.swingTradingScore;
          bValue = b.emaData.swingTradingScore;
          break;
        case 'price-change':
          aValue = a.price_change_percentage_24h;
          bValue = b.price_change_percentage_24h;
          break;
        case 'market-cap':
          aValue = a.market_cap;
          bValue = b.market_cap;
          break;
        case 'volume':
          aValue = a.total_volume;
          bValue = b.total_volume;
          break;
        case 'signal':
          // Convert signal to numeric value for sorting
          const signalOrder = { 'BUY': 3, 'HOLD': 2, 'SELL': 1 };
          aValue = signalOrder[a.emaData.signal] || 0;
          bValue = signalOrder[b.emaData.signal] || 0;
          break;
        default:
          aValue = a.emaData.swingTradingScore;
          bValue = b.emaData.swingTradingScore;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [viewMode, sortBy, sortOrder, swingSignals, allAnalyzedCoins]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('desc'); // Default to descending for most sorts
    }
  };

  if (emaLoading) {
    return null; // ProcessingStatus component will handle the loading state
  }

  if (allAnalyzedCoins.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No swing analysis data available</div>
        <p className="text-gray-400">Switch to the swing tab to start analysis</p>
        <div className="mt-4 flex justify-center gap-2">
          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            ✅ Real Data
          </div>
          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            📊 Technical Analysis
          </div>
        </div>
      </div>
    );
  }

  if (swingSignals.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Swing Analysis Results</h3>
          <div className="text-gray-500 mb-4">
            <p className="text-lg mb-2">No high-quality buy signals found</p>
            <p className="text-sm">Currently analyzing {allAnalyzedCoins.length} coins</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-800">
                {allAnalyzedCoins.filter(c => c.emaData.signal === 'HOLD').length}
              </div>
              <div className="text-sm text-yellow-700">Hold Signals</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-800">
                {allAnalyzedCoins.filter(c => c.emaData.signal === 'SELL').length}
              </div>
              <div className="text-sm text-red-700">Sell Signals</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-800">
                {allAnalyzedCoins.filter(c => c.emaData.swingTradingScore < 50).length}
              </div>
              <div className="text-sm text-gray-700">Low Quality</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
      {/* Header with controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-gray-900">
            {viewMode === 'buy-signals' ? 'Buy Signals' : 'All Analyzed Coins'} ({filteredAndSortedCoins.length})
          </h3>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              ✅ Real Data
            </div>
            <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              📊 Technical Analysis
            </div>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('buy-signals')}
                variant={viewMode === 'buy-signals' ? 'success' : 'ghost'}
                size="sm"
                className={viewMode === 'buy-signals' ? '' : 'text-gray-600 hover:text-gray-900'}
              >
                Buy Signals ({swingSignals.length})
              </Button>
              <Button
                onClick={() => setViewMode('all-signals')}
                variant={viewMode === 'all-signals' ? 'primary' : 'ghost'}
                size="sm"
                className={viewMode === 'all-signals' ? '' : 'text-gray-600 hover:text-gray-900'}
              >
                All Signals ({allAnalyzedCoins.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        {[
          { key: 'score', label: 'Score', icon: '📊' },
          { key: 'signal', label: 'Signal', icon: '🚦' },
          { key: 'price-change', label: '24h Change', icon: '📈' },
          { key: 'market-cap', label: 'Market Cap', icon: '💰' },
          { key: 'volume', label: 'Volume', icon: '📊' }
        ].map(({ key, label, icon }) => (
          <Button
            key={key}
            onClick={() => handleSort(key as SortOption)}
            variant={sortBy === key ? 'primary' : 'ghost'}
            size="sm"
          >
            <span>{icon}</span>
            <span>{label}</span>
            {sortBy === key && (
              <span className="ml-1">
                {sortOrder === 'desc' ? '↓' : '↑'}
              </span>
            )}
          </Button>
        ))}
      </div>
      
      <div className="space-y-4">
        {filteredAndSortedCoins.map((coin) => (
          <div key={coin.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
            coin.emaData.signal === 'BUY' 
              ? 'bg-green-50/80 border-green-300 hover:shadow-lg' 
              : coin.emaData.isBullish 
              ? 'bg-emerald-50/60 border-emerald-200 hover:shadow-lg'
              : 'bg-white/90 border-gray-200 hover:shadow-md'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                <div className="flex items-center gap-2">
                  <div>
                    <h4 className={`font-semibold ${
                      coin.emaData.signal === 'BUY' 
                        ? 'text-green-800' 
                        : coin.emaData.isBullish 
                        ? 'text-emerald-700'
                        : 'text-gray-900'
                    }`}>{coin.name}</h4>
                    <p className={`text-sm ${
                      coin.emaData.signal === 'BUY' 
                        ? 'text-green-600' 
                        : coin.emaData.isBullish 
                        ? 'text-emerald-600'
                        : 'text-gray-500'
                    }`}>{coin.symbol.toUpperCase()}</p>
                  </div>
                  {coin.emaData.signal === 'BUY' && (
                    <span className="text-2xl" title="Bullish Signal">🚀</span>
                  )}
                  {coin.emaData.signal === 'HOLD' && coin.emaData.isBullish && (
                    <span className="text-xl" title="Bullish Trend">📈</span>
                  )}
                  {coin.emaData.signal === 'SELL' && (
                    <span className="text-xl" title="Bearish Signal">📉</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ${coin.current_price.toLocaleString()}
                </div>
                <div className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div className={`text-center p-2 rounded border ${
                coin.emaData.signal === 'BUY'
                  ? 'bg-green-100 border-green-300 shadow-sm'
                  : coin.emaData.isBullish
                  ? 'bg-emerald-50 border-emerald-200'
                  : coin.emaData.swingTradingScore >= 70 
                  ? 'bg-green-50 border-green-200' 
                  : coin.emaData.swingTradingScore >= 50 
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-sm font-medium text-gray-800">Score</div>
                <div className={`text-lg font-bold ${
                  coin.emaData.swingTradingScore >= 70 
                    ? 'text-green-800' 
                    : coin.emaData.swingTradingScore >= 50 
                    ? 'text-yellow-800'
                    : 'text-red-800'
                }`}>
                  {coin.emaData.swingTradingScore}
                </div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                <div className="text-sm font-medium text-blue-800">RSI</div>
                <div className="text-lg font-bold text-blue-800">{coin.emaData.rsi}</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded border border-purple-200">
                <div className="text-sm font-medium text-purple-800">Trend</div>
                <div className="text-lg font-bold text-purple-800">
                  {coin.emaData.isBullish ? 'Bullish' : 'Bearish'}
                </div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                <div className="text-sm font-medium text-orange-800">Hold</div>
                <div className="text-lg font-bold text-orange-800">{coin.emaData.holdingPeriod.period}</div>
              </div>
            </div>
            
            {/* Trading Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
              <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                <div className="text-xs font-medium text-gray-600">Current</div>
                <div className="text-sm font-bold text-gray-900">${coin.current_price.toLocaleString()}</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                <div className="text-xs font-medium text-red-600">Stop Loss</div>
                <div className="text-sm font-bold text-red-800">
                  ${coin.emaData.riskMetrics?.stopLoss?.toFixed(4) || 'N/A'}
                </div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                <div className="text-xs font-medium text-green-600">Take Profit</div>
                <div className="text-sm font-bold text-green-800">
                  ${coin.emaData.riskMetrics?.takeProfit?.toFixed(4) || 'N/A'}
                </div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                <div className="text-xs font-medium text-blue-600">R/R Ratio</div>
                <div className="text-sm font-bold text-blue-800">
                  {coin.emaData.riskMetrics?.riskRewardRatio?.toFixed(1) || 'N/A'}:1
                </div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                <div className="text-xs font-medium text-yellow-600">Shares</div>
                <div className="text-sm font-bold text-yellow-800">
                  {coin.emaData.riskMetrics?.recommendedShares && coin.emaData.riskMetrics.recommendedShares > 0 
                    ? coin.emaData.riskMetrics.recommendedShares 
                    : 'N/A'}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {coin.emaData.isBullish && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Bullish Trend</span>
              )}
              {coin.emaData.isRSIHealthy && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Healthy RSI</span>
              )}
              {coin.emaData.isVolumeHealthy && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Good Volume</span>
              )}
              {coin.emaData.isVolumeIncreasing && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Volume ↑</span>
              )}
              <span className={`px-2 py-1 text-xs rounded-full ${
                coin.emaData.holdingPeriod.confidence === 'High' 
                  ? 'bg-green-100 text-green-800' 
                  : coin.emaData.holdingPeriod.confidence === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {coin.emaData.holdingPeriod.confidence} Confidence
              </span>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <strong>Reasoning:</strong> {coin.emaData.holdingPeriod.reasoning.join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredAndSortedCoins.length > 10 && (
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Showing {filteredAndSortedCoins.length} {viewMode === 'buy-signals' ? 'buy signals' : 'analyzed coins'}.
            {viewMode === 'all-signals' && swingSignals.length > 0 && (
              <span className="ml-2 text-green-600 font-medium">
                {swingSignals.length} buy signals found
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default SwingSignals; 