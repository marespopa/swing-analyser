import React from 'react'
import type { Portfolio } from '../../types'
import { formatCurrency, formatPercentage } from './utils'

interface PortfolioPerformanceProps {
  portfolio: Portfolio
}

const PortfolioPerformance: React.FC<PortfolioPerformanceProps> = ({
  portfolio
}) => {

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Portfolio Summary */}
      <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg">
        <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
          PORTFOLIO PERFORMANCE
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-neo text-neo-text/60">Total Value</p>
              <p className="text-2xl font-neo font-black text-neo-text">
                {formatCurrency(portfolio.totalValue)}
              </p>
            </div>
            <div>
              <p className="text-sm font-neo text-neo-text/60">Total P/L</p>
              <p className={`text-2xl font-neo font-black ${
                portfolio.totalProfitLoss >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(portfolio.totalProfitLoss)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-neo text-neo-text/60">P/L %</p>
              <p className={`text-xl font-neo font-black ${
                portfolio.totalProfitLossPercentage >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatPercentage(portfolio.totalProfitLossPercentage)}
              </p>
            </div>
            <div>
              <p className="text-sm font-neo text-neo-text/60">Assets</p>
              <p className="text-xl font-neo font-black text-neo-text">
                {portfolio.assets.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg">
        <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
          TOP PERFORMERS
        </h2>
        <div className="space-y-4">
          {portfolio.assets
            .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
            .slice(0, 3)
            .map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-4 bg-neo-surface/50 dark:bg-neo-surface-dark/50 rounded-neo">
                <div className="flex items-center space-x-3">
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="w-8 h-8 rounded-neo"
                  />
                  <div>
                    <p className="font-neo font-bold text-neo-text">
                      {asset.symbol}
                    </p>
                    <p className="text-sm font-neo text-neo-text/60">
                      {formatCurrency(asset.value)}
                    </p>
                  </div>
                </div>
                <p className={`font-neo font-bold ${
                  asset.price_change_percentage_24h >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercentage(asset.price_change_percentage_24h)}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default PortfolioPerformance 