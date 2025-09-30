import React from 'react'
import Button from '../ui/Button'
import FavouriteButton from '../FavouriteButton'

interface CoinInfo {
  id: string
  name: string
  symbol: string
  currentPrice?: number
}

interface AnalysisHeaderProps {
  coinInfo: CoinInfo | null
  currentPrice: number | null
  priceChange24h?: number | null
  onBack: () => void
  refreshMessage?: string | null
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  coinInfo,
  currentPrice,
  priceChange24h,
  onBack,
  refreshMessage
}) => {
  return (
    <div className="mb-6">
      {coinInfo && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {coinInfo.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {coinInfo.symbol?.toUpperCase()}
              </p>
            </div>
          </div>
          {currentPrice && (
            <div className="text-right">
              <p className={`text-3xl font-bold ${
                priceChange24h && priceChange24h > 0 
                  ? 'text-green-600 dark:text-green-400'
                  : priceChange24h && priceChange24h < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-primary-600 dark:text-primary-400'
              }`}>
                ${currentPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4
                })}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current Price
              </p>
            </div>
          )}
        </div>
      )}
      <div className="flex justify-start gap-2">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
        >
          ← Choose Another Coin
        </Button>
        {coinInfo && (
          <FavouriteButton
            coin={coinInfo}
            size="sm"
            variant="outline"
          />
        )}
      </div>
      
      {/* Refresh Success Message */}
      {refreshMessage && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {refreshMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisHeader
