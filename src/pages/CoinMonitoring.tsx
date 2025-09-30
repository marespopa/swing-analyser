import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import LoadingOverlay from '../components/ui/LoadingOverlay'
import ApiKeyConfig from '../components/ApiKeyConfig'
import { birdeyeApi, type TokenMarketData, BirdeyeApiError } from '../services/birdeyeApi'
import { birdeyeApiKeyAtom, getStoredApiKey } from '../store/apiKeyStore'

const CoinMonitoring = () => {
  const [apiKey] = useAtom(birdeyeApiKeyAtom)
  const [tokenAddress, setTokenAddress] = useState('78ekV1DCv82j4HiXaYxGaj6hUH1REqEoyAZBmSL3pump')
  const [tokenData, setTokenData] = useState<TokenMarketData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null)
  const [showApiKeyConfig, setShowApiKeyConfig] = useState(false)

  const fetchTokenData = async (address: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await birdeyeApi.getTokenMarketData(address)
      setTokenData(data)
    } catch (err) {
      if (err instanceof BirdeyeApiError) {
        if (err.status === 401) {
          setShowApiKeyConfig(true)
        }
        setError(err.message)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch token data')
      }
      setTokenData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (tokenAddress.trim()) {
      fetchTokenData(tokenAddress.trim())
    }
  }

  const handleRefresh = () => {
    if (tokenAddress.trim()) {
      fetchTokenData(tokenAddress.trim())
    }
  }

  const startAutoRefresh = (intervalSeconds: number) => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
    
    const interval = setInterval(() => {
      if (tokenAddress.trim()) {
        fetchTokenData(tokenAddress.trim())
      }
    }, intervalSeconds * 1000)
    
    setRefreshInterval(interval)
  }

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }
  }

  useEffect(() => {
    // Load API key on mount
    const storedKey = getStoredApiKey()
    if (storedKey) {
      birdeyeApi.setApiKey(storedKey)
    }
  }, [])

  useEffect(() => {
    // Fetch initial data on component mount
    if (apiKey || getStoredApiKey()) {
      fetchTokenData(tokenAddress)
    }
  }, [tokenAddress, apiKey])
  
  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [refreshInterval])

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(8)
    if (price < 1) return price.toFixed(6)
    return price.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Coin Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor token prices and market data using Birdeye API
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter token contract address"
                value={tokenAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenAddress(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Loading...' : 'Search'}
              </Button>
              <Button 
                onClick={handleRefresh} 
                disabled={loading || !tokenData}
                variant="outline"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Auto-refresh controls */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => startAutoRefresh(30)} 
              variant="outline"
              size="sm"
            >
              Auto 30s
            </Button>
            <Button 
              onClick={() => startAutoRefresh(60)} 
              variant="outline"
              size="sm"
            >
              Auto 1m
            </Button>
            <Button 
              onClick={() => startAutoRefresh(300)} 
              variant="outline"
              size="sm"
            >
              Auto 5m
            </Button>
            <Button 
              onClick={stopAutoRefresh} 
              variant="outline"
              size="sm"
            >
              Stop Auto
            </Button>
          </div>
        </div>

        {/* API Key Configuration Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowApiKeyConfig(true)} 
              variant="outline"
              size="sm"
            >
              Configure API Key
            </Button>
            {apiKey && (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                ✓ API Key Configured
              </span>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* API Key Configuration Modal */}
        {showApiKeyConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <ApiKeyConfig onClose={() => setShowApiKeyConfig(false)} />
          </div>
        )}

        {/* Token Data Display */}
        {tokenData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {tokenData.name} ({tokenData.symbol})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Address: {tokenData.address}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date(tokenData.lastUpdated).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Current Price
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(tokenData.price)}
                </p>
              </div>

              {/* 24h Change */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  24h Change
                </h3>
                <div className="flex items-center gap-2">
                  <p className={`text-xl font-bold ${
                    tokenData.priceChangePercent24h >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {tokenData.priceChangePercent24h >= 0 ? '+' : ''}{tokenData.priceChangePercent24h.toFixed(2)}%
                  </p>
                </div>
                <p className={`text-sm ${
                  tokenData.priceChange24h >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {tokenData.priceChange24h >= 0 ? '+' : ''}${formatPrice(tokenData.priceChange24h)}
                </p>
              </div>

              {/* Volume */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  24h Volume
                </h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${formatNumber(tokenData.volume24h)}
                </p>
              </div>

              {/* Market Cap */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Market Cap
                </h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${formatNumber(tokenData.marketCap)}
                </p>
              </div>

              {/* Liquidity */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:col-span-2 lg:col-span-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Liquidity
                </h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${formatNumber(tokenData.liquidity)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && <LoadingOverlay isLoading={loading} />}
      </div>
    </div>
  )
}

export default CoinMonitoring
