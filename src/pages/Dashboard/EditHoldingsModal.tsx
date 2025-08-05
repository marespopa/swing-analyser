import React, { useState, useEffect } from 'react'
import type { Portfolio, PortfolioAsset, CryptoAsset } from '../../types'
import { CoinGeckoAPI } from '../../services/api'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { formatCurrency } from './utils'

interface EditHoldingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updatedPortfolio: Portfolio) => void
  portfolio: Portfolio
}

interface EditableAsset extends PortfolioAsset {
  isNew?: boolean
  isModified?: boolean
}

const EditHoldingsModal: React.FC<EditHoldingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  portfolio
}) => {
  const [assets, setAssets] = useState<EditableAsset[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CryptoAsset[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Initialize assets when modal opens
  useEffect(() => {
    if (isOpen) {
      setAssets(portfolio.assets.map(asset => ({ ...asset })))
    }
  }, [isOpen, portfolio])

  // Search for coins to add
  const searchCoins = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // Search across multiple data sources for better coverage
      let topCoins: CryptoAsset[] = []
      let trendingCoins: CryptoAsset[] = []
      let gainers: CryptoAsset[] = []
      let losers: CryptoAsset[] = []
      let lowCapCoins: CryptoAsset[] = []

      try {
        [topCoins, trendingCoins, gainers, losers, lowCapCoins] = await Promise.all([
          CoinGeckoAPI.getTopCryptocurrencies(100),
          CoinGeckoAPI.getTrendingCryptocurrencies(),
          CoinGeckoAPI.getTopGainers(),
          CoinGeckoAPI.getTopLosers(),
          CoinGeckoAPI.getLowMarketCapCryptocurrencies()
        ])
      } catch (apiError) {
        console.error('Some API calls failed, falling back to top coins only:', apiError)
        // Fallback to just top coins if other APIs fail
        topCoins = await CoinGeckoAPI.getTopCryptocurrencies(100)
      }

      console.log('Search debug for query:', query)
      console.log('Top coins count:', topCoins.length)
      console.log('Trending coins count:', trendingCoins.length)
      console.log('Gainers count:', gainers.length)
      console.log('Losers count:', losers.length)
      console.log('Low cap coins count:', lowCapCoins.length)

      // Combine all results and remove duplicates
      const allCoins = [...topCoins, ...trendingCoins, ...gainers, ...losers, ...lowCapCoins]
      const uniqueCoins = allCoins.reduce((acc, coin) => {
        if (!acc.find(c => c.id === coin.id)) {
          acc.push(coin)
        }
        return acc
      }, [] as CryptoAsset[])

      console.log('Total unique coins:', uniqueCoins.length)

      // Check if ENA exists in the data
      const enaCoin = uniqueCoins.find(coin => 
        coin.symbol.toLowerCase() === 'ena' || 
        coin.name.toLowerCase().includes('ethena')
      )
      console.log('ENA found in data:', enaCoin)

      // Filter by search query
      const filtered = uniqueCoins.filter(coin => 
        coin.name.toLowerCase().includes(query.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 15) // Show more results

      console.log('Filtered results for query:', query, 'count:', filtered.length)
      console.log('Filtered results:', filtered.map(c => `${c.symbol} (${c.name})`))

      setSearchResults(filtered)
    } catch (error) {
      console.error('Error searching coins:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Add a new asset to the portfolio
  const addAsset = (cryptoAsset: CryptoAsset) => {
    const newAsset: EditableAsset = {
      ...cryptoAsset,
      quantity: 0,
      value: 0,
      profitLoss: 0,
      profitLossPercentage: 0,
      allocation: 0,
      isNew: true,
      isModified: true
    }
    setAssets([...assets, newAsset])
    setSearchQuery('')
    setSearchResults([])
  }

  // Create a manual asset for coins not found in search
  const createManualAsset = () => {
    const manualAsset: EditableAsset = {
      id: `manual-${Date.now()}`,
      symbol: searchQuery.toUpperCase(),
      name: searchQuery,
      image: 'https://via.placeholder.com/32/666666/FFFFFF?text=?',
      current_price: 0,
      market_cap: 0,
      total_volume: 0,
      price_change_percentage_24h: 0,
      price_change_percentage_7d: 0,
      quantity: 0,
      value: 0,
      profitLoss: 0,
      profitLossPercentage: 0,
      allocation: 0,
      isNew: true,
      isModified: true
    }
    setAssets([...assets, manualAsset])
    setSearchQuery('')
    setSearchResults([])
  }

  // Remove an asset from the portfolio
  const removeAsset = (assetId: string) => {
    setAssets(assets.filter(asset => asset.id !== assetId))
  }

  // Update asset quantity
  const updateAssetQuantity = (assetId: string, quantity: number) => {
    setAssets(assets.map(asset => {
      if (asset.id === assetId) {
        const newValue = quantity * asset.current_price
        const profitLoss = newValue - (quantity * asset.current_price) // Will be 0 for new assets
        return {
          ...asset,
          quantity,
          value: newValue,
          profitLoss,
          isModified: true
        }
      }
      return asset
    }))
  }

  // Calculate new portfolio totals
  const calculateNewPortfolio = (): Portfolio => {
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)
    
    // Update allocations
    const updatedAssets = assets.map(asset => ({
      ...asset,
      allocation: totalValue > 0 ? (asset.value / totalValue) * 100 : 0
    }))

    const totalProfitLoss = updatedAssets.reduce((sum, asset) => sum + asset.profitLoss, 0)
    const totalProfitLossPercentage = portfolio.startingAmount > 0 
      ? ((totalValue - portfolio.startingAmount) / portfolio.startingAmount) * 100 
      : 0

    return {
      ...portfolio,
      totalValue,
      totalProfitLoss,
      totalProfitLossPercentage,
      assets: updatedAssets,
      updatedAt: new Date()
    }
  }

  // Handle save
  const handleSave = () => {
    const updatedPortfolio = calculateNewPortfolio()
    onSave(updatedPortfolio)
    onClose()
  }

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    searchCoins(value)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Portfolio Holdings"
      size="xl"
    >
      <div className="space-y-6">
        {/* Add New Asset Section */}
        <div>
          <h3 className="text-lg font-neo font-bold text-neo-text mb-3">
            Add New Asset
          </h3>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for a cryptocurrency..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neo-primary"></div>
              </div>
            )}
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 max-h-40 overflow-y-auto border border-neo-border rounded-neo">
              {searchResults.map((coin) => (
                <div
                  key={coin.id}
                  className="flex items-center justify-between p-3 hover:bg-neo-surface/50 cursor-pointer border-b border-neo-border last:border-b-0"
                  onClick={() => addAsset(coin)}
                >
                  <div className="flex items-center space-x-3">
                    <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-neo" />
                    <div>
                      <p className="font-neo font-bold text-neo-text">{coin.symbol}</p>
                      <p className="text-sm text-neo-text/60">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-neo font-bold text-neo-text">
                      {formatCurrency(coin.current_price)}
                    </p>
                    <p className={`text-sm ${
                      coin.price_change_percentage_24h >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Manual Entry Option */}
          {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="mt-3 p-3 border border-neo-border rounded-neo bg-neo-surface/30 dark:bg-neo-surface-dark/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-neo font-bold text-neo-text">"{searchQuery}" not found</p>
                  <p className="text-sm text-neo-text/60">Add manually with placeholder data</p>
                </div>
                <Button
                  onClick={createManualAsset}
                  variant="secondary"
                  size="sm"
                >
                  Add Manually
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Current Holdings */}
        <div>
          <h3 className="text-lg font-neo font-bold text-neo-text mb-3">
            Current Holdings ({assets.length})
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`p-4 border border-neo-border rounded-neo ${
                  asset.isNew ? 'bg-green-50 dark:bg-green-900/20' :
                  asset.isModified ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  'bg-neo-surface/50 dark:bg-neo-surface-dark/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img src={asset.image} alt={asset.name} className="w-8 h-8 rounded-neo" />
                    <div>
                      <h4 className="font-neo font-bold text-neo-text">{asset.symbol}</h4>
                      <p className="text-sm text-neo-text/60">{asset.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {asset.isNew && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-neo font-bold rounded-neo">
                        NEW
                      </span>
                    )}
                    {asset.isModified && !asset.isNew && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-neo font-bold rounded-neo">
                        MODIFIED
                      </span>
                    )}
                                         <Button
                       onClick={() => removeAsset(asset.id)}
                       variant="secondary"
                       size="sm"
                     >
                       Remove
                     </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-neo text-neo-text/60">Quantity</label>
                    <Input
                      type="number"
                      value={asset.quantity}
                      onChange={(e) => updateAssetQuantity(asset.id, parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      step="0.000001"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-neo text-neo-text/60">Current Value</label>
                    <p className="font-neo font-bold text-neo-text mt-1">
                      {formatCurrency(asset.value)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-neo-text/60">
                  Price: {formatCurrency(asset.current_price)} | 
                  24h: {asset.price_change_percentage_24h >= 0 ? '+' : ''}{asset.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-neo-surface/30 dark:bg-neo-surface-dark/30 p-4 rounded-neo">
          <h4 className="font-neo font-bold text-neo-text mb-2">Portfolio Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neo-text/60">Total Value:</span>
              <span className="font-neo font-bold text-neo-text ml-2">
                {formatCurrency(assets.reduce((sum, asset) => sum + asset.value, 0))}
              </span>
            </div>
            <div>
              <span className="text-neo-text/60">Assets:</span>
              <span className="font-neo font-bold text-neo-text ml-2">{assets.length}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default EditHoldingsModal 