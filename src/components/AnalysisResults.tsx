import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TechnicalAnalysis } from '../services/technicalAnalysis/index'
import type { TechnicalAnalysisData, PriceDataPoint } from '../services/coingeckoApi'
import AnalysisHeader from './analysis/AnalysisHeader'
import AnalysisChart from './analysis/AnalysisChart'
import AnalysisTechnicalDetails from './analysis/AnalysisTechnicalDetails'
import PatternDetection from './analysis/PatternDetection'

interface AnalysisResultsProps {
  results: {
    [key: string]: {
      coin: any
      interval: string
      priceData?: PriceDataPoint[]
      currentPriceData?: any
      error?: string
    }
  }
  isPriceLoading?: boolean
  isRefreshing?: boolean
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
  results, 
  isPriceLoading = false, 
  isRefreshing = false,
}) => {
  const navigate = useNavigate()

  // Memoize expensive technical analysis calculations
  const { processedResults, errors, coinInfo, currentPrice, priceChange24h, analysis, isLivePrice } = useMemo(() => {
    const processedResults: { [key: string]: TechnicalAnalysisData | null } = {}
    const errors: { [key: string]: string } = {}

    // Extract current price first to pass to analysis
    const coinInfo = Object.values(results)[0]?.coin
    const currentPriceData = Object.values(results)[0]?.currentPriceData
    const liveCurrentPrice = currentPriceData?.currentPrice
    
    console.log('AnalysisResults - Current Price Info:', {
      currentPriceData,
      liveCurrentPrice,
      hasCurrentPrice: !!liveCurrentPrice
    })

    Object.entries(results).forEach(([interval, result]) => {
      if (result.error) {
        errors[interval] = result.error
      } else if (result.priceData && result.priceData.length > 0) {
        try {
          // Pass the live current price to the analysis
          processedResults[interval] = TechnicalAnalysis.performAnalysis(result.priceData, liveCurrentPrice)
        } catch (error) {
          errors[interval] = `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    })

    const currentPrice = liveCurrentPrice || Object.values(processedResults).find(result => result?.currentPrice)?.currentPrice || Object.values(processedResults).find(result => result?.data?.length)?.data?.slice(-1)[0]?.price
    const priceChange24h = currentPriceData?.priceChange24h || null
    const analysis = Object.values(processedResults).find(result => result !== null)
    const isLivePrice = !!liveCurrentPrice

    return { processedResults, errors, coinInfo, currentPrice, priceChange24h, analysis, isLivePrice }
  }, [results])

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-3 sm:p-4 min-h-screen relative">
        {/* Combined Header and Summary Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <AnalysisHeader
            coinInfo={coinInfo}
            currentPrice={currentPrice}
            priceChange24h={priceChange24h}
            onBack={handleBack}
            isPriceLoading={isPriceLoading || isRefreshing}
            isLivePrice={isLivePrice}
          />
        </div>

        {/* Detailed Technical Indicators */}
        <AnalysisTechnicalDetails
          analysis={analysis || null}
          coinInfo={coinInfo}
        />

        {/* Technical Analysis Chart */}
        <AnalysisChart
          analysis={processedResults['1d'] || null}
          error={errors['1d'] || null}
        />

        {/* Pattern Detection - Now at the bottom */}
        <PatternDetection
          analysis={analysis || null}
        />
    </div>
  )
}

export default AnalysisResults