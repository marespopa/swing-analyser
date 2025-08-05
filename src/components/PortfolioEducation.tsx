import React, { useState } from 'react'
import { PortfolioEducationService } from '../services/portfolioEducation'
import type { PortfolioStrategy } from '../services/portfolioEducation'

interface PortfolioEducationProps {
  selectedRiskProfile?: 'conservative' | 'balanced' | 'aggressive' | 'degen'
  onStrategySelect?: (strategy: PortfolioStrategy) => void
}

export const PortfolioEducation: React.FC<PortfolioEducationProps> = ({
  selectedRiskProfile,
  onStrategySelect
}) => {
  const [activeTab, setActiveTab] = useState<'strategies' | 'principles' | 'tips'>('strategies')
  const education = PortfolioEducationService.getPortfolioStrategies()

  const handleStrategyClick = (strategy: PortfolioStrategy) => {
    onStrategySelect?.(strategy)
  }

  const getRiskProfileColor = (profile: string) => {
    switch (profile.toLowerCase()) {
      case 'conservative': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
      case 'balanced': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
      case 'aggressive': return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700'
      default: return 'bg-neo-text/10 text-neo-text/80 border-neo-text/20'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-neo font-black text-neo-text mb-2">
          CRYPTO PORTFOLIO STRATEGIES
        </h2>
        <p className="text-sm font-neo text-neo-text/80 max-w-2xl mx-auto">
          Learn about different portfolio allocation strategies based on your risk tolerance and investment goals.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-4">
        <div className="flex space-x-1 bg-neo-surface/50 dark:bg-neo-surface-dark/50 p-1 rounded-neo border-neo border-neo-border">
          {[
            { id: 'strategies', label: 'STRATEGIES' },
            { id: 'principles', label: 'PRINCIPLES' },
            { id: 'tips', label: 'TIPS' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'strategies' | 'principles' | 'tips')}
              className={`px-4 py-2 rounded-neo text-sm font-neo font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-neo-primary dark:bg-neo-primary-dark text-white shadow-neo'
                  : 'text-neo-text/60 hover:text-neo-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'strategies' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {education.strategies.map((strategy) => (
            <div
              key={strategy.name}
              className={`bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border p-4 shadow-neo hover:shadow-neo-lg transition-all cursor-pointer ${
                selectedRiskProfile === strategy.name.toLowerCase()
                  ? 'border-neo-primary dark:border-neo-primary-dark ring-2 ring-neo-primary/20'
                  : 'hover:border-neo-text/30'
              }`}
              onClick={() => handleStrategyClick(strategy)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-neo font-black text-neo-text">{strategy.name}</h3>
                <span className={`px-2 py-1 rounded-neo text-xs font-neo font-bold border ${getRiskProfileColor(strategy.name)}`}>
                  {strategy.name}
                </span>
              </div>

              {/* Description */}
              <p className="font-neo text-neo-text/80 text-xs mb-3 leading-tight">{strategy.description}</p>

              {/* Allocations */}
              <div className="mb-3">
                <h4 className="text-xs font-neo font-bold text-neo-text mb-1">Allocations</h4>
                <div className="space-y-0.5">
                  {strategy.allocations.bitcoin > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="font-neo text-neo-text/60">BTC</span>
                      <span className="font-neo font-bold text-neo-text">{strategy.allocations.bitcoin}%</span>
                    </div>
                  )}
                  {strategy.allocations.ethereum > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="font-neo text-neo-text/60">ETH</span>
                      <span className="font-neo font-bold text-neo-text">{strategy.allocations.ethereum}%</span>
                    </div>
                  )}
                  {strategy.allocations.altcoins > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="font-neo text-neo-text/60">Altcoins</span>
                      <span className="font-neo font-bold text-neo-text">{strategy.allocations.altcoins}%</span>
                    </div>
                  )}
                  {strategy.allocations.stablecoins > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="font-neo text-neo-text/60">Stable</span>
                      <span className="font-neo font-bold text-neo-text">{strategy.allocations.stablecoins}%</span>
                    </div>
                  )}
                  {strategy.allocations.speculative > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="font-neo text-neo-text/60">Spec</span>
                      <span className="font-neo font-bold text-neo-text">{strategy.allocations.speculative}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Characteristics */}
              <div className="mb-3">
                <h4 className="text-xs font-neo font-bold text-neo-text mb-1">Key Points</h4>
                <ul className="space-y-0.5">
                  {strategy.characteristics.slice(0, 2).map((char, index) => (
                    <li key={index} className="text-xs font-neo text-neo-text/80 flex items-start">
                      <span className="text-neo-primary dark:text-neo-primary-dark mr-1">•</span>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks and Benefits */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="text-xs font-neo font-bold text-red-600 dark:text-red-400 mb-1">Risks</h4>
                  <ul className="space-y-0.5">
                    {strategy.risks.slice(0, 1).map((risk, index) => (
                      <li key={index} className="text-xs font-neo text-neo-text/80 flex items-start">
                        <span className="text-red-600 dark:text-red-400 mr-1">⚠</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-neo font-bold text-green-600 dark:text-green-400 mb-1">Benefits</h4>
                  <ul className="space-y-0.5">
                    {strategy.benefits.slice(0, 1).map((benefit, index) => (
                      <li key={index} className="text-xs font-neo text-neo-text/80 flex items-start">
                        <span className="text-green-600 dark:text-green-400 mr-1">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'principles' && (
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-4 rounded-neo-lg">
          <h3 className="text-lg font-neo font-black text-neo-text mb-3">PORTFOLIO PRINCIPLES</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {education.principles.map((principle, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
                <div className="flex-shrink-0 w-5 h-5 bg-neo-primary dark:bg-neo-primary-dark text-white rounded-neo flex items-center justify-center text-xs font-neo font-bold">
                  {index + 1}
                </div>
                <p className="text-xs font-neo text-neo-text/80">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-4 rounded-neo-lg">
          <h3 className="text-lg font-neo font-black text-neo-text mb-3">INVESTMENT TIPS</h3>
          <div className="space-y-2">
            {education.tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
                <div className="flex-shrink-0 w-5 h-5 bg-green-600 dark:bg-green-400 text-white rounded-neo flex items-center justify-center text-xs font-neo font-bold">
                  {index + 1}
                </div>
                <p className="text-xs font-neo text-neo-text/80">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 