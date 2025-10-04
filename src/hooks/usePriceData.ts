import { useState, useCallback } from 'react'
import { coinGeckoAPI } from '../services/coingeckoApi'
import type { PriceDataPoint } from '../services/coingeckoApi'

interface PriceData {
  id: string
  name: string
  symbol: string
  currentPrice: number
  priceChange24h: number
  marketCap: number
  volume24h: number
}

interface VolumeDataPoint {
  timestamp: number
  volume: number
}

interface HistoricalData {
  prices: PriceDataPoint[]
  volumes: VolumeDataPoint[]
}

export const usePriceData = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<PriceData | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadCurrentPrice = useCallback(async (coinId: string, apiKey?: string): Promise<PriceData | null> => {
    if (!coinId) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      if (apiKey) {
        coinGeckoAPI.setApiKey(apiKey)
      }
      
      const coinInfo = await coinGeckoAPI.getCoinInfo(coinId)
      
      const priceData: PriceData = {
        id: coinInfo.id,
        name: coinInfo.name,
        symbol: coinInfo.symbol,
        currentPrice: coinInfo.currentPrice,
        priceChange24h: coinInfo.priceChange24h,
        marketCap: coinInfo.marketCap,
        volume24h: coinInfo.volume24h
      }
      
      setCurrentPrice(priceData)
      return priceData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch current price'
      setError(errorMessage)
      console.error('Failed to fetch current price:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadHistoricalData = useCallback(async (coinId: string, apiKey?: string, days: number = 30): Promise<HistoricalData | null> => {
    if (!coinId) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      if (apiKey) {
        coinGeckoAPI.setApiKey(apiKey)
      }
      
      // Optimize for free tier: Use only daily data, no OHLC calls
      // Daily data is most reliable and doesn't require Enterprise plan
      const data = await coinGeckoAPI.getHistoricalData(coinId, '1d', days)
      
      const historicalData: HistoricalData = {
        prices: data.prices.map(([timestamp, price]) => ({
          timestamp,
          price,
          volume: undefined,
          // No OHLC data for free tier optimization
          open: undefined,
          high: undefined,
          low: undefined,
          close: undefined
        })),
        volumes: data.total_volumes.map(([timestamp, volume]) => ({
          timestamp,
          volume
        }))
      }
      
      setHistoricalData(historicalData)
      return historicalData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch historical data'
      setError(errorMessage)
      console.error('Failed to fetch historical data:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadAllData = useCallback(async (coinId: string, apiKey?: string, days: number = 30): Promise<{ currentPrice: PriceData | null; historicalData: HistoricalData | null }> => {
    if (!coinId) return { currentPrice: null, historicalData: null }
    
    setIsLoading(true)
    setError(null)
    
    try {
      if (apiKey) {
        coinGeckoAPI.setApiKey(apiKey)
      }
      
      const [currentPriceResult, historicalDataResult] = await Promise.all([
        loadCurrentPrice(coinId, apiKey),
        loadHistoricalData(coinId, apiKey, days)
      ])
      
      return {
        currentPrice: currentPriceResult,
        historicalData: historicalDataResult
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data'
      setError(errorMessage)
      console.error('Failed to fetch all data:', error)
      return { currentPrice: null, historicalData: null }
    } finally {
      setIsLoading(false)
    }
  }, [loadCurrentPrice, loadHistoricalData])

  const loadMultipleTimeframes = useCallback(async (coinId: string, apiKey?: string): Promise<{ [key: string]: HistoricalData | null }> => {
    if (!coinId) return {}
    
    setIsLoading(true)
    setError(null)
    
    try {
      if (apiKey) {
        coinGeckoAPI.setApiKey(apiKey)
      }
      
      // Optimized timeframes for free tier - all daily data
      const timeframes = [
        { interval: '1d', apiInterval: '1d' as const, days: 7 },   // 7 days for short-term analysis
        { interval: '1d', apiInterval: '1d' as const, days: 30 },  // 30 days for medium-term analysis
        { interval: '1d', apiInterval: '1d' as const, days: 90 },  // 90 days for long-term analysis
        { interval: '1d', apiInterval: '1d' as const, days: 180 }, // 180 days for swing trading
        { interval: '1d', apiInterval: '1d' as const, days: 365 }  // 1 year for trend analysis
      ]
      
      // Fetch data for all timeframes in parallel
      const timeframePromises = timeframes.map(async ({ interval, apiInterval, days }) => {
        try {
          // Single API call per timeframe - no OHLC data for free tier optimization
          const data = await coinGeckoAPI.getHistoricalData(coinId, apiInterval, days)
          
          const historicalData: HistoricalData = {
            prices: data.prices.map(([timestamp, price]) => ({
              timestamp,
              price,
              volume: undefined,
              // No OHLC data for free tier optimization
              open: undefined,
              high: undefined,
              low: undefined,
              close: undefined
            })),
            volumes: data.total_volumes.map(([timestamp, volume]) => ({
              timestamp,
              volume
            }))
          }
          
          return { interval, data: historicalData }
        } catch (error) {
          console.error(`Failed to fetch data for ${interval}:`, error)
          return { interval, data: null }
        }
      })
      
      const results = await Promise.all(timeframePromises)
      
      // Convert array to object
      const timeframeData: { [key: string]: HistoricalData | null } = {}
      results.forEach(({ interval, data }) => {
        timeframeData[interval] = data
      })
      
      return timeframeData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch multiple timeframes'
      setError(errorMessage)
      console.error('Failed to fetch multiple timeframes:', error)
      return {}
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearData = useCallback(() => {
    setCurrentPrice(null)
    setHistoricalData(null)
    setError(null)
  }, [])

  return {
    isLoading,
    currentPrice,
    historicalData,
    error,
    loadCurrentPrice,
    loadHistoricalData,
    loadAllData,
    loadMultipleTimeframes,
    clearData
  }
}
