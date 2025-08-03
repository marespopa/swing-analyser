import React from 'react';
import { Coin, EMAData } from '../types';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import NewsSentimentWidget from './NewsSentimentWidget';

interface AnalyzedCoin extends Coin {
  emaData: EMAData;
}

interface CoinAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: any | null;
  analysisResult: AnalyzedCoin | null;
  isLoading: boolean;
  onAnalyze: (coin: any) => void;
}

const CoinAnalysisModal: React.FC<CoinAnalysisModalProps> = ({
  isOpen,
  onClose,
  coin,
  analysisResult,
  isLoading,
  onAnalyze
}) => {
  if (!isOpen || !coin) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={coin.image}
                alt={coin.name}
                className="w-12 h-12 rounded-xl shadow-sm border-2 border-white"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{coin.name}</h2>
                <p className="text-emerald-600 font-semibold">{coin.symbol.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onClose}
                variant="secondary"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner message="Analyzing coin..." />
              <p className="text-gray-500 mt-4">Fetching historical data and calculating swing signals...</p>
            </div>
          ) : !analysisResult ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No analysis available</div>
              <p className="text-gray-400 mb-6">Click analyze to perform swing trading analysis for this coin</p>
              <Button
                onClick={() => onAnalyze(coin)}
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Analyze {coin.symbol.toUpperCase()}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Price and Signal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Price</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(analysisResult.current_price)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Market Cap: {formatCurrency(analysisResult.market_cap)}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Signal</h3>
                  <div className={`text-2xl font-bold mb-2 ${
                    analysisResult.emaData.signal === 'BUY' ? 'text-emerald-600' :
                    analysisResult.emaData.signal === 'SELL' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {analysisResult.emaData.signal === 'BUY' ? 'BUY NOW' : 
                     analysisResult.emaData.signal === 'SELL' ? 'WAIT' : 'MONITOR'}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Quality Score: {analysisResult.emaData.qualityScore.toFixed(1)}/10
                  </div>
                  {analysisResult.emaData.actionRecommendation && (
                    <div className="text-sm font-medium text-gray-800 bg-white/50 rounded-lg p-2">
                      {analysisResult.emaData.actionRecommendation}
                    </div>
                  )}
                </div>
              </div>

              {/* Signal Reasoning */}
              {analysisResult.emaData.signalReasoning && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Why {analysisResult.emaData.signal === 'BUY' ? 'Buy Now' : analysisResult.emaData.signal === 'SELL' ? 'Wait' : 'Monitor'}?</h3>
                  <div className="space-y-2">
                    {analysisResult.emaData.signalReasoning.map((reason, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          analysisResult.emaData.signal === 'BUY' ? 'bg-emerald-500' :
                          analysisResult.emaData.signal === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div className="text-sm text-gray-700">{reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Analysis */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">EMA Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">EMA 50:</span>
                        <span className="font-medium">{formatCurrency(analysisResult.emaData.ema50)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">EMA 200:</span>
                        <span className="font-medium">{formatCurrency(analysisResult.emaData.ema200)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trend:</span>
                        <span className={`font-medium ${analysisResult.emaData.isBullish ? 'text-emerald-600' : 'text-red-600'}`}>
                          {analysisResult.emaData.isBullish ? 'Bullish' : 'Bearish'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">RSI Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">RSI:</span>
                        <span className="font-medium">{analysisResult.emaData.rsi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Health:</span>
                        <span className={`font-medium ${analysisResult.emaData.isRSIHealthy ? 'text-emerald-600' : 'text-red-600'}`}>
                          {analysisResult.emaData.isRSIHealthy ? 'Healthy' : 'Unhealthy'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Volume Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volume Ratio:</span>
                        <span className="font-medium">{analysisResult.emaData.volumeRatio.toFixed(2)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trend:</span>
                        <span className={`font-medium ${analysisResult.emaData.isVolumeTrendingUp ? 'text-emerald-600' : 'text-red-600'}`}>
                          {analysisResult.emaData.isVolumeTrendingUp ? 'Increasing' : 'Decreasing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                            {/* Entry & Exit Strategy */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Entry & Exit Strategy</h3>
                
                <div className="space-y-6">
                  {/* Entry Analysis */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Entry Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-600 font-medium">Best Entry Window</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Current Price:</span>
                            <span className="font-medium">{formatCurrency(analysisResult.current_price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Entry Range:</span>
                            <span className="font-medium">
                              {formatCurrency(analysisResult.current_price * 0.98)} - {formatCurrency(analysisResult.current_price * 1.02)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Entry Confidence:</span>
                            <span className={`font-medium ${
                              analysisResult.emaData.swingTradingScore >= 80 ? 'text-emerald-600' :
                              analysisResult.emaData.swingTradingScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {analysisResult.emaData.swingTradingScore >= 80 ? 'High' :
                               analysisResult.emaData.swingTradingScore >= 60 ? 'Medium' : 'Low'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-emerald-600 font-medium">Entry Conditions</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trend Alignment:</span>
                            <span className={`font-medium ${analysisResult.emaData.isBullish ? 'text-emerald-600' : 'text-red-600'}`}>
                              {analysisResult.emaData.isBullish ? 'Bullish' : 'Bearish'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">RSI Status:</span>
                            <span className={`font-medium ${analysisResult.emaData.isRSIHealthy ? 'text-emerald-600' : 'text-yellow-600'}`}>
                              {analysisResult.emaData.isRSIHealthy ? 'Healthy' : 'Extreme'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Volume Support:</span>
                            <span className={`font-medium ${analysisResult.emaData.isVolumeHealthy ? 'text-emerald-600' : 'text-red-600'}`}>
                              {analysisResult.emaData.isVolumeHealthy ? 'Good' : 'Weak'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Target/Stop Loss */}
                  {analysisResult.emaData.riskMetrics && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Target/Stop Loss</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4">
                          <div className="text-center">
                            <div className="text-red-600 font-bold text-lg">
                              {formatCurrency(analysisResult.emaData.riskMetrics.stopLoss)}
                            </div>
                            <div className="text-sm text-red-600 font-medium">Stop Loss</div>
                            <div className="text-xs text-gray-500">2.5% below current</div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4">
                          <div className="text-center">
                            <div className="text-emerald-600 font-bold text-lg">
                              {formatCurrency(analysisResult.emaData.riskMetrics.takeProfit)}
                            </div>
                            <div className="text-sm text-emerald-600 font-medium">Take Profit</div>
                            <div className="text-xs text-gray-500">7.5% above current</div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                          <div className="text-center">
                            <div className={`font-bold text-lg ${analysisResult.emaData.riskMetrics.isGoodRiskReward ? 'text-emerald-600' : 'text-yellow-600'}`}>
                              {analysisResult.emaData.riskMetrics.riskRewardRatio.toFixed(1)}:1
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Risk/Reward</div>
                            <div className="text-xs text-gray-500">
                              {analysisResult.emaData.riskMetrics.isGoodRiskReward ? 'Good ratio' : 'Moderate ratio'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Support & Resistance Levels */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Support & Resistance Levels</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-600 font-medium">Support Levels</span>
                        </div>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Strong Support:</span>
                            <span className="font-medium text-red-600">{formatCurrency(analysisResult.current_price * 0.95)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Key Support:</span>
                            <span className="font-medium text-red-600">{formatCurrency(analysisResult.current_price * 0.97)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">24h Low:</span>
                            <span className="font-medium text-red-600">{formatCurrency(analysisResult.low_24h)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-emerald-600 font-medium">Resistance Levels</span>
                        </div>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Key Resistance:</span>
                            <span className="font-medium text-emerald-600">{formatCurrency(analysisResult.current_price * 1.03)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Strong Resistance:</span>
                            <span className="font-medium text-emerald-600">{formatCurrency(analysisResult.current_price * 1.05)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">24h High:</span>
                            <span className="font-medium text-emerald-600">{formatCurrency(analysisResult.high_24h)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Entry Strategy */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">What Should You Do?</h4>
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {analysisResult.emaData.signal === 'BUY' ? (
                          <>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-sm">
                                <span className="font-medium text-emerald-600">Immediate Action:</span>
                                <span className="text-gray-700"> Consider buying now with proper position sizing and stop loss at {formatCurrency(analysisResult.emaData.riskMetrics?.stopLoss || 0)}.</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-sm">
                                <span className="font-medium text-emerald-600">Entry Strategy:</span>
                                <span className="text-gray-700"> Enter with 60% of position now, add 40% if price pulls back to {formatCurrency(analysisResult.current_price * 0.97)}.</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-sm">
                                <span className="font-medium text-emerald-600">Target:</span>
                                <span className="text-gray-700"> Aim for {formatCurrency(analysisResult.emaData.riskMetrics?.takeProfit || 0)} (7.5% gain) with stop loss at {formatCurrency(analysisResult.emaData.riskMetrics?.stopLoss || 0)}.</span>
                              </div>
                            </div>
                          </>
                        ) : analysisResult.emaData.signal === 'SELL' ? (
                          <>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-sm">
                                <span className="font-medium text-red-600">Avoid Buying:</span>
                                <span className="text-gray-700"> Current conditions are unfavorable. Wait for trend reversal or better setup.</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-sm">
                                <span className="font-medium text-red-600">Wait For:</span>
                                <span className="text-gray-700"> Price to show bullish reversal signals or RSI to move above 30.</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-sm">
                                <span className="font-medium text-red-600">Monitor:</span>
                                <span className="text-gray-700"> Check back in 4-8 hours for improved conditions.</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-sm">
                                <span className="font-medium text-yellow-600">Wait & Watch:</span>
                                <span className="text-gray-700"> Mixed signals suggest waiting for clearer direction before entering.</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-sm">
                                <span className="font-medium text-yellow-600">Look For:</span>
                                <span className="text-gray-700"> Breakout above {formatCurrency(analysisResult.current_price * 1.02)} or breakdown below {formatCurrency(analysisResult.current_price * 0.98)}.</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-sm">
                                <span className="font-medium text-yellow-600">Check Back:</span>
                                <span className="text-gray-700"> Re-analyze in 2-4 hours for updated signals.</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Risk Considerations */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Risk Considerations</h4>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Market Volatility:</span>
                          <span className="font-medium text-orange-600">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Liquidity Risk:</span>
                          <span className="font-medium text-orange-600">Moderate</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trend Strength:</span>
                          <span className={`font-medium ${
                            analysisResult.emaData.swingTradingScore >= 70 ? 'text-emerald-600' : 'text-orange-600'
                          }`}>
                            {analysisResult.emaData.swingTradingScore >= 70 ? 'Strong' : 'Weak'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stop Loss Distance:</span>
                          <span className="font-medium text-red-600">2-3% below entry</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Holding Period - Only show for BUY and HOLD signals */}
              {analysisResult.emaData.signal !== 'SELL' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Holding Period</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Recommended Period:</span>
                      <span className="font-medium text-gray-900">{analysisResult.emaData.holdingPeriod.period}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className={`font-medium ${
                        analysisResult.emaData.holdingPeriod.confidence === 'High' ? 'text-emerald-600' :
                        analysisResult.emaData.holdingPeriod.confidence === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {analysisResult.emaData.holdingPeriod.confidence}
                      </span>
                    </div>

                  </div>
                </div>
              )}

              {/* News Sentiment */}
              <NewsSentimentWidget coinSymbol={coin.symbol} />



              {/* Data Quality */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Data Quality:</span>
                  <span className={`font-medium ${
                    analysisResult.emaData.dataQuality === 'excellent' ? 'text-emerald-600' :
                    analysisResult.emaData.dataQuality === 'good' ? 'text-blue-600' :
                    analysisResult.emaData.dataQuality === 'limited' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analysisResult.emaData.dataQuality.charAt(0).toUpperCase() + analysisResult.emaData.dataQuality.slice(1)}
                  </span>
                </div>
                {analysisResult.emaData.note && (
                  <p className="text-xs text-gray-500 mt-2">{analysisResult.emaData.note}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinAnalysisModal; 