import React, { useState, useEffect, useCallback } from 'react'
import type { DynamicAllocation } from '../services/dynamicAllocation'
import type { MarketSentiment } from '../services/marketSentiment'
import type { CryptoAsset, RiskProfile } from '../types'

interface DynamicAllocationWidgetProps {
  assets: CryptoAsset[]
  riskProfile: RiskProfile
  sentiment: MarketSentiment | null
}

export const DynamicAllocationWidget: React.FC<DynamicAllocationWidgetProps> = ({
  assets,
  riskProfile,
  sentiment
}) => {
  const [dynamicAllocation, setDynamicAllocation] = useState<DynamicAllocation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const calculateDynamicAllocation = useCallback(async () => {
    if (!sentiment) return
    
    setIsLoading(true)
    try {
      const { DynamicAllocationService } = await import('../services/dynamicAllocation')
      const allocation = DynamicAllocationService.calculateDynamicAllocation(
        assets,
        riskProfile,
        sentiment
      )
      setDynamicAllocation(allocation)
    } catch (error) {
      console.error('Failed to calculate dynamic allocation:', error)
    } finally {
      setIsLoading(false)
    }
  }, [sentiment, assets, riskProfile])

  useEffect(() => {
    if (sentiment && assets.length > 0) {
      calculateDynamicAllocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculateDynamicAllocation])

  if (!sentiment || !dynamicAllocation) {
    return null
  }

  const hasAdjustments = dynamicAllocation.adjustments.changes.length > 0

  return (
    <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border p-6 shadow-neo rounded-neo">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-neo font-black text-neo-text">
            Dynamic Allocation
          </h3>
          <p className="text-sm font-neo text-neo-text/60">
            Market sentiment adjustments applied
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-neo text-xs font-neo font-bold border ${
            dynamicAllocation.riskLevel === 'high' 
              ? 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
              : dynamicAllocation.riskLevel === 'medium'
              ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
              : 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
          }`}>
            {dynamicAllocation.riskLevel.toUpperCase()} RISK
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-neo-text/60 hover:text-neo-text transition-colors"
          >
            {showDetails ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-neo-text/80">
            Adjustments: <span className="font-bold">{dynamicAllocation.adjustments.changes.length}</span>
          </span>
          <span className="text-neo-text/80">
            Market: <span className="font-bold">{sentiment.overallSentiment}</span>
          </span>
          <span className="text-neo-text/80">
            Confidence: <span className="font-bold">{Math.round(sentiment.confidence)}%</span>
          </span>
        </div>
      </div>

      {/* Adjustments */}
      {hasAdjustments && (
        <div className="mb-4">
          <h4 className="text-sm font-neo font-bold text-neo-text mb-2">
            Allocation Adjustments
          </h4>
          <div className="space-y-2">
            {dynamicAllocation.adjustments.changes.map((change, index) => (
              <div key={index} className="bg-neo-surface/50 dark:bg-neo-surface-dark/50 p-3 rounded-neo border border-neo-text/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-neo font-bold text-neo-text">
                    {change.asset}
                  </span>
                  <span className="text-sm font-neo text-neo-text/80">
                    {change.from.toFixed(1)}% → {change.to.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs font-neo text-neo-text/60">
                  {change.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {dynamicAllocation.recommendations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-neo font-bold text-neo-text mb-2">
            Trading Recommendations
          </h4>
          <div className="space-y-2">
            {dynamicAllocation.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 dark:text-blue-400 text-sm">•</span>
                <p className="text-sm font-neo text-neo-text/80">
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed View */}
      {showDetails && (
        <div className="border-t border-neo-text/20 pt-4 mt-4">
          <h4 className="text-sm font-neo font-bold text-neo-text mb-3">
            Allocation Comparison
          </h4>
          <div className="space-y-2">
            {Object.keys(dynamicAllocation.baseAllocation).map(assetId => {
              const asset = assets.find(a => a.id === assetId)
              const baseAlloc = dynamicAllocation.baseAllocation[assetId]
              const adjustedAlloc = dynamicAllocation.adjustedAllocation[assetId]
              const change = adjustedAlloc - baseAlloc
              
              return (
                <div key={assetId} className="flex items-center justify-between p-2 bg-neo-surface/30 dark:bg-neo-surface-dark/30 rounded-neo">
                  <span className="text-sm font-neo text-neo-text">
                    {asset?.symbol || assetId}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-neo text-neo-text/60">
                      Base: {baseAlloc.toFixed(1)}%
                    </span>
                    <span className="text-xs font-neo text-neo-text/60">
                      Adjusted: {adjustedAlloc.toFixed(1)}%
                    </span>
                    {Math.abs(change) > 0.1 && (
                      <span className={`text-xs font-neo font-bold ${
                        change > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neo-primary"></div>
          <span className="ml-2 text-sm font-neo text-neo-text/60">
            Calculating adjustments...
          </span>
        </div>
      )}
    </div>
  )
} 