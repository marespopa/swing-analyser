import Button from '../ui/Button'
import FavouriteButton from '../FavouriteButton'
import { useAnalysisContext } from '../../contexts/AnalysisContext'
import { MdRefresh } from 'react-icons/md'

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
  isPriceLoading?: boolean
}

const AnalysisHeader = ({
  coinInfo,
  currentPrice,
  priceChange24h,
  onBack,
  isPriceLoading = false
}: AnalysisHeaderProps) => {
  const { isAnalysisRefreshing, onAnalysisRefresh } = useAnalysisContext()
  return (
    <div className="mb-6">
      {coinInfo && (
        <div className="space-y-4 mb-4">
          {/* Mobile-first responsive layout */}
          {/* Coin info - always visible */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {coinInfo.name}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              {coinInfo.symbol?.toUpperCase()}
            </p>
          </div>

          {/* Price and controls - responsive layout */}
          {(currentPrice || isPriceLoading) && (
            <div className="space-y-3">
              {!isPriceLoading && (
                <>
                  {/* Price and refresh button - responsive flex */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      {onAnalysisRefresh && (
                        <Button
                          onClick={onAnalysisRefresh}
                          variant="primary"
                          size="sm"
                          className="px-3 py-2 !min-h-auto text-sm flex-shrink-0 shadow-sm"
                          title="Get fresh technical analysis with latest price data and updated indicators"
                          disabled={isAnalysisRefreshing}
                        >
                          {isAnalysisRefreshing ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                              <span className='text-sm'>Refreshing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <MdRefresh className="w-4 h-4" />
                              <span className='text-sm'>Refresh Analysis</span>
                            </div>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {/* Price display - centered on mobile, right-aligned on larger screens */}
                    <div className="text-center sm:text-right">
                      <p className={`text-2xl sm:text-3xl font-bold ${
                        priceChange24h && priceChange24h > 0 
                          ? 'text-green-600 dark:text-green-400'
                          : priceChange24h && priceChange24h < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-primary-600 dark:text-primary-400'
                      }`}>
                        ${currentPrice?.toLocaleString(undefined, {
                          minimumFractionDigits: 6,
                          maximumFractionDigits: 6
                        })}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isPriceLoading ? 'Refreshing...' : 'Current Price'}
                      </p>
                    </div>
                  </div>
                </>
              )}
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
