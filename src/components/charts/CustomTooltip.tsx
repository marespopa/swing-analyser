import React from 'react'

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

  // Find the price entry for highlighting
  const priceEntry = payload.find((entry: any) => entry.dataKey === 'price')
  const currentPrice = priceEntry?.value
  const raw = payload[0]?.payload

  const formatCurrency = (n: number) => `$${n.toFixed(4)}`
  const formatCompact = (n: number) => {
    if (n >= 1e12) return `$${(n/1e12).toFixed(2)}T`
    if (n >= 1e9) return `$${(n/1e9).toFixed(2)}B`
    if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`
    if (n >= 1e3) return `$${(n/1e3).toFixed(2)}K`
    return `$${n.toFixed(2)}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl backdrop-blur-sm min-w-[200px]">
      <div className="mb-2">
        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{label}</p>
        {typeof currentPrice === 'number' && (
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(currentPrice)}
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {payload
          .filter((entry: any) => 
            entry.dataKey !== 'price' && 
            entry.dataKey !== 'sma20' && 
            entry.dataKey !== 'sma50' && 
            entry.dataKey !== 'bbUpper' && 
            entry.dataKey !== 'bbLower' && 
            entry.dataKey !== 'bbMiddle'
          )
          .map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {entry.name}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {typeof entry.value === 'number' ? (entry.dataKey === 'volume' ? formatCompact(entry.value) : formatCurrency(entry.value)) : 'N/A'}
            </span>
          </div>
        ))}
      </div>
      {typeof raw?.volume === 'number' && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-500 rounded-sm mr-2 transform rotate-45"></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Vol 24h</span>
            </div>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">{formatCompact(raw.volume)}</span>
          </div>
        </div>
      )}
      
      {raw?.entryPoint && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-2">
            <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
              📈 Entry Signal
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
              {raw.entryPoint.reason}
            </p>
            <div className="flex items-center mt-1">
              <span className="text-xs text-blue-600 dark:text-blue-400">
                Confidence: 
              </span>
              <span className={`ml-1 text-xs font-semibold ${
                raw.entryPoint.confidence === 'high' ? 'text-green-600 dark:text-green-400' :
                raw.entryPoint.confidence === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {raw.entryPoint.confidence.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(CustomTooltip)
