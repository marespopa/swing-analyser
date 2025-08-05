import React, { useState, useEffect } from 'react'
import { MarketSentimentService } from '../services/marketSentiment'
import type { MarketSentiment } from '../services/marketSentiment'
import Button from './ui/Button'

interface MarketSentimentWidgetProps {
  className?: string
  showDetails?: boolean
}

export const MarketSentimentWidget: React.FC<MarketSentimentWidgetProps> = ({
  className = '',
  showDetails = true
}) => {
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)

  useEffect(() => {
    loadSentiment()
  }, [])

  const loadSentiment = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await MarketSentimentService.getMarketSentiment()
      setSentiment(data)
    } catch (err) {
      setError('Failed to load market sentiment')
      console.error('Error loading sentiment:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 bg-green-100 border-green-200'
      case 'bearish': return 'text-red-600 bg-red-100 border-red-200'
      case 'neutral': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return '📈'
      case 'bearish': return '📉'
      case 'neutral': return '➡️'
      default: return '❓'
    }
  }

  const getFearGreedColor = (value: number) => {
    if (value >= 75) return 'text-green-600'
    if (value >= 50) return 'text-yellow-600'
    if (value >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  const getFearGreedLabel = (value: number) => {
    if (value >= 75) return 'Extreme Greed'
    if (value >= 60) return 'Greed'
    if (value >= 40) return 'Neutral'
    if (value >= 25) return 'Fear'
    return 'Extreme Fear'
  }

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    return num.toLocaleString()
  }

  if (isLoading) {
    return (
      <div className={`bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-4 rounded-neo-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-5 bg-neo-text/20 rounded-neo w-1/3 mb-3"></div>
          <div className="h-3 bg-neo-text/20 rounded-neo w-1/2 mb-2"></div>
          <div className="h-3 bg-neo-text/20 rounded-neo w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error || !sentiment) {
    return (
      <div className={`bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-4 rounded-neo-lg ${className}`}>
        <div className="text-center">
          <p className="font-neo text-neo-text/80 mb-3">{error || 'No sentiment data available'}</p>
          <Button
            onClick={loadSentiment}
            variant="primary"
            size="sm"
          >
            RETRY
          </Button>
        </div>
      </div>
    )
  }

  // Get active signals only
  const activeSignals = [
    { label: 'Bull Market', value: sentiment.signals.isBullMarket, icon: '📈', color: 'green' },
    { label: 'Bear Market', value: sentiment.signals.isBearMarket, icon: '📉', color: 'red' },
    { label: 'Altcoin Season', value: sentiment.signals.isAltcoinSeason, icon: '🌱', color: 'purple' },
    { label: 'High Risk', value: sentiment.signals.riskLevel === 'high', icon: '⚠️', color: 'orange' }
  ].filter(signal => signal.value)

  return (
    <div className={`bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-4 rounded-neo-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-neo font-black text-neo-text">MARKET SENTIMENT</h3>
        <button
          onClick={loadSentiment}
          className="p-1 text-neo-text/60 hover:text-neo-text transition-colors"
          title="Refresh data"
        >
          🔄
        </button>
      </div>

      {/* Main Sentiment & Key Metrics - Compact Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Overall Sentiment */}
        <div className="text-center p-3 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
          <div className="text-lg mb-1">{getSentimentIcon(sentiment.overallSentiment)}</div>
          <div className={`text-xs font-neo font-bold px-2 py-1 rounded-neo border ${getSentimentColor(sentiment.overallSentiment)}`}>
            {sentiment.overallSentiment.toUpperCase()}
          </div>
          <div className="text-xs font-neo text-neo-text/60 mt-1">
            {Math.round(sentiment.confidence)}%
          </div>
        </div>

        {/* Fear & Greed Index */}
        <div className="text-center p-3 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
          <div className="text-xs font-neo text-neo-text/60 mb-1">Fear & Greed</div>
          <div className={`text-lg font-neo font-black ${getFearGreedColor(sentiment.indicators.fearGreedIndex)}`}>
            {sentiment.indicators.fearGreedIndex.toFixed(0)}
          </div>
          <div className="text-xs font-neo text-neo-text/60">
            {getFearGreedLabel(sentiment.indicators.fearGreedIndex)}
          </div>
        </div>

        {/* BTC Dominance */}
        <div className="text-center p-3 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
          <div className="text-xs font-neo text-neo-text/60 mb-1">BTC Dominance</div>
          <div className="text-lg font-neo font-bold text-neo-text">
            {sentiment.indicators.bitcoinDominance.toFixed(1)}%
          </div>
          <div className="text-xs font-neo text-neo-text/60">
            Altcoin Index: {sentiment.indicators.altcoinSeasonIndex.toFixed(0)}
          </div>
        </div>

        {/* Momentum & Volatility */}
        <div className="text-center p-3 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
          <div className="text-xs font-neo text-neo-text/60 mb-1">Momentum</div>
          <div className={`text-lg font-neo font-bold ${sentiment.indicators.marketMomentum > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {sentiment.indicators.marketMomentum > 0 ? '+' : ''}{sentiment.indicators.marketMomentum.toFixed(1)}
          </div>
          <div className="text-xs font-neo text-neo-text/60">
            Vol: {sentiment.indicators.volatilityIndex.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Active Signals Only - Show only if there are active signals */}
      {activeSignals.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-neo font-bold text-neo-text mb-2">ACTIVE SIGNALS</h4>
          <div className="flex flex-wrap gap-2">
            {activeSignals.map((signal, index) => (
              <div 
                key={index} 
                className={`px-3 py-2 rounded-neo border text-xs font-neo font-bold ${
                  `bg-${signal.color}-100 dark:bg-${signal.color}-900 border-${signal.color}-300 dark:border-${signal.color}-700 text-${signal.color}-700 dark:text-${signal.color}-300`
                }`}
              >
                <span className="mr-1">{signal.icon}</span>
                {signal.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Summary & Recommendations */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-neo font-bold text-neo-text mb-1">SUMMARY</h4>
          <p className="text-xs font-neo text-neo-text/80 leading-relaxed">
            {sentiment.analysis.summary}
          </p>
        </div>

        {showDetails && (
          <div>
            <h4 className="text-xs font-neo font-bold text-neo-text mb-1">RECOMMENDATIONS</h4>
            <div className="space-y-1">
              {sentiment.analysis.recommendations.slice(0, showFullAnalysis ? undefined : 2).map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-neo-primary dark:text-neo-primary-dark text-xs mt-0.5">•</span>
                  <span className="text-xs font-neo text-neo-text/80">{rec}</span>
                </div>
              ))}
              {sentiment.analysis.recommendations.length > 2 && !showFullAnalysis && (
                <Button
                  onClick={() => setShowFullAnalysis(true)}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                >
                  +{sentiment.analysis.recommendations.length - 2} more
                </Button>
              )}
              {showFullAnalysis && (
                <Button
                  onClick={() => setShowFullAnalysis(false)}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                >
                  Show less
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Key Metrics - Compact */}
        {showDetails && (
          <div className="border-t border-neo-border pt-3">
            <h4 className="text-xs font-neo font-bold text-neo-text mb-2">KEY METRICS</h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="font-neo text-neo-text/60">Market Cap</div>
                <div className="font-neo font-bold text-neo-text">${formatNumber(sentiment.analysis.keyMetrics.totalMarketCap)}</div>
              </div>
              <div>
                <div className="font-neo text-neo-text/60">24h Volume</div>
                <div className="font-neo font-bold text-neo-text">${formatNumber(sentiment.analysis.keyMetrics.totalVolume24h)}</div>
              </div>
              <div>
                <div className="font-neo text-neo-text/60">24h Change</div>
                <div className={`font-neo font-bold ${sentiment.analysis.keyMetrics.averagePriceChange24h > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {sentiment.analysis.keyMetrics.averagePriceChange24h > 0 ? '+' : ''}{sentiment.analysis.keyMetrics.averagePriceChange24h.toFixed(2)}%
                </div>
              </div>
            </div>
            
            {/* Top Performers - Compact */}
            {sentiment.analysis.keyMetrics.topPerformers.length > 0 && (
              <div className="mt-2">
                <div className="font-neo text-neo-text/60 text-xs mb-1">Top: {sentiment.analysis.keyMetrics.topPerformers.slice(0, 3).join(', ')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 