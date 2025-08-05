import React, { useState, useEffect } from 'react'
import { MarketSentimentService } from '../services/marketSentiment'
import type { MarketSentiment } from '../services/marketSentiment'

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
      <div className={`bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-neo-text/20 rounded-neo w-1/3 mb-4"></div>
          <div className="h-4 bg-neo-text/20 rounded-neo w-1/2 mb-2"></div>
          <div className="h-4 bg-neo-text/20 rounded-neo w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error || !sentiment) {
    return (
      <div className={`bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg ${className}`}>
        <div className="text-center">
          <p className="font-neo text-neo-text/80 mb-4">{error || 'No sentiment data available'}</p>
          <button
            onClick={loadSentiment}
            className="px-4 py-2 bg-neo-primary dark:bg-neo-primary-dark text-white rounded-neo hover:bg-neo-primary/80 transition-colors font-neo font-bold"
          >
            RETRY
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-neo font-black text-neo-text">MARKET SENTIMENT</h3>
          <p className="text-sm font-neo text-neo-text/80">
            Last updated: {sentiment.timestamp.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={loadSentiment}
          className="p-2 text-neo-text/60 hover:text-neo-text transition-colors"
          title="Refresh data"
        >
          🔄
        </button>
      </div>

      {/* Main Sentiment Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Overall Sentiment */}
        <div className="text-center p-4 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
          <div className="text-2xl mb-2">{getSentimentIcon(sentiment.overallSentiment)}</div>
          <div className={`text-sm font-neo font-bold px-3 py-1 rounded-neo border ${getSentimentColor(sentiment.overallSentiment)}`}>
            {sentiment.overallSentiment.toUpperCase()}
          </div>
          <div className="text-xs font-neo text-neo-text/60 mt-1">
            Confidence: {Math.round(sentiment.confidence)}%
          </div>
        </div>

        {/* Fear & Greed Index */}
        <div className="text-center p-4 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
          <div className="text-lg font-neo font-bold mb-1 text-neo-text">Fear & Greed</div>
          <div className={`text-2xl font-neo font-black ${getFearGreedColor(sentiment.indicators.fearGreedIndex)}`}>
            {sentiment.indicators.fearGreedIndex.toFixed(0)}
          </div>
          <div className="text-xs font-neo text-neo-text/60">
            {getFearGreedLabel(sentiment.indicators.fearGreedIndex)}
          </div>
        </div>

        {/* Altcoin Season */}
        <div className="text-center p-4 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
          <div className="text-lg font-neo font-bold mb-1 text-neo-text">Altcoin Season</div>
          <div className={`text-2xl font-neo font-black ${sentiment.signals.isAltcoinSeason ? 'text-green-600 dark:text-green-400' : 'text-neo-text/60'}`}>
            {sentiment.signals.isAltcoinSeason ? '🌱' : '❄️'}
          </div>
          <div className="text-xs font-neo text-neo-text/60">
            {sentiment.signals.isAltcoinSeason ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Key Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="text-center p-3 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
          <div className="text-xs font-neo text-neo-text/60 mb-1">BTC Dominance</div>
          <div className="text-sm font-neo font-bold text-neo-text">
            {sentiment.indicators.bitcoinDominance.toFixed(1)}%
          </div>
        </div>
        <div className="text-center p-3 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
          <div className="text-xs font-neo text-neo-text/60 mb-1">Altcoin Index</div>
          <div className="text-sm font-neo font-bold text-neo-text">
            {sentiment.indicators.altcoinSeasonIndex.toFixed(0)}
          </div>
        </div>
        <div className="text-center p-3 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
          <div className="text-xs font-neo text-neo-text/60 mb-1">Momentum</div>
          <div className={`text-sm font-neo font-bold ${sentiment.indicators.marketMomentum > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {sentiment.indicators.marketMomentum > 0 ? '+' : ''}{sentiment.indicators.marketMomentum.toFixed(1)}
          </div>
        </div>
        <div className="text-center p-3 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
          <div className="text-xs font-neo text-neo-text/60 mb-1">Volatility</div>
          <div className="text-sm font-neo font-bold text-neo-text">
            {sentiment.indicators.volatilityIndex.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Market Signals */}
      <div className="mb-6">
        <h4 className="text-sm font-neo font-bold text-neo-text mb-3">Market Signals</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'Bull Market', value: sentiment.signals.isBullMarket, color: 'green' },
            { label: 'Bear Market', value: sentiment.signals.isBearMarket, color: 'red' },
            { label: 'Altcoin Season', value: sentiment.signals.isAltcoinSeason, color: 'purple' },
            { label: 'High Risk', value: sentiment.signals.riskLevel === 'high', color: 'orange' }
          ].map((signal, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-neo ${signal.value ? `bg-${signal.color}-500` : 'bg-neo-text/30'}`}></div>
              <span className="text-xs font-neo text-neo-text/60">{signal.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-neo font-bold text-neo-text mb-2">Market Summary</h4>
        <p className="text-sm font-neo text-neo-text/80 leading-relaxed">
          {sentiment.analysis.summary}
        </p>
      </div>

      {/* Recommendations */}
      {showDetails && (
        <div className="mb-4">
          <h4 className="text-sm font-neo font-bold text-neo-text mb-2">Recommendations</h4>
          <div className="space-y-1">
            {sentiment.analysis.recommendations.slice(0, showFullAnalysis ? undefined : 3).map((rec, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-neo-primary dark:text-neo-primary-dark text-xs mt-1">•</span>
                <span className="text-xs font-neo text-neo-text/80">{rec}</span>
              </div>
            ))}
            {sentiment.analysis.recommendations.length > 3 && !showFullAnalysis && (
              <button
                onClick={() => setShowFullAnalysis(true)}
                className="text-xs font-neo text-neo-primary dark:text-neo-primary-dark hover:text-neo-primary/80"
              >
                Show {sentiment.analysis.recommendations.length - 3} more...
              </button>
            )}
            {showFullAnalysis && (
              <button
                onClick={() => setShowFullAnalysis(false)}
                className="text-xs font-neo text-neo-primary dark:text-neo-primary-dark hover:text-neo-primary/80"
              >
                Show less
              </button>
            )}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {showDetails && (
        <div className="border-t border-neo-border pt-4">
          <h4 className="text-sm font-neo font-bold text-neo-text mb-3">Key Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <div className="font-neo text-neo-text/60">Total Market Cap</div>
              <div className="font-neo font-bold text-neo-text">${formatNumber(sentiment.analysis.keyMetrics.totalMarketCap)}</div>
            </div>
            <div>
              <div className="font-neo text-neo-text/60">24h Volume</div>
              <div className="font-neo font-bold text-neo-text">${formatNumber(sentiment.analysis.keyMetrics.totalVolume24h)}</div>
            </div>
            <div>
              <div className="font-neo text-neo-text/60">Avg 24h Change</div>
              <div className={`font-neo font-bold ${sentiment.analysis.keyMetrics.averagePriceChange24h > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {sentiment.analysis.keyMetrics.averagePriceChange24h > 0 ? '+' : ''}{sentiment.analysis.keyMetrics.averagePriceChange24h.toFixed(2)}%
              </div>
            </div>
          </div>
          
          {/* Top Performers */}
          <div className="mt-3">
            <div className="font-neo text-neo-text/60 text-xs mb-1">Top Performers</div>
            <div className="flex flex-wrap gap-1">
              {sentiment.analysis.keyMetrics.topPerformers.map((symbol, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-neo font-neo">
                  {symbol}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 