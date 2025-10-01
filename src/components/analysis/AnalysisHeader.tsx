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
  onRefresh?: () => void
  isPriceLoading?: boolean
}

const AnalysisHeader = ({
  coinInfo,
  currentPrice,
  priceChange24h,
  onBack,
  onRefresh,
  isPriceLoading = false
}: AnalysisHeaderProps) => {
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
          {(currentPrice || isPriceLoading) && (
            <div className="text-right">
              {isPriceLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Updating price...
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <p className={`text-3xl font-bold ${
                    priceChange24h && priceChange24h > 0 
                      ? 'text-green-600 dark:text-green-400'
                      : priceChange24h && priceChange24h < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-primary-600 dark:text-primary-400'
                  }`}>
                    ${currentPrice?.toLocaleString(undefined, {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4
                    })}
                  </p>
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                      title="Refresh price"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isPriceLoading ? 'Refreshing...' : 'Current Price'}
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
    </div>
  )
}

export default AnalysisHeader
