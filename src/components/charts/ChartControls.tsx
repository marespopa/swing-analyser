import React from 'react'
import type { TechnicalAnalysisData, ToggleState } from '../../types'

interface ChartControlsProps {
  data: TechnicalAnalysisData
  toggles: ToggleState
  onToggleChange: (key: keyof ToggleState, value: boolean | string) => void
}

const ChartControls: React.FC<ChartControlsProps> = ({ data, toggles, onToggleChange }) => {
  const controls = [
    {
      key: 'showMovingAverages' as keyof ToggleState,
      label: 'Moving Averages',
      show: true, // Always show this control
      color: 'text-red-500'
    },
    {
      key: 'showBollingerBands' as keyof ToggleState,
      label: 'Bollinger Bands',
      show: !!data.bollingerBands,
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Indicators */}
        <div className="flex items-center space-x-1">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">Indicators:</span>
          <div className="flex flex-wrap gap-2">
            {controls.map(({ key, label, show, color }) => {
              if (!show) return null
              
              return (
                <label key={key} className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={toggles[key] as boolean}
                      onChange={(e) => onToggleChange(key, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-3 h-3 rounded-sm border transition-all duration-200 ${
                      toggles[key] 
                        ? 'bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500' 
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover:border-primary-400'
                    }`}>
                      {toggles[key] && (
                        <svg className="w-2 h-2 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium transition-colors duration-200 ${
                    toggles[key] 
                      ? `${color} dark:${color}` 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}>
                    {label}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartControls
