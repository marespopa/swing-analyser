import React from 'react'
import type { PotentialCoin, Portfolio } from '../../types'
import { TechnicalAnalysisService } from '../../services/technicalAnalysis'
import { PotentialCoinsService } from '../../services/potentialCoins'
import { formatPercentage } from './utils'

interface PotentialCoinsProps {
  potentialCoins: PotentialCoin[]
  portfolio: Portfolio
}

const PotentialCoins: React.FC<PotentialCoinsProps> = ({
  potentialCoins
}) => {
  return (
    <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
      <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
        TOP 3 POTENTIAL COINS
      </h2>
      {potentialCoins.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-neo text-neo-text/60 mb-4">
            No top potential coins found yet
          </p>
          <p className="font-neo text-neo-text/40">
            We're analyzing the market for the best opportunities
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {potentialCoins.map((coin) => (
            <div
              key={coin.id}
              className="p-6 border-neo border-neo-border rounded-neo-lg bg-neo-surface/50 dark:bg-neo-surface-dark/50"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={coin.asset.image}
                      alt={coin.asset.name}
                      className="w-12 h-12 rounded-neo"
                    />
                    <div>
                      <h3 className="text-xl font-neo font-black text-neo-text">
                        {coin.asset.symbol}
                      </h3>
                      <p className="font-neo text-neo-text/60">
                        {coin.asset.name}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-neo text-sm font-neo font-bold ${
                      PotentialCoinsService.getCategoryColor(coin.category)
                    }`}>
                      {coin.category.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-neo text-neo-text/60">Reason</p>
                      <p className="font-neo font-bold text-neo-text">
                        {coin.reason}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-neo text-neo-text/60">Confidence</p>
                      <p className="font-neo font-bold text-neo-text">
                        {coin.confidence}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-neo text-neo-text/60">Expected Return</p>
                      <p className={`font-neo font-bold ${
                        coin.expectedReturn >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatPercentage(coin.expectedReturn)}
                      </p>
                    </div>
                  </div>

                  {/* Market Signal */}
                  <div className="mb-4">
                    <p className="text-sm font-neo text-neo-text/60 mb-1">Market Signal</p>
                    <p className="font-neo text-neo-text">
                      {coin.marketSignal}
                    </p>
                  </div>

                  {/* Technical Analysis Details */}
                  <div className="mt-4 p-4 bg-neo-surface/30 dark:bg-neo-surface-dark/30 border-neo border-neo-border rounded-neo">
                    <h4 className="font-neo font-bold text-neo-text mb-3">Technical Analysis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {(() => {
                        const indicators = TechnicalAnalysisService.calculateAllIndicators(coin.asset)
                        return (
                          <>
                            <div>
                              <p className="text-neo-text/60">RSI</p>
                              <p className={`font-neo font-bold ${
                                indicators.rsi < 30 ? 'text-green-600 dark:text-green-400' :
                                indicators.rsi > 70 ? 'text-red-600 dark:text-red-400' :
                                'text-neo-text'
                              }`}>
                                {indicators.rsi.toFixed(1)}
                              </p>
                            </div>
                            <div>
                              <p className="text-neo-text/60">Technical Score</p>
                              <div className="space-y-1">
                                <p className={`font-neo font-bold ${
                                  PotentialCoinsService.getTechnicalScorePercentage(coin.technicalScore, coin.category) > 70 ? 'text-green-600 dark:text-green-400' :
                                  PotentialCoinsService.getTechnicalScorePercentage(coin.technicalScore, coin.category) > 40 ? 'text-yellow-600 dark:text-yellow-400' :
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {PotentialCoinsService.formatTechnicalScore(coin.technicalScore, coin.category)}
                                </p>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${
                                      PotentialCoinsService.getTechnicalScorePercentage(coin.technicalScore, coin.category) > 70 ? 'bg-green-500' :
                                      PotentialCoinsService.getTechnicalScorePercentage(coin.technicalScore, coin.category) > 40 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ 
                                      width: `${PotentialCoinsService.getTechnicalScorePercentage(coin.technicalScore, coin.category)}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-neo-text/60">24h Change</p>
                              <p className={`font-neo font-bold ${
                                coin.asset.price_change_percentage_24h >= 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {formatPercentage(coin.asset.price_change_percentage_24h)}
                              </p>
                            </div>
                            <div>
                              <p className="text-neo-text/60">Market Cap</p>
                              <p className="font-neo font-bold text-neo-text">
                                ${(coin.asset.market_cap / 1000000).toFixed(1)}M
                              </p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-neo text-neo-text/60">Risk:</span>
                      <span className={`px-2 py-1 rounded-neo text-xs font-neo font-bold ${
                        coin.riskLevel === 'high' 
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : coin.riskLevel === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}>
                        {coin.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-neo text-neo-text/60">Suggested Allocation:</span>
                      <span className="font-neo font-bold text-neo-text">
                        {coin.suggestedAllocation}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-neo text-neo-text/60">Category:</span>
                      <span className="font-neo font-bold text-neo-text">
                        {PotentialCoinsService.getCategoryDescription(coin.category)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PotentialCoins 