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

  return (
    <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl backdrop-blur-sm">
      <div className="mb-3">
        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        {currentPrice && (
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${currentPrice.toFixed(4)}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        {payload
          .filter((entry: any) => entry.dataKey !== 'price') // Price is shown above
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
              {entry.value ? `$${entry.value.toFixed(4)}` : 'N/A'}
            </span>
          </div>
        ))}
      </div>
      
      {payload[0]?.payload?.entryPoint && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
            <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
              📈 Entry Signal
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {payload[0].payload.entryPoint.reason}
            </p>
            <div className="flex items-center mt-1">
              <span className="text-xs text-blue-600 dark:text-blue-400">
                Confidence: 
              </span>
              <span className={`ml-1 text-xs font-semibold ${
                payload[0].payload.entryPoint.confidence === 'high' ? 'text-green-600 dark:text-green-400' :
                payload[0].payload.entryPoint.confidence === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {payload[0].payload.entryPoint.confidence.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(CustomTooltip)
