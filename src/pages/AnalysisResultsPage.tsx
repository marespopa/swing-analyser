import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePriceData } from '../hooks/usePriceData'
import AnalysisResults from '../components/AnalysisResults'
import { AnalysisProvider } from '../contexts/AnalysisContext'
import AnalysisPageSkeleton from '../components/skeletons/AnalysisPageSkeleton'

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
    loadMultipleTimeframes,
  } = usePriceData()
  
  console.log('usePriceData hook completed successfully')
  
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAnalysisRefreshing, setIsAnalysisRefreshing] = useState(false)
  const intervalRef = useRef<number | null>(null)

  // Manual analysis refresh function (fetches new price data and re-runs analysis)
  const handleAnalysisRefresh = async () => {
    if (!coinId) return
    
    setIsAnalysisRefreshing(true)
    
    try {
      console.log('AnalysisResultsPage: Refreshing analysis with new price data for coinId:', coinId)
      
      // Fetch fresh price data for multiple timeframes
      const [currentPriceData, multipleTimeframesData] = await Promise.all([
        loadAllData(coinId),
        loadMultipleTimeframes(coinId)
      ])
      
      const { currentPrice } = currentPriceData
      
      if (currentPrice && multipleTimeframesData) {
        // Transform data to match the expected format for AnalysisResults
        const results: any = {}
        
        // Process each timeframe
        Object.entries(multipleTimeframesData).forEach(([interval, historicalData]) => {
          if (historicalData) {
            // Merge price and volume data
            const priceDataWithVolume = historicalData.prices.map((pricePoint, index) => {
              const volumePoint = historicalData.volumes[index]
              return {
                ...pricePoint,
                volume: volumePoint ? volumePoint.volume : undefined
              }
            })

            results[interval] = {
              coin: { 
                id: currentPrice.id, 
                name: currentPrice.name, 
                symbol: currentPrice.symbol 
              },
              interval: interval,
              priceData: priceDataWithVolume,
              currentPriceData: currentPrice
            }
          }
        })
        
        setAnalysisResults(results)
        setLastRefreshTime(new Date())
        
        console.log('Analysis refreshed successfully with new price data for multiple timeframes')
      }
    } catch (error) {
      console.error('Error refreshing analysis:', error)
    } finally {
      setIsAnalysisRefreshing(false)
    }
  }

  // Function to fetch and process data
  const fetchData = async (isAutoRefresh: boolean = false) => {
    if (!coinId) return
    
    if (isAutoRefresh) {
      setIsRefreshing(true)
    }
    
    console.log('AnalysisResultsPage: Fetching data for coinId:', coinId)
    try {
      const [currentPriceData, multipleTimeframesData] = await Promise.all([
        loadAllData(coinId),
        loadMultipleTimeframes(coinId)
      ])
      
      const { currentPrice } = currentPriceData
      
      if (currentPrice && multipleTimeframesData) {
        // Transform data to match the expected format for AnalysisResults
        const results: any = {}
        
        // Process each timeframe
        Object.entries(multipleTimeframesData).forEach(([interval, historicalData]) => {
          if (historicalData) {
            // Merge price and volume data
            const priceDataWithVolume = historicalData.prices.map((pricePoint, index) => {
              const volumePoint = historicalData.volumes[index]
              return {
                ...pricePoint,
                volume: volumePoint ? volumePoint.volume : undefined
              }
            })

            results[interval] = {
              coin: { 
                id: currentPrice.id, 
                name: currentPrice.name, 
                symbol: currentPrice.symbol 
              },
              interval: interval,
              priceData: priceDataWithVolume,
              currentPriceData: currentPrice
            }
          }
        })
        
        setAnalysisResults(results)
        setLastRefreshTime(new Date())
      } else if (!isAutoRefresh) {
        // Only navigate away on initial load failure, not auto-refresh failures
        navigate('/', { 
          state: { 
            message: error || 'Failed to fetch analysis data. Please check your API key and try again.' 
          } 
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      if (!isAutoRefresh) {
        navigate('/', { 
          state: { 
            message: 'Failed to fetch analysis data. Please check your API key and try again.' 
          } 
        })
      }
    } finally {
      if (isAutoRefresh) {
        setIsRefreshing(false)
      }
    }
  }

  console.log('coinId from useParams:', coinId);
  useEffect(() => {
    console.log('useEffect running - coinId:', coinId);
    if (!coinId) {
      console.log('No coinId, navigating to home');
      navigate('/')
      return
    }

    // Initial data fetch
    fetchData(false)

    // Set up auto-refresh interval (60 seconds)
    intervalRef.current = setInterval(() => {
      fetchData(true)
    }, 60000) // 60 seconds

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [coinId, navigate, loadAllData, error])

  // Update page title with coin name and current price
  useEffect(() => {
    if (analysisResults && analysisResults['1d']?.coin && analysisResults['1d']?.currentPriceData) {
      const coin = analysisResults['1d'].coin
      const currentPrice = analysisResults['1d'].currentPriceData.currentPrice
      
      // Format price with appropriate decimal places
      const formattedPrice = currentPrice >= 1 
        ? `$${currentPrice.toFixed(2)}`
        : `$${currentPrice.toFixed(6)}`
      
      document.title = `${formattedPrice} - ${coin.name} (${coin.symbol.toUpperCase()}) | Swing Analyzer`
    } else if (coinId) {
      // Fallback title while loading
      document.title = `Loading ${coinId} Analysis | Swing Analyzer`
    }
  }, [analysisResults, coinId])

  // Reset title when component unmounts
  useEffect(() => {
    return () => {
      document.title = 'Swing Analyzer'
    }
  }, [])

  // Show skeleton immediately while data is loading
  if (!analysisResults) {
    return <AnalysisPageSkeleton />
  }

  return (
    <Suspense fallback={<AnalysisPageSkeleton />}>
      <AnalysisProvider
        isAnalysisRefreshing={isAnalysisRefreshing}
        onAnalysisRefresh={handleAnalysisRefresh}
        lastRefreshTime={lastRefreshTime}
      >
        <AnalysisResults
          results={analysisResults}
          isPriceLoading={isLoading || isRefreshing}
          isRefreshing={isRefreshing}
        />
      </AnalysisProvider>
    </Suspense>
  )
}

export default AnalysisResultsPage
