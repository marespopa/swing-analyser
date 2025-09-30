import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { coinGeckoAPI } from '../services/coingeckoApi'
import { useAtom } from 'jotai'
import { apiKeyAtom } from '../store'
import AnalysisResults from '../components/AnalysisResults'

const AnalysisResultsPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { coinId } = useParams<{ coinId: string }>()
  const [apiKey] = useAtom(apiKeyAtom)
  const [isLoading, setIsLoading] = useState(false)
  
  // Get analysis results from navigation state or fetch from API
  const [analysisResults, setAnalysisResults] = useState(location.state?.analysisResults)

  useEffect(() => {
    // If no analysis results in state, fetch from API using coinId
    if (!analysisResults && coinId) {
      if (apiKey && apiKey.trim()) {
        console.log('API key found, fetching data for:', coinId)
        fetchAnalysisData()
      } else {
        // No API key, redirect to form with a message
        console.log('No API key found, redirecting to form')
        navigate('/', { state: { message: 'Please set your API key first' } })
      }
    } else if (!analysisResults) {
      // No data and no way to fetch, redirect to form
      navigate('/')
    }
  }, [coinId, apiKey, analysisResults, navigate])

  // Handle refresh data from navigation state
  useEffect(() => {
    if (location.state?.analysisResults) {
      console.log('Received fresh analysis results from navigation state', location.state.timestamp)
      setAnalysisResults(location.state.analysisResults)
    }
  }, [location.state?.analysisResults, location.state?.timestamp])

  const fetchAnalysisData = async () => {
    if (!coinId || !apiKey) return
    
    console.log('Fetching data for coinId:', coinId, 'with API key:', apiKey ? 'present' : 'missing')
    setIsLoading(true)
    try {
      coinGeckoAPI.setApiKey(apiKey)
      
      // Fetch coin info and historical data
      const [coinInfo, historicalData] = await Promise.all([
        coinGeckoAPI.getCoinInfo(coinId),
        coinGeckoAPI.getHistoricalData(coinId, '1d', 30)
      ])

      // Convert to our format
      const priceData = historicalData.prices.map(([timestamp, price], index) => ({
        timestamp,
        price,
        volume: historicalData.total_volumes[index] ? historicalData.total_volumes[index][1] : undefined
      }))

      const results = {
        '1d': {
          coin: { id: coinId, name: coinInfo.name, symbol: coinInfo.symbol },
          interval: '1d',
          priceData,
          currentPriceData: coinInfo
        }
      }

      setAnalysisResults(results)
    } catch (error) {
      console.error('Failed to fetch analysis data:', error)
      
      // Check if it's a rate limit error
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        // Redirect to form with a specific message about rate limiting
        navigate('/', { 
          state: { 
            message: 'API rate limit exceeded. Please wait a moment and try again, or check your API key settings.' 
          } 
        })
      } else {
        // Other errors, redirect to form
        navigate('/', { 
          state: { 
            message: 'Failed to fetch analysis data. Please check your API key and try again.' 
          } 
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analysis data...</p>
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
    />
  )
}

export default AnalysisResultsPage
