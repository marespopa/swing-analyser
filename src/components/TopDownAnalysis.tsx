import React, { useState, useEffect, useCallback } from 'react';
import { getPriceChange } from '../utils/formatters';

interface MarketConditions {
  overallTrend: 'bullish' | 'bearish' | 'sideways';
  marketStrength: 'strong' | 'moderate' | 'weak';
  marketBreadth: {
    advancingCoins: number;
    decliningCoins: number;
    neutralCoins: number;
    advanceDeclineRatio: number;
  };
  sectorRotation: {
    topPerformingSectors: string[];
    bottomPerformingSectors: string[];
    sectorStrength: 'risk-on' | 'risk-off' | 'mixed';
  };
  marketParticipation: {
    highVolumeCoins: number;
    lowVolumeCoins: number;
    averageVolume: number;
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
  };
  swingTradingConditions: {
    marketType: 'trending' | 'ranging' | 'volatile';
    riskLevel: 'low' | 'medium' | 'high';
    recommendedStrategy: string;
  };
}

interface TopDownAnalysisProps {
  coins: any[];
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const TopDownAnalysis: React.FC<TopDownAnalysisProps> = ({
  coins,
  selectedTimeframe,
  onTimeframeChange
}) => {
  const [marketConditions, setMarketConditions] = useState<MarketConditions | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const timeframes = [
    { value: '1w', label: 'Weekly', description: 'Major trend direction' },
    { value: '1d', label: 'Daily', description: 'Primary swing timeframe' },
    { value: '4h', label: '4 Hours', description: 'Entry/exit timing' },
    { value: '1h', label: '1 Hour', description: 'Fine-tune entries' }
  ];

  const analyzeMarketConditions = useCallback(async () => {
    setAnalysisLoading(true);
    try {
      if (coins.length === 0) {
        setMarketConditions(null);
        return;
      }

      // Market Breadth Analysis
      const advancingCoins = coins.filter(coin => {
        const change = getPriceChange(coin, selectedTimeframe);
        return change !== null && change > 0;
      }).length;

      const decliningCoins = coins.filter(coin => {
        const change = getPriceChange(coin, selectedTimeframe);
        return change !== null && change < 0;
      }).length;

      const neutralCoins = coins.length - advancingCoins - decliningCoins;
      const advanceDeclineRatio = decliningCoins > 0 ? advancingCoins / decliningCoins : advancingCoins;

      // Overall Trend Analysis
      let overallTrend: 'bullish' | 'bearish' | 'sideways';
      if (advanceDeclineRatio >= 1.5) {
        overallTrend = 'bullish';
      } else if (advanceDeclineRatio <= 0.67) {
        overallTrend = 'bearish';
      } else {
        overallTrend = 'sideways';
      }

      // Market Strength
      let marketStrength: 'strong' | 'moderate' | 'weak';
      const participationRate = (advancingCoins + decliningCoins) / coins.length;
      if (participationRate >= 0.8 && advanceDeclineRatio >= 2) {
        marketStrength = 'strong';
      } else if (participationRate >= 0.6 && advanceDeclineRatio >= 1.2) {
        marketStrength = 'moderate';
      } else {
        marketStrength = 'weak';
      }

      // Sector Rotation Analysis (simplified)
      const topPerformers = coins
        .filter(coin => {
          const change = getPriceChange(coin, selectedTimeframe);
          return change !== null && change > 5;
        })
        .slice(0, 3)
        .map(coin => coin.symbol);

      const bottomPerformers = coins
        .filter(coin => {
          const change = getPriceChange(coin, selectedTimeframe);
          return change !== null && change < -5;
        })
        .slice(0, 3)
        .map(coin => coin.symbol);

      let sectorStrength: 'risk-on' | 'risk-off' | 'mixed';
      if (topPerformers.length >= 2 && bottomPerformers.length <= 1) {
        sectorStrength = 'risk-on';
      } else if (bottomPerformers.length >= 2 && topPerformers.length <= 1) {
        sectorStrength = 'risk-off';
      } else {
        sectorStrength = 'mixed';
      }

      // Market Participation (Volume Analysis)
      const volumes = coins.map(coin => coin.total_volume).filter(vol => vol > 0);
      const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
      const highVolumeCoins = coins.filter(coin => coin.total_volume > avgVolume * 1.5).length;
      const lowVolumeCoins = coins.filter(coin => coin.total_volume < avgVolume * 0.5).length;

      let volumeTrend: 'increasing' | 'decreasing' | 'stable';
      if (highVolumeCoins > lowVolumeCoins * 2) {
        volumeTrend = 'increasing';
      } else if (lowVolumeCoins > highVolumeCoins * 2) {
        volumeTrend = 'decreasing';
      } else {
        volumeTrend = 'stable';
      }

      // Swing Trading Conditions
      let marketType: 'trending' | 'ranging' | 'volatile';
      let riskLevel: 'low' | 'medium' | 'high';
      let recommendedStrategy: string;

      if (advanceDeclineRatio >= 2 && marketStrength === 'strong') {
        marketType = 'trending';
        riskLevel = 'low';
        recommendedStrategy = 'Follow the trend - look for pullbacks to enter';
      } else if (advanceDeclineRatio >= 0.5 && advanceDeclineRatio <= 1.5) {
        marketType = 'ranging';
        riskLevel = 'medium';
        recommendedStrategy = 'Range trading - buy support, sell resistance';
      } else {
        marketType = 'volatile';
        riskLevel = 'high';
        recommendedStrategy = 'Reduce position size - wait for clearer signals';
      }

      const marketConditions: MarketConditions = {
        overallTrend,
        marketStrength,
        marketBreadth: {
          advancingCoins,
          decliningCoins,
          neutralCoins,
          advanceDeclineRatio: Math.round(advanceDeclineRatio * 100) / 100
        },
        sectorRotation: {
          topPerformingSectors: topPerformers,
          bottomPerformingSectors: bottomPerformers,
          sectorStrength
        },
        marketParticipation: {
          highVolumeCoins,
          lowVolumeCoins,
          averageVolume: Math.round(avgVolume / 1000000), // Convert to millions
          volumeTrend
        },
        swingTradingConditions: {
          marketType,
          riskLevel,
          recommendedStrategy
        }
      };

      setMarketConditions(marketConditions);
    } catch (error) {
      console.error('Market conditions analysis failed:', error);
    } finally {
      setAnalysisLoading(false);
    }
  }, [coins, selectedTimeframe]);

  useEffect(() => {
    if (coins.length > 0) {
      analyzeMarketConditions();
    }
  }, [analyzeMarketConditions]);

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-600 bg-green-50';
      case 'bearish': return 'text-red-600 bg-red-50';
      case 'sideways': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-emerald-600 bg-emerald-50';
      case 'moderate': return 'text-blue-600 bg-blue-50';
      case 'weak': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Timeframe Selection */}
        <div className="lg:w-1/3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top-Down Analysis Approach</h3>
          
          {/* Analysis Flow Guide */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-blue-800 mb-2">Analysis Flow</div>
            <div className="text-xs text-blue-700 space-y-1">
              <div>1. <strong>Weekly:</strong> Identify major trend direction</div>
              <div>2. <strong>Daily:</strong> Find swing opportunities</div>
              <div>3. <strong>4H:</strong> Time your entries/exits</div>
              <div>4. <strong>1H:</strong> Fine-tune entry points</div>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Select a timeframe to analyze market conditions and identify trading opportunities.
          </div>

          <div className="space-y-3">
            {timeframes.map((timeframe) => (
              <div
                key={timeframe.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTimeframe === timeframe.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onTimeframeChange(timeframe.value)}
              >
                <div className="font-medium text-gray-900">{timeframe.label}</div>
                <div className="text-sm text-gray-600">{timeframe.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Conditions Analysis */}
        <div className="lg:w-2/3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Conditions Analysis</h3>
          
          {analysisLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Analyzing market conditions...</span>
            </div>
          ) : marketConditions ? (
            <div className="space-y-6">
              {/* Market Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Overall Trend</div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(marketConditions.overallTrend)}`}>
                    {marketConditions.overallTrend.charAt(0).toUpperCase() + marketConditions.overallTrend.slice(1)}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Market Strength</div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStrengthColor(marketConditions.marketStrength)}`}>
                    {marketConditions.marketStrength.charAt(0).toUpperCase() + marketConditions.marketStrength.slice(1)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Risk Environment</div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    marketConditions.sectorRotation.sectorStrength === 'risk-on' ? 'text-green-600 bg-green-50' :
                    marketConditions.sectorRotation.sectorStrength === 'risk-off' ? 'text-red-600 bg-red-50' :
                    'text-yellow-600 bg-yellow-50'
                  }`}>
                    {marketConditions.sectorRotation.sectorStrength.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Market Breadth */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-800 mb-3">Market Breadth</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-green-600 font-semibold">{marketConditions.marketBreadth.advancingCoins}</div>
                    <div className="text-gray-600">Advancing</div>
                  </div>
                  <div>
                    <div className="text-red-600 font-semibold">{marketConditions.marketBreadth.decliningCoins}</div>
                    <div className="text-gray-600">Declining</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-semibold">{marketConditions.marketBreadth.neutralCoins}</div>
                    <div className="text-gray-600">Neutral</div>
                  </div>
                  <div>
                    <div className="text-blue-600 font-semibold">{marketConditions.marketBreadth.advanceDeclineRatio}</div>
                    <div className="text-gray-600">A/D Ratio</div>
                  </div>
                </div>
              </div>

              {/* Sector Rotation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-800 mb-3">Top Performers</div>
                  <div className="space-y-1">
                    {marketConditions.sectorRotation.topPerformingSectors.map((symbol, index) => (
                      <div key={index} className="text-sm text-green-700 font-medium">{symbol}</div>
                    ))}
                    {marketConditions.sectorRotation.topPerformingSectors.length === 0 && (
                      <div className="text-sm text-gray-500">No strong performers</div>
                    )}
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-red-800 mb-3">Bottom Performers</div>
                  <div className="space-y-1">
                    {marketConditions.sectorRotation.bottomPerformingSectors.map((symbol, index) => (
                      <div key={index} className="text-sm text-red-700 font-medium">{symbol}</div>
                    ))}
                    {marketConditions.sectorRotation.bottomPerformingSectors.length === 0 && (
                      <div className="text-sm text-gray-500">No weak performers</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Market Participation */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-800 mb-3">Market Participation</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-purple-600 font-semibold">{marketConditions.marketParticipation.highVolumeCoins}</div>
                    <div className="text-gray-600">High Volume</div>
                  </div>
                  <div>
                    <div className="text-purple-600 font-semibold">{marketConditions.marketParticipation.lowVolumeCoins}</div>
                    <div className="text-gray-600">Low Volume</div>
                  </div>
                  <div>
                    <div className="text-purple-600 font-semibold">${marketConditions.marketParticipation.averageVolume}M</div>
                    <div className="text-gray-600">Avg Volume</div>
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      marketConditions.marketParticipation.volumeTrend === 'increasing' ? 'text-green-600' :
                      marketConditions.marketParticipation.volumeTrend === 'decreasing' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {marketConditions.marketParticipation.volumeTrend.charAt(0).toUpperCase() + marketConditions.marketParticipation.volumeTrend.slice(1)}
                    </div>
                    <div className="text-gray-600">Volume Trend</div>
                  </div>
                </div>
              </div>

              {/* Swing Trading Strategy */}
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="text-sm font-medium text-emerald-800 mb-3">Swing Trading Strategy</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Market Type:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      marketConditions.swingTradingConditions.marketType === 'trending' ? 'bg-green-100 text-green-700' :
                      marketConditions.swingTradingConditions.marketType === 'ranging' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {marketConditions.swingTradingConditions.marketType.charAt(0).toUpperCase() + marketConditions.swingTradingConditions.marketType.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Risk Level:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      marketConditions.swingTradingConditions.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                      marketConditions.swingTradingConditions.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {marketConditions.swingTradingConditions.riskLevel.charAt(0).toUpperCase() + marketConditions.swingTradingConditions.riskLevel.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">
                    {marketConditions.swingTradingConditions.recommendedStrategy}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No market data available for analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopDownAnalysis; 