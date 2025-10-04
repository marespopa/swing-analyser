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
      
      // Fetch both price data and OHLC data
      const [data, ohlcData] = await Promise.all([
        coinGeckoAPI.getHistoricalData(coinId, '1d', days),
        coinGeckoAPI.getOHLCData(coinId, days)
      ])
      
      // Create a map of OHLC data by timestamp for quick lookup
      const ohlcMap = new Map<number, { open: number; high: number; low: number; close: number }>()
      ohlcData.forEach(([timestamp, open, high, low, close]) => {
        ohlcMap.set(timestamp, { open, high, low, close })
      })
      
      const historicalData: HistoricalData = {
        prices: data.prices.map(([timestamp, price]) => {
          const ohlc = ohlcMap.get(timestamp)
          return {
            timestamp,
            price,
            volume: undefined,
            open: ohlc?.open,
            high: ohlc?.high,
            low: ohlc?.low,
            close: ohlc?.close
          }
        }),
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
      
      // Define timeframes and their corresponding API intervals and days
      const timeframes = [
        { interval: '15m', apiInterval: '1h' as const, days: 1 }, // 1 day of hourly data for 15m analysis
        { interval: '1h', apiInterval: '1h' as const, days: 7 }, // 7 days of hourly data
        { interval: '4h', apiInterval: '4h' as const, days: 14 }, // 14 days of 4-hour data
        { interval: '1d', apiInterval: '1d' as const, days: 30 }, // 30 days of daily data
        { interval: '3d', apiInterval: '1d' as const, days: 90 } // 90 days of daily data for 3d analysis
      ]
      
      // Fetch data for all timeframes in parallel
      const timeframePromises = timeframes.map(async ({ interval, apiInterval, days }) => {
        try {
          // Fetch both price data and OHLC data for each timeframe
          const [data, ohlcData] = await Promise.all([
            coinGeckoAPI.getHistoricalData(coinId, apiInterval, days),
            coinGeckoAPI.getOHLCData(coinId, days)
          ])
          
          // Create a map of OHLC data by timestamp for quick lookup
          const ohlcMap = new Map<number, { open: number; high: number; low: number; close: number }>()
          ohlcData.forEach(([timestamp, open, high, low, close]) => {
            ohlcMap.set(timestamp, { open, high, low, close })
          })
          
          const historicalData: HistoricalData = {
            prices: data.prices.map(([timestamp, price]) => {
              const ohlc = ohlcMap.get(timestamp)
              return {
                timestamp,
                price,
                volume: undefined,
                open: ohlc?.open,
                high: ohlc?.high,
                low: ohlc?.low,
                close: ohlc?.close
              }
            }),
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
