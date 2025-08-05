import React, { useState } from 'react'
import { PortfolioEducationService } from '../services/portfolioEducation'
import type { PortfolioStrategy } from '../services/portfolioEducation'

interface PortfolioEducationProps {
  selectedRiskProfile?: 'conservative' | 'balanced' | 'aggressive'
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
      case 'conservative': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'balanced': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'aggressive': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Crypto Portfolio Strategies
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Learn about different portfolio allocation strategies based on your risk tolerance and investment goals.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'strategies', label: 'Strategies' },
            { id: 'principles', label: 'Principles' },
            { id: 'tips', label: 'Tips' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'strategies' | 'principles' | 'tips')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'strategies' && (
        <div className="grid md:grid-cols-3 gap-6">
          {education.strategies.map((strategy) => (
            <div
              key={strategy.name}
              className={`bg-white rounded-xl border-2 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                selectedRiskProfile === strategy.name.toLowerCase()
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleStrategyClick(strategy)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{strategy.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskProfileColor(strategy.name)}`}>
                  {strategy.name}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4">{strategy.description}</p>

              {/* Allocations */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Target Allocations</h4>
                <div className="space-y-1">
                  {strategy.allocations.bitcoin > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bitcoin</span>
                      <span className="font-medium">{strategy.allocations.bitcoin}%</span>
                    </div>
                  )}
                  {strategy.allocations.ethereum > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ethereum</span>
                      <span className="font-medium">{strategy.allocations.ethereum}%</span>
                    </div>
                  )}
                  {strategy.allocations.altcoins > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Altcoins</span>
                      <span className="font-medium">{strategy.allocations.altcoins}%</span>
                    </div>
                  )}
                  {strategy.allocations.stablecoins > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stablecoins</span>
                      <span className="font-medium">{strategy.allocations.stablecoins}%</span>
                    </div>
                  )}
                  {strategy.allocations.speculative > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Speculative</span>
                      <span className="font-medium">{strategy.allocations.speculative}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Characteristics */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Key Characteristics</h4>
                <ul className="space-y-1">
                  {strategy.characteristics.slice(0, 3).map((char, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suitable For */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Suitable For</h4>
                <ul className="space-y-1">
                  {strategy.suitableFor.slice(0, 2).map((item, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks and Benefits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-red-700 mb-2">Risks</h4>
                  <ul className="space-y-1">
                    {strategy.risks.slice(0, 2).map((risk, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <span className="text-red-500 mr-2">⚠</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-2">Benefits</h4>
                  <ul className="space-y-1">
                    {strategy.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Principles</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {education.principles.map((principle, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Investment Tips</h3>
          <div className="space-y-3">
            {education.tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 