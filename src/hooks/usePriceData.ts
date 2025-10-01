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
      
      const data = await coinGeckoAPI.getHistoricalData(coinId, '1d', days)
      
      const historicalData: HistoricalData = {
        prices: data.prices.map(([timestamp, price]) => ({
          timestamp,
          price,
          volume: undefined
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
    clearData
  }
}
