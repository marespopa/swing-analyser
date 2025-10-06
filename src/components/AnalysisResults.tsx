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
  const { processedResults, errors, coinInfo, currentPrice, priceChange24h, analysis } = useMemo(() => {
    const processedResults: { [key: string]: TechnicalAnalysisData | null } = {}
    const errors: { [key: string]: string } = {}

    Object.entries(results).forEach(([interval, result]) => {
      if (result.error) {
        errors[interval] = result.error
      } else if (result.priceData && result.priceData.length > 0) {
        try {
          processedResults[interval] = TechnicalAnalysis.performAnalysis(result.priceData)
        } catch (error) {
          errors[interval] = `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    })

    const coinInfo = Object.values(results)[0]?.coin
    const currentPriceData = Object.values(results)[0]?.currentPriceData
    const currentPrice = currentPriceData?.currentPrice || Object.values(processedResults).find(result => result?.data?.length)?.data?.slice(-1)[0]?.price
    const priceChange24h = currentPriceData?.priceChange24h || null
    const analysis = Object.values(processedResults).find(result => result !== null)

    return { processedResults, errors, coinInfo, currentPrice, priceChange24h, analysis }
  }, [results])

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-3 sm:p-4 min-h-screen relative">
        {/* Disclaimer Banner */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Not Financial Advice
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                This analysis is for educational purposes only. Not investment advice. Always conduct your own research (DYOR) before making investment decisions. Cryptocurrency investments carry high risk.
              </p>
            </div>
          </div>
        </div>

        {/* Combined Header and Summary Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <AnalysisHeader
            coinInfo={coinInfo}
            currentPrice={currentPrice}
            priceChange24h={priceChange24h}
            onBack={handleBack}
            isPriceLoading={isPriceLoading || isRefreshing}
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