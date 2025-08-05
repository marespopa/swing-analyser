import React, { useState } from 'react'
import type { Portfolio } from '../../types'
import type { StopLossAnalysis } from '../../services/stopLoss'
import { formatCurrency, formatPercentage } from './utils'
import Button from '../../components/ui/Button'
import EditHoldingsModal from './EditHoldingsModal'

interface PortfolioHoldingsProps {
  portfolio: Portfolio
  stopLossAnalysis: StopLossAnalysis | null
  onPortfolioUpdate: (updatedPortfolio: Portfolio) => void
}

const PortfolioHoldings: React.FC<PortfolioHoldingsProps> = ({
  portfolio,
  stopLossAnalysis,
  onPortfolioUpdate
}) => {
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-neo font-black text-neo-text">
          YOUR HOLDINGS
        </h2>
        <Button
          onClick={() => setShowEditModal(true)}
          variant="secondary"
          size="sm"
        >
          Edit Holdings
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolio.assets.map((asset) => {
          const stopLossRec = stopLossAnalysis?.recommendations.find(rec => rec.asset.id === asset.id)
          return (
            <div
              key={asset.id}
              className="p-4 border-neo border-neo-border rounded-neo-lg bg-neo-surface/50 dark:bg-neo-surface-dark/50"
            >
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={asset.image}
                  alt={asset.name}
                  className="w-10 h-10 rounded-neo"
                />
                <div>
                  <h3 className="font-neo font-bold text-neo-text">
                    {asset.symbol}
                  </h3>
                  <p className="text-sm font-neo text-neo-text/60">
                    {asset.name}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-neo text-neo-text/60">Current Price</span>
                  <span className="font-neo font-bold text-neo-text">
                    {formatCurrency(asset.current_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-neo text-neo-text/60">Holding Amount</span>
                  <span className="font-neo font-bold text-neo-text">
                    {formatCurrency(asset.value)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-neo text-neo-text/60">Quantity</span>
                  <span className="font-neo font-bold text-neo-text">
                    {asset.quantity.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-neo text-neo-text/60">Allocation</span>
                  <span className="font-neo font-bold text-neo-text">
                    {asset.allocation.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-neo text-neo-text/60">24h Change</span>
                  <span className={`font-neo font-bold ${
                    asset.price_change_percentage_24h >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatPercentage(asset.price_change_percentage_24h)}
                  </span>
                </div>
                
                {/* Stop Loss Recommendation */}
                {stopLossRec && (
                  <div className="mt-3 pt-3 border-t border-neo-border">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neo-text/60">Stop Loss:</span>
                        <span className="font-neo font-bold text-red-600 dark:text-red-400">
                          ${stopLossRec.recommendedStopLoss.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neo-text/60">Target:</span>
                        <span className="font-neo font-bold text-green-600 dark:text-green-400">
                          ${(asset.current_price * 1.1).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Holdings Modal */}
      <EditHoldingsModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={onPortfolioUpdate}
        portfolio={portfolio}
      />
    </div>
  )
}

export default PortfolioHoldings 