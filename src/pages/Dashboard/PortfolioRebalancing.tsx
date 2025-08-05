import React, { useState } from 'react'
import type { Portfolio, RiskProfile, PortfolioAsset } from '../../types'
import type { RebalancingRecommendation } from '../../services/rebalancing'
import { RebalancingService } from '../../services/rebalancing'
import Button from '../../components/ui/Button'

interface PortfolioRebalancingProps {
  portfolio: Portfolio
  rebalancingRecommendation: RebalancingRecommendation | null
  onPortfolioUpdate?: (updatedPortfolio: Portfolio) => void
}

const PortfolioRebalancing: React.FC<PortfolioRebalancingProps> = ({
  portfolio,
  rebalancingRecommendation,
  onPortfolioUpdate
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showRiskConversion, setShowRiskConversion] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile | null>(null)
  


  // Calculate new rebalancing split for selected profile
  const getNewRebalancingSplit = (targetProfile: RiskProfile) => {
    const currentAssets = portfolio.assets.filter(asset => asset.id !== 'usd-coin')
    const hasStablecoin = portfolio.assets.some(asset => asset.id === 'usd-coin')
    
    // Get target allocations for the new profile
    const targetAllocations = currentAssets.map(asset => {
      const baseAllocation = getBaseAllocation(asset, targetProfile)
      return {
        asset,
        targetAllocation: baseAllocation
      }
    })
    
    // Add stablecoin if needed
    if (hasStablecoin) {
      const stablecoinAllocation = getStablecoinAllocation(targetProfile)
      targetAllocations.push({
        asset: portfolio.assets.find(asset => asset.id === 'usd-coin')!,
        targetAllocation: stablecoinAllocation
      })
    }
    
    // Normalize allocations to 100%
    const totalTarget = targetAllocations.reduce((sum, item) => sum + item.targetAllocation, 0)
    const normalizedAllocations = targetAllocations.map(item => ({
      ...item,
      targetAllocation: (item.targetAllocation / totalTarget) * 100
    }))
    
    return normalizedAllocations
  }
  
  // Helper function to get base allocation (copied from RebalancingService)
  const getBaseAllocation = (asset: PortfolioAsset, riskProfile: RiskProfile): number => {
    if (asset.id === 'usd-coin') {
      switch (riskProfile) {
        case 'conservative': return 20
        case 'balanced': return 15
        case 'aggressive': return 10
        case 'degen': return 5
      }
    }
    
    const marketCapRank = getMarketCapRank(asset.market_cap)
    
    switch (riskProfile) {
      case 'conservative':
        if (marketCapRank <= 5) return 20
        if (marketCapRank <= 10) return 16
        if (marketCapRank <= 20) return 12
        return 8
      case 'balanced':
        if (marketCapRank <= 5) return 17
        if (marketCapRank <= 10) return 13
        if (marketCapRank <= 20) return 10
        return 7
      case 'aggressive':
        if (marketCapRank <= 5) return 16
        if (marketCapRank <= 10) return 13
        if (marketCapRank <= 20) return 10
        return 8
      case 'degen':
        if (marketCapRank <= 5) return 18
        if (marketCapRank <= 10) return 15
        if (marketCapRank <= 20) return 12
        return 10
    }
  }
  
  // Helper function to get stablecoin allocation
  const getStablecoinAllocation = (riskProfile: RiskProfile): number => {
    switch (riskProfile) {
      case 'conservative': return 20
      case 'balanced': return 15
      case 'aggressive': return 10
      case 'degen': return 5
    }
  }
  
  // Helper function to estimate market cap rank
  const getMarketCapRank = (marketCap: number): number => {
    if (marketCap > 100000000000) return 1
    if (marketCap > 50000000000) return 2
    if (marketCap > 20000000000) return 3
    if (marketCap > 10000000000) return 4
    if (marketCap > 5000000000) return 5
    if (marketCap > 2000000000) return 10
    if (marketCap > 1000000000) return 15
    if (marketCap > 500000000) return 20
    return 25
  }

  // Only show the section if there's a rebalancing recommendation
  if (!rebalancingRecommendation) {
    return null
  }

  return (
    <>
      {/* Compact View */}
      {!isExpanded && (
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-6 rounded-neo-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-neo font-black text-neo-text">
                PORTFOLIO REBALANCING
              </h2>
              <div className={`px-3 py-1 rounded-neo text-sm font-neo font-bold ${
                rebalancingRecommendation.urgency === 'high' 
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : rebalancingRecommendation.urgency === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }`}>
                {rebalancingRecommendation.urgency.toUpperCase()} PRIORITY
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowRiskConversion(true)}
                variant="primary"
                size="sm"
              >
                Convert Risk Profile
              </Button>
              <Button
                onClick={() => setIsExpanded(true)}
                variant="secondary"
                size="sm"
              >
                View Details
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-neo text-neo-text/60">Action Required</p>
                <p className={`font-neo font-bold ${
                  rebalancingRecommendation.type === 'rebalance' 
                    ? 'text-red-600 dark:text-red-400'
                    : rebalancingRecommendation.type === 'partial-rebalance'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {rebalancingRecommendation.type.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm font-neo text-neo-text/60">Portfolio Drift</p>
                <p className={`font-neo font-bold ${
                  rebalancingRecommendation.driftPercentage > 15 
                    ? 'text-red-600 dark:text-red-400'
                    : rebalancingRecommendation.driftPercentage > 10
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {rebalancingRecommendation.driftPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="text-sm font-neo text-neo-text/60 mt-2">
              {rebalancingRecommendation.reason}
            </p>
          </div>
        </div>
      )}

            {/* Expanded View */}
      {isExpanded && (
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-neo font-black text-neo-text">
                PORTFOLIO REBALANCING
              </h2>
              <div className={`px-3 py-1 rounded-neo text-sm font-neo font-bold ${
                rebalancingRecommendation.urgency === 'high' 
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : rebalancingRecommendation.urgency === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }`}>
                {rebalancingRecommendation.urgency.toUpperCase()} PRIORITY
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowRiskConversion(true)}
                variant="primary"
                size="sm"
              >
                Convert Risk Profile
              </Button>
              <Button
                onClick={() => setIsExpanded(false)}
                variant="secondary"
                size="sm"
              >
                Hide Details
              </Button>
            </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rebalancing Summary */}
        <div>
          <h3 className="text-xl font-neo font-black text-neo-text mb-4">
            RECOMMENDATION
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-neo text-neo-text/60">Action</p>
              <p className={`font-neo font-bold text-lg ${
                rebalancingRecommendation.type === 'rebalance' 
                  ? 'text-red-600 dark:text-red-400'
                  : rebalancingRecommendation.type === 'partial-rebalance'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {rebalancingRecommendation.type.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm font-neo text-neo-text/60">Portfolio Drift</p>
              <p className={`font-neo font-bold text-lg ${
                rebalancingRecommendation.driftPercentage > 15 
                  ? 'text-red-600 dark:text-red-400'
                  : rebalancingRecommendation.driftPercentage > 10
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {rebalancingRecommendation.driftPercentage.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm font-neo text-neo-text/60">Next Review</p>
              <p className="font-neo font-bold text-neo-text">
                {rebalancingRecommendation.nextReviewDate.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-neo text-neo-text/60">Reason</p>
              <p className="font-neo text-neo-text">
                {rebalancingRecommendation.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Actions */}
        <div>
          <h3 className="text-xl font-neo font-black text-neo-text mb-4">
            SUGGESTED ACTIONS
          </h3>
          <ul className="space-y-2">
            {rebalancingRecommendation.suggestedActions.map((action, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-neo-primary dark:text-neo-primary-dark mt-1">•</span>
                <span className="font-neo text-neo-text/80">{action}</span>
              </li>
            ))}
          </ul>

          {/* Strategy Recommendations */}
          <div className="mt-6 p-4 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
            <h4 className="font-neo font-bold text-neo-text mb-2">Strategy Tips</h4>
            <div className="space-y-2 text-sm font-neo text-neo-text/80">
              <p>{RebalancingService.getFrequencyRecommendation(portfolio.riskProfile)}</p>
              <p>{RebalancingService.getHoldingPeriodRecommendation(portfolio.riskProfile)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Profile Conversion Modal */}
      {showRiskConversion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRiskConversion(false)} />
          <div className="relative bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-xl rounded-neo-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-neo-border">
              <h3 className="text-xl font-neo font-black text-neo-text">
                Convert Risk Profile
              </h3>
              <button onClick={() => setShowRiskConversion(false)} className="text-neo-text/60 hover:text-neo-text transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm font-neo text-neo-text/60 mb-4">
                Current profile: <span className="font-bold text-neo-text">{portfolio.riskProfile.toUpperCase()}</span>
              </p>
              
              <div className="space-y-3">
                {(['conservative', 'balanced', 'aggressive', 'degen'] as RiskProfile[]).map((profile) => {
                  if (profile === portfolio.riskProfile) return null
                  
                  const getConversionDescription = (from: RiskProfile, to: RiskProfile): string => {
                    if (from === 'degen' && to === 'aggressive') return 'Reduce risk while maintaining growth focus'
                    if (from === 'degen' && to === 'balanced') return 'Significantly reduce risk and volatility'
                    if (from === 'degen' && to === 'conservative') return 'Major risk reduction for capital preservation'
                    if (from === 'aggressive' && to === 'degen') return 'Increase risk for maximum potential returns'
                    if (from === 'aggressive' && to === 'balanced') return 'Moderate risk reduction for stability'
                    if (from === 'aggressive' && to === 'conservative') return 'Significant risk reduction'
                    if (from === 'balanced' && to === 'degen') return 'Major risk increase for aggressive growth'
                    if (from === 'balanced' && to === 'aggressive') return 'Increase risk for higher growth potential'
                    if (from === 'balanced' && to === 'conservative') return 'Reduce risk for capital preservation'
                    if (from === 'conservative' && to === 'degen') return 'Maximum risk increase for aggressive growth'
                    if (from === 'conservative' && to === 'aggressive') return 'Significant risk increase'
                    if (from === 'conservative' && to === 'balanced') return 'Moderate risk increase'
                    return 'Convert risk profile'
                  }
                  
                  const getConversionActions = (_from: RiskProfile, to: RiskProfile): string[] => {
                    const actions: string[] = []
                    
                    if (to === 'conservative') {
                      actions.push('Increase stablecoin allocation to 15-20%')
                      actions.push('Focus on top 10 market cap coins')
                      actions.push('Reduce position sizes')
                    } else if (to === 'balanced') {
                      actions.push('Add 10-15% stablecoin position')
                      actions.push('Diversify across 5-8 assets')
                      actions.push('Moderate position sizing')
                    } else if (to === 'aggressive') {
                      actions.push('Reduce stablecoin to 5-10%')
                      actions.push('Focus on momentum plays')
                      actions.push('Increase position sizes')
                    } else if (to === 'degen') {
                      actions.push('Minimize stablecoin to 0-5%')
                      actions.push('Focus on high-momentum assets')
                      actions.push('Maximum position sizes')
                    }
                    
                    return actions
                  }
                  
                  return (
                    <div key={profile} className="p-4 border border-neo-border rounded-neo bg-neo-surface/50 dark:bg-neo-surface-dark/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-neo font-bold text-neo-text capitalize">
                          {profile}
                        </h4>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => setSelectedProfile(selectedProfile === profile ? null : profile)}
                            variant="secondary"
                            size="sm"
                          >
                            {selectedProfile === profile ? 'Hide Preview' : 'Preview'}
                          </Button>
                          <Button
                            onClick={() => {
                              if (onPortfolioUpdate) {
                                const updatedPortfolio = {
                                  ...portfolio,
                                  riskProfile: profile
                                }
                                onPortfolioUpdate(updatedPortfolio)
                              }
                              setShowRiskConversion(false)
                              setSelectedProfile(null)
                            }}
                            variant="primary"
                            size="sm"
                          >
                            Convert
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm font-neo text-neo-text/60 mb-2">
                        {getConversionDescription(portfolio.riskProfile, profile)}
                      </p>
                      <ul className="text-xs space-y-1">
                        {getConversionActions(portfolio.riskProfile, profile).map((action, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-neo-primary dark:text-neo-primary-dark mt-1">•</span>
                            <span className="text-neo-text/80">{action}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Rebalancing Preview */}
                      {selectedProfile === profile && (
                        <div className="mt-4 pt-4 border-t border-neo-border">
                          <h5 className="font-neo font-bold text-neo-text mb-3 text-sm">
                            New Portfolio Allocation Preview
                          </h5>
                          <div className="space-y-2">
                            {getNewRebalancingSplit(profile).map((item) => (
                              <div key={item.asset.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={item.asset.image}
                                    alt={item.asset.name}
                                    className="w-4 h-4 rounded-neo"
                                  />
                                  <span className="font-neo text-neo-text/80">
                                    {item.asset.symbol}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <span className="text-neo-text/60">
                                    Current: {portfolio.assets.find(a => a.id === item.asset.id)?.allocation.toFixed(1)}%
                                  </span>
                                  <span className="font-neo font-bold text-neo-text">
                                    → {item.targetAllocation.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )}

      {/* Risk Profile Conversion Modal */}
      {showRiskConversion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRiskConversion(false)} />
          <div className="relative bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-xl rounded-neo-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-neo-border">
              <h3 className="text-xl font-neo font-black text-neo-text">
                Convert Risk Profile
              </h3>
              <button onClick={() => setShowRiskConversion(false)} className="text-neo-text/60 hover:text-neo-text transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm font-neo text-neo-text/60 mb-4">
                Current profile: <span className="font-bold text-neo-text">{portfolio.riskProfile.toUpperCase()}</span>
              </p>
              
              <div className="space-y-3">
                {(['conservative', 'balanced', 'aggressive', 'degen'] as RiskProfile[]).map((profile) => {
                  if (profile === portfolio.riskProfile) return null
                  
                  const getConversionDescription = (from: RiskProfile, to: RiskProfile): string => {
                    if (from === 'degen' && to === 'aggressive') return 'Reduce risk while maintaining growth focus'
                    if (from === 'degen' && to === 'balanced') return 'Significantly reduce risk and volatility'
                    if (from === 'degen' && to === 'conservative') return 'Major risk reduction for capital preservation'
                    if (from === 'aggressive' && to === 'degen') return 'Increase risk for maximum potential returns'
                    if (from === 'aggressive' && to === 'balanced') return 'Moderate risk reduction for stability'
                    if (from === 'aggressive' && to === 'conservative') return 'Significant risk reduction'
                    if (from === 'balanced' && to === 'degen') return 'Major risk increase for aggressive growth'
                    if (from === 'balanced' && to === 'aggressive') return 'Increase risk for higher growth potential'
                    if (from === 'balanced' && to === 'conservative') return 'Reduce risk for capital preservation'
                    if (from === 'conservative' && to === 'degen') return 'Maximum risk increase for aggressive growth'
                    if (from === 'conservative' && to === 'aggressive') return 'Significant risk increase'
                    if (from === 'conservative' && to === 'balanced') return 'Moderate risk increase'
                    return 'Convert risk profile'
                  }
                  
                  const getConversionActions = (_from: RiskProfile, to: RiskProfile): string[] => {
                    const actions: string[] = []
                    
                    if (to === 'conservative') {
                      actions.push('Increase stablecoin allocation to 15-20%')
                      actions.push('Focus on top 10 market cap coins')
                      actions.push('Reduce position sizes')
                    } else if (to === 'balanced') {
                      actions.push('Add 10-15% stablecoin position')
                      actions.push('Diversify across 5-8 assets')
                      actions.push('Moderate position sizing')
                    } else if (to === 'aggressive') {
                      actions.push('Reduce stablecoin to 5-10%')
                      actions.push('Focus on momentum plays')
                      actions.push('Increase position sizes')
                    } else if (to === 'degen') {
                      actions.push('Minimize stablecoin to 0-5%')
                      actions.push('Focus on high-momentum assets')
                      actions.push('Maximum position sizes')
                    }
                    
                    return actions
                  }
                  
                  return (
                    <div key={profile} className="p-4 border border-neo-border rounded-neo bg-neo-surface/50 dark:bg-neo-surface-dark/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-neo font-bold text-neo-text capitalize">
                          {profile}
                        </h4>
                        <Button
                          onClick={() => {
                            if (onPortfolioUpdate) {
                              const updatedPortfolio = {
                                ...portfolio,
                                riskProfile: profile
                              }
                              onPortfolioUpdate(updatedPortfolio)
                            }
                            setShowRiskConversion(false)
                          }}
                          variant="primary"
                          size="sm"
                        >
                          Convert
                        </Button>
                      </div>
                      <p className="text-sm font-neo text-neo-text/60 mb-2">
                        {getConversionDescription(portfolio.riskProfile, profile)}
                      </p>
                      <ul className="text-xs space-y-1">
                        {getConversionActions(portfolio.riskProfile, profile).map((action, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-neo-primary dark:text-neo-primary-dark mt-1">•</span>
                            <span className="text-neo-text/80">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PortfolioRebalancing 