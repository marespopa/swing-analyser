import React, { useState, useEffect, useCallback } from 'react';
import { Coin } from '../types';
import CoinAnalysisModal from './CoinAnalysisModal';
import Button from './Button';

interface TopDownAnalysisProps {
  coins: Coin[];
  onCoinSelect: (coin: Coin) => void;
}

interface AnalyzedCoin extends Coin {
  emaData: any;
}

interface MarketSnapshot {
  totalCoins: number;
  bullishCoins: number;
  bearishCoins: number;
  topRecommended: Coin[];
}

const TopDownAnalysis: React.FC<TopDownAnalysisProps> = ({
  coins,
  onCoinSelect
}) => {
  const [marketSnapshot, setMarketSnapshot] = useState<MarketSnapshot | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedCoins, setSelectedCoins] = useState<Coin[]>([]);
  const [analyzedCoins, setAnalyzedCoins] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'recommended' | 'overview'>('recommended');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoinForAnalysis, setSelectedCoinForAnalysis] = useState<Coin | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzedCoin | null>(null);
  const [individualAnalysisLoading, setIndividualAnalysisLoading] = useState(false);

  const analyzeMarket = useCallback(async () => {
    setAnalysisLoading(true);
    try {
      if (coins.length === 0) {
        setMarketSnapshot(null);
        return;
      }

      // Simple market analysis
      const bullishCoins = coins.filter(coin => coin.price_change_percentage_24h > 0);
      const bearishCoins = coins.filter(coin => coin.price_change_percentage_24h < 0);

      // Create top 10 recommended coins list
      const topRecommended = coins
        .filter(coin => {
          // Exclude stablecoins
          const stablecoinSymbols = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'FRAX', 'USDP', 'USDD', 'GUSD', 'LUSD'];
          if (stablecoinSymbols.includes(coin.symbol.toUpperCase())) return false;
          
          // Must have sufficient volume and market cap
          if (coin.total_volume < 100000) return false; // $100K+ volume
          if (coin.market_cap < 10000000) return false;   // $10M+ market cap
          
          // Must have positive 24h momentum
          if (coin.price_change_percentage_24h <= 0) return false;
          
          return true;
        })
        .sort((a, _b) => {
          // Score based on multiple factors
          const volumeScore = Math.log(a.total_volume) / Math.log(1000000000); // Normalize volume
          const momentumScore = a.price_change_percentage_24h / 100; // Normalize 24h change
          const marketCapScore = Math.log(a.market_cap) / Math.log(100000000000); // Normalize market cap
          
          // Weighted scoring: 40% volume, 40% momentum, 20% market cap
          const totalScore = (volumeScore * 0.4) + (momentumScore * 0.4) + (marketCapScore * 0.2);
          return totalScore;
        })
        .sort((a, b) => {
          // Sort by the calculated score (descending)
          const aScore = (Math.log(a.total_volume) / Math.log(1000000000) * 0.4) + 
                        (a.price_change_percentage_24h / 100 * 0.4) + 
                        (Math.log(a.market_cap) / Math.log(100000000000) * 0.2);
          const bScore = (Math.log(b.total_volume) / Math.log(1000000000) * 0.4) + 
                        (b.price_change_percentage_24h / 100 * 0.4) + 
                        (Math.log(b.market_cap) / Math.log(100000000000) * 0.2);
          return bScore - aScore;
        })
        .slice(0, 10);

      setMarketSnapshot({
        totalCoins: coins.length,
        bullishCoins: bullishCoins.length,
        bearishCoins: bearishCoins.length,
        topRecommended
      });
    } catch (error) {
      console.error('Market analysis failed:', error);
    } finally {
      setAnalysisLoading(false);
    }
  }, [coins]);

  useEffect(() => {
    if (coins.length > 0) {
      analyzeMarket();
    }
  }, [analyzeMarket, coins.length]);

  const getFilterData = () => {
    if (!marketSnapshot) return [];
    return marketSnapshot.topRecommended;
  };

  const handleCoinSelect = (coin: Coin) => {
    const isAlreadySelected = selectedCoins.find(c => c.id === coin.id);
    if (isAlreadySelected) {
      // Remove coin if already selected
      setSelectedCoins(prev => prev.filter(c => c.id !== coin.id));
      // Also remove from analyzed coins if it was analyzed
      setAnalyzedCoins(prev => {
        const newSet = new Set(prev);
        newSet.delete(coin.id);
        return newSet;
      });
    } else {
      // Add coin if not selected
      setSelectedCoins(prev => [...prev, coin]);
    }
  };

  const handleCoinRemove = (coinId: string) => {
    setSelectedCoins(prev => prev.filter(c => c.id !== coinId));
    setAnalyzedCoins(prev => {
      const newSet = new Set(prev);
      newSet.delete(coinId);
      return newSet;
    });
  };

  const handleCoinAnalyzed = (coinId: string) => {
    setAnalyzedCoins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(coinId)) {
        newSet.delete(coinId);
      } else {
        newSet.add(coinId);
      }
      return newSet;
    });
  };

  const handleAnalyzeCoin = async (coin: Coin) => {
    setSelectedCoinForAnalysis(coin);
    setIsModalOpen(true);
    setIndividualAnalysisLoading(true);
    setAnalysisResult(null);
    
    try {
      // Call the parent's onCoinSelect which triggers the analysis
      onCoinSelect(coin);
      
      // For now, we'll simulate the analysis result
      // In a real implementation, you'd wait for the analysis to complete
      // and then update the analysisResult state
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock analysis result for demonstration
      const mockAnalysisResult: AnalyzedCoin = {
        ...coin,
        emaData: {
          signal: 'BUY',
          qualityScore: 8.5,
          actionRecommendation: 'Strong buy signal with good risk/reward ratio',
          signalReasoning: [
            'Bullish EMA trend with price above both EMAs',
            'Positive momentum across multiple timeframes',
            'Healthy RSI levels indicating no overbought conditions',
            'Strong volume support for the current move'
          ],
          ema50: coin.current_price * 0.98,
          ema200: coin.current_price * 0.95,
          isBullish: true,
          rsi: 65,
          isRSIHealthy: true,
          volumeRatio: 1.2,
          isVolumeTrendingUp: true,
          isVolumeHealthy: true,
          swingTradingScore: 85,
          riskMetrics: {
            stopLoss: coin.current_price * 0.975,
            takeProfit: coin.current_price * 1.075,
            riskRewardRatio: 3.0,
            isGoodRiskReward: true
          },
          holdingPeriod: {
            period: '3-7 days',
            confidence: 'Medium' as const,
            reasoning: ['Bullish EMA trend', 'Positive momentum', 'Good volume support']
          },
          dataQuality: 'good',
          note: 'Analysis based on 200 days of historical data'
        }
      };
      
      setAnalysisResult(mockAnalysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIndividualAnalysisLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCoinForAnalysis(null);
    setAnalysisResult(null);
  };

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Top-Down Analysis</h3>
        <p className="text-gray-600">Curated selections based on key trading criteria: liquidity, fundamentals, and clear trends</p>
      </div>



      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <Button
          onClick={() => setActiveTab('recommended')}
          variant={activeTab === 'recommended' ? 'primary' : 'ghost'}
          size="md"
          className={`flex-1 ${activeTab === 'recommended' ? 'shadow-sm' : ''}`}
        >
          Browse Coins ({getFilterData().length})
        </Button>
        <Button
          onClick={() => setActiveTab('overview')}
          variant={activeTab === 'overview' ? 'primary' : 'ghost'}
          size="md"
          className={`flex-1 ${activeTab === 'overview' ? 'shadow-sm' : ''}`}
        >
          My Analysis List ({selectedCoins.length})
        </Button>
      </div>

      {activeTab === 'recommended' && (
        <>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">🎯 Curated Coin Selection</h4>
            <p className="text-sm text-gray-600 mb-4">Click on coins to add/remove them from your analysis list</p>
          </div>

          {analysisLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Scanning market...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilterData().map((coin) => (
                <div
                  key={coin.id}
                  onClick={() => handleCoinSelect(coin)}
                  className={`rounded-lg p-4 cursor-pointer transition-all duration-200 border-2 relative ${
                    selectedCoins.find(c => c.id === coin.id)
                      ? 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  {selectedCoins.find(c => c.id === coin.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">{coin.symbol}</div>
                    <div className={`text-sm font-medium ${
                      coin.price_change_percentage_24h > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">{coin.name}</div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-700">{formatPrice(coin.current_price)}</div>
                    <div className="text-gray-500">{formatVolume(coin.total_volume)}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Market Cap: ${(coin.market_cap / 1000000).toFixed(0)}M | Rank: #{coin.market_cap_rank}
                  </div>
                </div>
              ))}
            </div>
          )}

          {getFilterData().length === 0 && !analysisLoading && (
            <div className="text-center py-8 text-gray-500">
              No coins match the current filter criteria
            </div>
          )}
        </>
      )}

      {activeTab === 'overview' && (
        <>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">📊 Analysis Progress</h4>
            <p className="text-sm text-gray-600 mb-4">Track your analysis progress - check off coins as you analyze them</p>
          </div>

          {selectedCoins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No coins selected yet</p>
              <p className="text-sm mt-2">Go to "Recommended Buys" and click on coins to add them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedCoins.map((coin) => (
                <div
                  key={coin.id}
                  className={`rounded-lg p-4 border border-gray-200 flex items-center justify-between transition-all duration-200 ${
                    analyzedCoins.has(coin.id) 
                      ? 'bg-emerald-50 border-emerald-200 opacity-75' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={analyzedCoins.has(coin.id)}
                      onChange={() => handleCoinAnalyzed(coin.id)}
                      className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <div className={`${analyzedCoins.has(coin.id) ? 'line-through' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${analyzedCoins.has(coin.id) ? 'text-emerald-700' : 'text-gray-900'}`}>
                          {coin.symbol}
                        </span>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                          coin.price_change_percentage_24h > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(1)}%
                        </span>
                      </div>
                      <div className={`text-sm ${analyzedCoins.has(coin.id) ? 'text-emerald-600' : 'text-gray-600'}`}>
                        {coin.name}
                      </div>
                      <div className={`text-xs ${analyzedCoins.has(coin.id) ? 'text-emerald-500' : 'text-gray-500'}`}>
                        {formatPrice(coin.current_price)} | {formatVolume(coin.total_volume)} | Rank: #{coin.market_cap_rank}
                      </div>
                    </div>
                  </div>
                                                       <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleAnalyzeCoin(coin)}
                      variant="primary"
                      size="sm"
                    >
                      Analyze
                    </Button>
                    <Button
                      onClick={() => handleCoinRemove(coin.id)}
                      variant="danger"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCoins.length > 0 && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-blue-800">Progress</h5>
                  <p className="text-sm text-blue-700">
                    {analyzedCoins.size} of {selectedCoins.length} coins analyzed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((analyzedCoins.size / selectedCoins.length) * 100)}%
                  </div>
                  <div className="text-sm text-blue-700">Complete</div>
                </div>
              </div>
              <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(analyzedCoins.size / selectedCoins.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </>
      )}

            {/* Selection Criteria */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h5 className="font-medium text-blue-800 mb-2">🎯 Selection Criteria</h5>
        <div className="text-sm text-blue-700 space-y-1">
          <div>• <strong>Excludes Stablecoins:</strong> USDT, USDC, BUSD, DAI, and other stablecoins filtered out</div>
          <div>• <strong>Volume:</strong> Minimum $100K daily trading volume for liquidity</div>
          <div>• <strong>Momentum:</strong> Positive 24h price change required</div>
          <div>• <strong>Market Cap:</strong> Minimum $10M market cap for established projects</div>
          <div>• <strong>Scoring:</strong> Ranked by volume (40%), momentum (40%), and market cap (20%)</div>
        </div>
      </div>

      {/* Coin Analysis Modal */}
      <CoinAnalysisModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        coin={selectedCoinForAnalysis}
        analysisResult={analysisResult}
        isLoading={individualAnalysisLoading}
        onAnalyze={handleAnalyzeCoin}
      />
    </div>
  );
};

export default TopDownAnalysis; 