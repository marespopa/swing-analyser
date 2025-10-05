import { useState, useEffect, useCallback } from 'react'
import { coinGeckoAPI } from '../services/coingeckoApi'
import type { ExchangeInfo } from '../services/coingeckoApi'

export const useExchangeInfo = (coinId: string | null) => {
  const [exchangeInfo, setExchangeInfo] = useState<ExchangeInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExchangeInfo = useCallback(async (id: string) => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    try {
      const info = await coinGeckoAPI.getExchangeInfo(id)
      setExchangeInfo(info)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exchange information'
      setError(errorMessage)
      console.error('Failed to fetch exchange info:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (coinId) {
      fetchExchangeInfo(coinId)
    } else {
      setExchangeInfo(null)
      setError(null)
    }
  }, [coinId, fetchExchangeInfo])

  return {
    exchangeInfo,
    isLoading,
    error,
    refetch: () => coinId && fetchExchangeInfo(coinId)
  }
}
