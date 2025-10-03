
import { FaInfoCircle } from 'react-icons/fa'

interface TradingRecommendation {
  action: string
  signalColor: 'green' | 'amber' | 'red'
  trend: string
  strength: string
  priceChange: string
}

interface PricePosition {
  position: string
  percentage: string
  color: 'green' | 'red' | 'yellow'
}

interface AnalysisMetricsProps {
  tradingRecommendation: TradingRecommendation | null
  pricePosition: PricePosition | null
}

const AnalysisMetrics = ({
  tradingRecommendation,
  pricePosition
}: AnalysisMetricsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
      {/* Recommendation */}
      <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md group relative">
        <div className={`text-lg sm:text-xl font-bold mb-1 ${tradingRecommendation?.signalColor === 'green'
          ? 'text-green-600 dark:text-green-400'
          : tradingRecommendation?.signalColor === 'amber'
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-red-600 dark:text-red-400'
          }`}>
          {tradingRecommendation?.action || 'WAIT'}
        </div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center justify-center">
          Recommendation
          <FaInfoCircle className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          Trading recommendation based on technical analysis
        </div>
      </div>

      {/* Price Position */}
      <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md group relative">
        <div className={`text-lg sm:text-xl font-bold mb-1 ${pricePosition?.color === 'green'
          ? 'text-green-600 dark:text-green-400'
          : pricePosition?.color === 'red'
            ? 'text-red-600 dark:text-red-400'
            : 'text-yellow-600 dark:text-yellow-400'
          }`}>
          {pricePosition?.percentage ? `${parseFloat(pricePosition.percentage).toFixed(1)}%` : 'N/A'}
        </div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center justify-center">
          {pricePosition?.position === 'Above Upper Band' ? 'Overbought'
            : pricePosition?.position === 'Below Lower Band' ? 'Oversold'
              : pricePosition?.position === 'Within Bands' ? 'Normal Range'
                : 'Price Position'}
          <FaInfoCircle className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {pricePosition?.position === 'Above Upper Band' ? 'Price is above normal range - potential selling opportunity'
            : pricePosition?.position === 'Below Lower Band' ? 'Price is below normal range - potential buying opportunity'
              : pricePosition?.position === 'Within Bands' ? 'Price is within normal trading range'
                : 'Price position relative to Bollinger Bands'}
        </div>
      </div>

      {/* Trend Strength */}
      <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md group relative">
        <div className={`text-lg sm:text-xl font-bold mb-1 ${tradingRecommendation?.strength === 'Strong'
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400'
          }`}>
          {tradingRecommendation?.trend || 'N/A'}
        </div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center justify-center">
          {tradingRecommendation?.strength || 'Trend'}
          <FaInfoCircle className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          Overall market direction and momentum strength based on technical indicators
        </div>
      </div>
    </div>
  )
}

export default AnalysisMetrics
