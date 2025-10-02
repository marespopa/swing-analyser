import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtom } from 'jotai'
import { Button, Input, AutocompleteInput } from './ui'
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
  onError: (error: string) => void
  preSelectedCoin?: any
  autoAnalyze?: boolean
}

const CoinAnalysisForm: React.FC<CoinAnalysisFormProps> = ({
  onError,
  preSelectedCoin,
  autoAnalyze = false
}) => {
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useAtom(apiKeyAtom)
  const [formData, setFormData] = useState({
    coinQuery: '',
    apiKey: apiKey
  })
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedCoin, setSelectedCoin] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const searchTimeoutRef = useRef<number | null>(null)
  const searchCacheRef = useRef<Map<string, SearchResult[]>>(new Map())
  const lastSearchQueryRef = useRef<string>('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'apiKey') {
      setApiKey(value)
    }
  }

  useEffect(() => {
    if (preSelectedCoin && !autoAnalyze) {
      const coin: SearchResult = {
        id: preSelectedCoin.id,
        name: preSelectedCoin.name,
        symbol: preSelectedCoin.symbol,
        marketCapRank: null
      }
      
      setSelectedCoin(coin)
      setFormData(prev => ({
        ...prev,
        coinQuery: `${coin.name} (${coin.symbol})`
      }))
    }
  }, [preSelectedCoin, apiKey, autoAnalyze])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleSearch = async (query?: string) => {
    const searchQuery = query || formData.coinQuery.trim()
    if (!searchQuery || searchQuery.length < 2) {
      onError('Please enter at least 2 characters to search')
      return
    }

    // Skip if this is the same query we just searched
    if (searchQuery === lastSearchQueryRef.current) {
      return
    }

    setIsSearching(true)
    lastSearchQueryRef.current = searchQuery
    
    try {
      const results = await coinGeckoAPI.searchCoin(searchQuery)
      const limitedResults = results.slice(0, 8)
      
      // Cache the results
      searchCacheRef.current.set(searchQuery.toLowerCase(), limitedResults)
      
      // Limit cache size to prevent memory issues
      if (searchCacheRef.current.size > 50) {
        const firstKey = searchCacheRef.current.keys().next().value
        if (firstKey) {
          searchCacheRef.current.delete(firstKey)
        }
      }
      
      setSearchResults(limitedResults)
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


  const handleContinue = () => {
    if (!selectedCoin) {
      onError('Please select a coin from the search results')
      return
    }

    if (!apiKey.trim()) {
      onError('Please enter your CoinGecko API key')
      return
    }

    navigate(`/analysis/${selectedCoin.id}`)
  }


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Technical Analysis Setup
      </h2>

      <form onSubmit={(e) => e.preventDefault()}>
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
        <AutocompleteInput
          label="Coin Name or Symbol"
          value={formData.coinQuery}
          onChange={(value) => setFormData(prev => ({ ...prev, coinQuery: value }))}
          onSelect={handleCoinSelect}
          searchResults={searchResults}
          isLoading={isSearching}
          onSearch={handleSearch}
          placeholder="Start typing to search for coins..."
          minSearchLength={2}
          maxResults={8}
        />

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
              </div>
              <Button
                onClick={() => {
                  setSelectedCoin(null)
                  setFormData(prev => ({ ...prev, coinQuery: '' }))
                }}
                variant="ghost"
                size="sm"
              >
                Change
              </Button>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div>
          <Button
            onClick={handleContinue}
            disabled={!selectedCoin || !apiKey.trim()}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Continue to Analysis
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Click to validate form and proceed to analysis page
          </p>
        </div>
        </div>
      </form>
    </div>
  )
}

export default CoinAnalysisForm
