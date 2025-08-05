import React from 'react'
import type { Portfolio, RebalancingRecommendation } from '../../types'
import { RebalancingService } from '../../services/rebalancing'
import { formatCurrency } from './utils'

interface PortfolioRebalancingProps {
  portfolio: Portfolio
  rebalancingRecommendation: RebalancingRecommendation | null
}

const PortfolioRebalancing: React.FC<PortfolioRebalancingProps> = ({
  portfolio,
  rebalancingRecommendation
}) => {

  if (!rebalancingRecommendation) {
    return null
  }

  return (
    <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
      <div className="flex items-center justify-between mb-6">
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

      {/* Assets to Rebalance */}
      <div className="mt-8">
        <h3 className="text-xl font-neo font-black text-neo-text mb-4">
          ASSETS TO REBALANCE
        </h3>
        {rebalancingRecommendation.assetsToRebalance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rebalancingRecommendation.assetsToRebalance.map((item) => (
              <div
                key={item.asset.id}
                className="p-4 border-neo border-neo-border rounded-neo bg-neo-surface/50 dark:bg-neo-surface-dark/50"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={item.asset.image}
                    alt={item.asset.name}
                    className="w-10 h-10 rounded-neo"
                  />
                  <div>
                    <h4 className="font-neo font-bold text-neo-text">
                      {item.asset.symbol}
                    </h4>
                    <p className="text-sm font-neo text-neo-text/60">
                      {item.asset.name}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-neo text-neo-text/60">Current</span>
                    <span className="font-neo font-bold text-neo-text">
                      {item.currentAllocation.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-neo text-neo-text/60">Target</span>
                    <span className="font-neo font-bold text-neo-text">
                      {item.targetAllocation.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-neo text-neo-text/60">Action</span>
                    <span className={`font-neo font-bold ${
                      item.action === 'sell' 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {item.action.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-neo text-neo-text/60">Amount</span>
                    <span className="font-neo font-bold text-neo-text">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-neo-surface/30 dark:bg-neo-surface-dark/30 border-neo border-neo-border rounded-neo">
            <p className="text-lg font-neo text-neo-text/60 mb-2">
              No specific rebalancing actions needed
            </p>
            <p className="font-neo text-neo-text/40">
              Your portfolio allocations are within acceptable ranges
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PortfolioRebalancing 