import React, { useState, useEffect, useRef } from 'react'
import { useAtom } from 'jotai'
import { Button, Input } from './ui'
import { coinGeckoAPI } from '../services/coingeckoApi'
import { apiKeyAtom } from '../store'
import FavouritesList from './FavouritesList'

interface SearchResult {
  id: string
  name: string
  symbol: string
  marketCapRank: number | null
}

interface CoinAnalysisFormProps {
  onAnalysisComplete: (results: any) => void
  onLoadingChange: (loading: boolean) => void
  onError: (error: string) => void
  preSelectedCoin?: any
  autoAnalyze?: boolean
}

const CoinAnalysisForm: React.FC<CoinAnalysisFormProps> = ({
  onAnalysisComplete,
  onLoadingChange,
  onError,
  preSelectedCoin,
  autoAnalyze = false
}) => {
  const [apiKey, setApiKey] = useAtom(apiKeyAtom)
  const [formData, setFormData] = useState({
    coinQuery: '',
    apiKey: apiKey
  })
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedCoin, setSelectedCoin] = useState<SearchResult | null>(null)
  const [currentPriceData, setCurrentPriceData] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchTimeoutRef = useRef<number | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Update stored API key when it changes
    if (name === 'apiKey') {
      setApiKey(value)
    }

    // Handle coin search with debounced auto-search
    if (name === 'coinQuery') {
      setSelectedCoin(null)
      setShowSearchResults(true)
      
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      // Auto-search after 500ms of no typing
      if (value.trim().length >= 2) {
        searchTimeoutRef.current = setTimeout(() => {
          handleSearch(value.trim())
        }, 500)
      } else {
        setSearchResults([])
      }
    }
  }

  // Handle pre-selected coin (for form selection only)
  useEffect(() => {
    if (preSelectedCoin && !autoAnalyze) {
      console.log('Pre-selected coin received:', preSelectedCoin)
      const coin: SearchResult = {
        id: preSelectedCoin.id,
        name: preSelectedCoin.name,
        symbol: preSelectedCoin.symbol,
        marketCapRank: null
      }
      
      console.log('Setting selected coin:', coin)
      // Set the selected coin and form data
      setSelectedCoin(coin)
      setFormData(prev => ({
        ...prev,
        coinQuery: `${coin.name} (${coin.symbol})`
      }))
      
      // Fetch current price data if API key is available
      if (apiKey) {
        const fetchPriceData = async () => {
          try {
            coinGeckoAPI.setApiKey(apiKey)
            const priceData = await coinGeckoAPI.getCoinInfo(coin.id)
            setCurrentPriceData(priceData)
          } catch (error) {
            console.error('Failed to fetch current price:', error)
            setCurrentPriceData(null)
          }
        }
        fetchPriceData()
      }
    }
  }, [preSelectedCoin, apiKey, autoAnalyze])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleSearch = async (query?: string) => {
    const searchQuery = query || formData.coinQuery.trim()
    if (!searchQuery) {
      onError('Please enter a coin name or symbol')
      return
    }

    setIsSearching(true)
    try {
      const results = await coinGeckoAPI.searchCoin(searchQuery)
      setSearchResults(results.slice(0, 8)) // Limit to top 8 results
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to search for coins')
    } finally {
      setIsSearching(false)
    }
  }

  const handleCoinSelect = async (coin: SearchResult) => {
    setSelectedCoin(coin)
    setFormData(prev => ({
      ...prev,
      coinQuery: `${coin.name} (${coin.symbol})`
    }))
    setSearchResults([])
    setShowSearchResults(false)
    
    // Fetch current price data
    if (apiKey) {
      try {
        coinGeckoAPI.setApiKey(apiKey)
        const priceData = await coinGeckoAPI.getCoinInfo(coin.id)
        setCurrentPriceData(priceData)
      } catch (error) {
        console.error('Failed to fetch current price:', error)
        setCurrentPriceData(null)
      }
    }
  }

  const handleFavouriteSelect = async (favourite: any) => {
    const coin: SearchResult = {
      id: favourite.id,
      name: favourite.name,
      symbol: favourite.symbol,
      marketCapRank: null
    }
    await handleCoinSelect(coin)
  }


  const handleAnalyze = async () => {
    console.log('handleAnalyze called, selectedCoin:', selectedCoin)
    if (!selectedCoin) {
      onError('Please select a coin from the search results')
      return
    }

    if (!apiKey.trim()) {
      onError('Please enter your CoinGecko API key')
      return
    }

    onLoadingChange(true)
    
    try {
      // Set API key
      coinGeckoAPI.setApiKey(apiKey.trim())

      // Fetch data for 1d interval only
      const results: Record<string, any> = {}

      try {
        const historicalData = await coinGeckoAPI.getHistoricalData(
          selectedCoin.id,
          '1d',
          30 // 30 days of data
        )

        // Convert to our format
        const priceData = historicalData.prices.map(([timestamp, price], index) => {
          return {
            timestamp,
            price,
            volume: historicalData.total_volumes[index] ? historicalData.total_volumes[index][1] : undefined
          }
        })

        results['1d'] = {
          coin: selectedCoin,
          interval: '1d',
          priceData,
          currentPriceData
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        results['1d'] = {
          coin: selectedCoin,
          interval: '1d',
          error: error instanceof Error ? error.message : 'Failed to fetch data'
        }
      }

      onAnalysisComplete(results)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Analysis failed')
    } finally {
      onLoadingChange(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleCoinSelect(searchResults[0])
      } else if (formData.coinQuery.trim().length >= 2) {
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setShowSearchResults(false)
      setSearchResults([])
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Technical Analysis Setup
      </h2>


      <div className="space-y-6">
        {/* API Key Input */}
        <div>
          <Input
            label="CoinGecko API Key"
            name="apiKey"
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={handleInputChange}
            placeholder="Enter your CoinGecko API key"
            required
            variant="default"
            inputSize="md"
          />
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
            >
              {showApiKey ? 'Hide' : 'Show'} API Key
            </button>
            {apiKey && (
              <button
                type="button"
                onClick={() => {
                  setApiKey('')
                  setFormData(prev => ({ ...prev, apiKey: '' }))
                }}
                className="text-sm text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                Clear API Key
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
            <p>
              Get your free API key from{' '}
              <a
                href="https://www.coingecko.com/en/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                CoinGecko API
              </a>
            </p>
            <p className="text-yellow-600 dark:text-yellow-400">
              💡 Free tier includes 10,000 calls/month. Historical data requires a paid plan.
            </p>
          </div>
        </div>

        {/* Favourites List */}
        <FavouritesList 
          onFavouriteSelect={handleFavouriteSelect}
          maxItems={6}
        />

        {/* Coin Search */}
        <div className="relative">
          <Input
            label="Coin Name or Symbol"
            name="coinQuery"
            type="text"
            value={formData.coinQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Start typing to search coins (e.g., bitcoin, ethereum, BTC, ETH, $BTC, #bitcoin)"
            required
            variant="default"
            inputSize="md"
          />
          
          {/* Search indicator */}
          {isSearching && (
            <div className="absolute right-3 top-8 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            </div>
          )}

          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-lg max-h-64 overflow-y-auto">
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-600">
                Select a coin from the results:
              </div>
              {searchResults.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => handleCoinSelect(coin)}
                  className="w-full px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {coin.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {coin.symbol}
                      </p>
                    </div>
                    {coin.marketCapRank && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        #{coin.marketCapRank}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showSearchResults && !isSearching && formData.coinQuery.trim().length >= 2 && searchResults.length === 0 && (
            <div className="absolute z-10 w-full mt-1 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-lg p-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No coins found. Try a different search term.
              </p>
            </div>
          )}

          {/* Helper text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Start typing to automatically search for coins. Supports $ and # prefixes (e.g., $BTC, #bitcoin). Press Enter to select the first result.
          </p>
        </div>

        {/* Selected Coin Display */}
        {selectedCoin && (
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-primary-800 dark:text-primary-200">
                  Selected Coin
                </h3>
                <p className="text-primary-600 dark:text-primary-300">
                  {selectedCoin.name} ({selectedCoin.symbol})
                </p>
                {selectedCoin.marketCapRank && (
                  <p className="text-sm text-primary-500 dark:text-primary-400">
                    Market Cap Rank: #{selectedCoin.marketCapRank}
                  </p>
                )}
                {currentPriceData && (
                  <div className="mt-2 flex items-center space-x-4">
                    <div>
                      <span className="text-lg font-bold text-primary-800 dark:text-primary-200">
                        ${currentPriceData.currentPrice?.toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 6 
                        }) || 'N/A'}
                      </span>
                    </div>
                    {currentPriceData.priceChange24h && (
                      <div className={`text-sm font-medium ${
                        currentPriceData.priceChange24h >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {currentPriceData.priceChange24h >= 0 ? '+' : ''}
                        {currentPriceData.priceChange24h.toFixed(2)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  setSelectedCoin(null)
                  setCurrentPriceData(null)
                  setFormData(prev => ({ ...prev, coinQuery: '' }))
                  setShowSearchResults(false)
                }}
                variant="ghost"
                size="sm"
              >
                Change
              </Button>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <div>
          <Button
            onClick={handleAnalyze}
            disabled={!selectedCoin || !apiKey.trim()}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Start Technical Analysis
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Analysis will be performed on 1-day interval (30 days of historical data)
          </p>
        </div>
      </div>
    </div>
  )
}

export default CoinAnalysisForm
