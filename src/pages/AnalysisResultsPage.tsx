import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePriceData } from '../hooks/usePriceData'
import AnalysisResults from '../components/AnalysisResults'

const AnalysisResultsPage: React.FC = () => {
  console.log('AnalysisResultsPage component is rendering!')
  
  const navigate = useNavigate()
  const { coinId } = useParams<{ coinId: string }>()
  
  console.log('About to call usePriceData hook')
  
  // Use the price data hook
  const { 
    isLoading, 
    error,
    loadAllData,
  } = usePriceData()
  
  console.log('usePriceData hook completed successfully')
  
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  console.log('coinId from useParams:', coinId);
  useEffect(() => {
    console.log('useEffect running - coinId:', coinId);
    if (!coinId) {
      console.log('No coinId, navigating to home');
      navigate('/')
      return
    }

    console.log('AnalysisResultsPage: Fetching data for coinId:', coinId)
    loadAllData(coinId).then(({ currentPrice, historicalData }) => {
      if (currentPrice && historicalData) {
        // Transform data to match the expected format for AnalysisResults
        const results = {
          '1d': {
            coin: { 
              id: currentPrice.id, 
              name: currentPrice.name, 
              symbol: currentPrice.symbol 
            },
            interval: '1d',
            priceData: historicalData.prices,
            currentPriceData: currentPrice
          }
        }
        setAnalysisResults(results)
      } else {
        navigate('/', { 
          state: { 
            message: error || 'Failed to fetch analysis data. Please check your API key and try again.' 
          } 
        })
      }
    })
  }, [coinId, navigate, loadAllData, error])

  if (!analysisResults && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading analysis data...
          </p>
        </div>
      </div>
    )
  }

  if (!analysisResults) {
    return null
  }

  return (
    <AnalysisResults
      results={analysisResults}
      isPriceLoading={isLoading}
      isInitialLoading={isLoading}
    />
  )
}

export default AnalysisResultsPage
