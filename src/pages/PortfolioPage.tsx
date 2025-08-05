import React, { useEffect, useState, useCallback } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { userPreferencesAtom, setPortfolioAtom, setLoadingAtom, setErrorAtom } from '../store'
import type { Portfolio, PortfolioAsset, CryptoAsset } from '../types'
import { PortfolioService, CoinGeckoAPI } from '../services/api'
import { rateLimiter } from '../services/rateLimiter'
import Button from '../components/ui/Button'
import LoadingOverlay from '../components/ui/LoadingOverlay'
import ProgressBar from '../components/ui/ProgressBar'
import { PortfolioEducation } from '../components/PortfolioEducation'
import { DynamicAllocationWidget } from '../components/DynamicAllocationWidget'
import { MarketSentimentService } from '../services/marketSentiment'
import type { MarketSentiment } from '../services/marketSentiment'

const PortfolioPage: React.FC = () => {
  const [userPreferences] = useAtom(userPreferencesAtom)
  const [, setPortfolio] = useAtom(setPortfolioAtom)
  const [isLoading, setIsLoading] = useAtom(setLoadingAtom)
  const [error, setError] = useAtom(setErrorAtom)
  const [generatedPortfolio, setGeneratedPortfolio] = useState<Portfolio | null>(null)
  const [suggestions, setSuggestions] = useState<CryptoAsset[]>([])
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('Initializing...')
  const [showProgress, setShowProgress] = useState(false)
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null)
  const navigate = useNavigate()

  const generatePortfolio = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setShowProgress(true)
    setProgress(0)
    setProgressMessage('Initializing portfolio generation...')
    
    try {
      // Update progress
      setProgress(10)
      setProgressMessage('Fetching market data...')
      
      // Generate portfolio assets
      const assets = await PortfolioService.generatePortfolio(
        userPreferences.riskProfile
      )

      // Update progress
      setProgress(50)
      setProgressMessage('Calculating allocations...')
      
      // Calculate allocations
      const allocations = await PortfolioService.calculateAllocations(
        assets,
        userPreferences.riskProfile
      )

      // Update progress
      setProgress(70)
      setProgressMessage('Creating portfolio assets...')
      
      // Create portfolio assets with calculated values
      const portfolioAssets: PortfolioAsset[] = assets.map(asset => {
        const allocation = allocations[asset.id]
        const value = (userPreferences.startingAmount * allocation) / 100
        const quantity = value / asset.current_price

        return {
          ...asset,
          allocation,
          quantity,
          value,
          profitLoss: 0, // Will be calculated based on price changes
          profitLossPercentage: 0
        }
      })

      // Create portfolio
      const portfolio: Portfolio = {
        id: Date.now().toString(),
        name: `${userPreferences.riskProfile.charAt(0).toUpperCase() + userPreferences.riskProfile.slice(1)} Portfolio`,
        totalValue: userPreferences.startingAmount,
        totalProfitLoss: 0,
        totalProfitLossPercentage: 0,
        assets: portfolioAssets,
        riskProfile: userPreferences.riskProfile,
        startingAmount: userPreferences.startingAmount,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Update progress
      setProgress(90)
      setProgressMessage('Saving portfolio...')
      
      setGeneratedPortfolio(portfolio)
      setPortfolio(portfolio)
      
      // Debug: Log portfolio being saved
      console.log('PortfolioPage - Saving portfolio:', portfolio)
      console.log('PortfolioPage - Portfolio saved to localStorage:', localStorage.getItem('crypto-portfolio'))

      // Update progress
      setProgress(95)
      setProgressMessage('Generating suggestions...')
      
      // Generate suggestions for additional coins
      await generateSuggestions(portfolioAssets)
      
      // Fetch market sentiment for dynamic allocation
      try {
        const sentiment = await MarketSentimentService.getMarketSentiment()
        setMarketSentiment(sentiment)
      } catch (error) {
        console.warn('Failed to fetch market sentiment:', error)
      }
      
      // Complete
      setProgress(100)
      setProgressMessage('Portfolio ready!')
      
      // Hide progress after a short delay
      setTimeout(() => {
        setShowProgress(false)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate portfolio')
    } finally {
      setIsLoading(false)
      setShowProgress(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPreferences, setIsLoading, setError, setPortfolio])

  const generateSuggestions = useCallback(async (currentAssets: PortfolioAsset[]) => {
    try {
      // Get additional coins that complement the current portfolio
      const allCoins = await CoinGeckoAPI.getTopCryptocurrencies(50)
      
      // Filter out coins already in the portfolio
      const currentAssetIds = currentAssets.map(asset => asset.id)
      const availableCoins = allCoins.filter(coin => !currentAssetIds.includes(coin.id))
      
      // Select suggestions based on risk profile and diversification
      let suggestedCoins: CryptoAsset[] = []
      
      switch (userPreferences.riskProfile) {
        case 'conservative':
          // Suggest stable coins and established projects
          suggestedCoins = availableCoins
            .filter(coin => Math.abs(coin.price_change_percentage_24h) < 10)
            .slice(0, 3)
          break
        case 'balanced': {
          // Mix of stable and trending coins
          const stableCoins = availableCoins.filter(coin => Math.abs(coin.price_change_percentage_24h) < 15)
          const trendingCoins = availableCoins.filter(coin => Math.abs(coin.price_change_percentage_24h) >= 15)
          suggestedCoins = [...stableCoins.slice(0, 2), ...trendingCoins.slice(0, 2)]
          break
        }
        case 'aggressive':
          // Suggest high-potential coins
          suggestedCoins = availableCoins
            .filter(coin => Math.abs(coin.price_change_percentage_24h) > 10)
            .slice(0, 4)
          break
      }
      
      setSuggestions(suggestedCoins)
    } catch (error) {
      console.error('Error generating suggestions:', error)
    }
  }, [userPreferences.riskProfile, setSuggestions])

  useEffect(() => {
    generatePortfolio()
  }, [generatePortfolio])

  const handleContinue = () => {
    navigate('/dashboard')
  }

  const handleRegenerate = () => {
    generatePortfolio()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neo-background dark:bg-neo-background-dark flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-xl p-8 rounded-neo-xl text-center">
            <h1 className="text-3xl font-neo font-black text-neo-text mb-4">
              ERROR GENERATING PORTFOLIO
            </h1>
            <p className="text-lg font-neo text-neo-text/80 mb-6">
              {error}
            </p>
            <Button
              onClick={handleRegenerate}
              variant="primary"
              size="lg"
            >
              TRY AGAIN
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neo-background dark:bg-neo-background-dark p-4">
      <LoadingOverlay isVisible={Boolean(isLoading)} message="GENERATING YOUR PORTFOLIO..." />
      
      {/* Progress Bar */}
      {showProgress && (
        <ProgressBar
          progress={progress}
          message={progressMessage}
          showRateLimit={true}
          rateLimitInfo={rateLimiter.getUsageInfo()}
        />
      )}
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-xl p-8 rounded-neo-xl text-center mb-8">
          <h1 className="text-4xl font-neo font-black text-neo-text mb-4">
            YOUR PORTFOLIO IS READY
          </h1>
          <p className="text-lg font-neo text-neo-text/80">
            Here's your optimized crypto portfolio based on your {userPreferences.riskProfile} risk profile
          </p>
        </div>

        {generatedPortfolio && (
          <>
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-6 rounded-neo-lg text-center">
                <h3 className="text-lg font-neo font-bold text-neo-text/60 mb-2">
                  TOTAL VALUE
                </h3>
                <p className="text-3xl font-neo font-black text-neo-text">
                  {formatCurrency(generatedPortfolio.totalValue)}
                </p>
              </div>
              <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-6 rounded-neo-lg text-center">
                <h3 className="text-lg font-neo font-bold text-neo-text/60 mb-2">
                  ASSETS
                </h3>
                <p className="text-3xl font-neo font-black text-neo-text">
                  {generatedPortfolio.assets.length}
                </p>
              </div>
              <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-6 rounded-neo-lg text-center">
                <h3 className="text-lg font-neo font-bold text-neo-text/60 mb-2">
                  RISK PROFILE
                </h3>
                <p className="text-3xl font-neo font-black text-neo-text">
                  {userPreferences.riskProfile.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Portfolio Assets */}
            <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
              <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
                PORTFOLIO ALLOCATION
              </h2>
              <div className="space-y-4">
                {generatedPortfolio.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-6 border-neo border-neo-border rounded-neo-lg bg-neo-surface/50 dark:bg-neo-surface-dark/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={asset.image}
                          alt={asset.name}
                          className="w-12 h-12 rounded-neo"
                        />
                        <div>
                          <h3 className="text-xl font-neo font-black text-neo-text">
                            {asset.symbol}
                          </h3>
                          <p className="font-neo text-neo-text/60">
                            {asset.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-neo font-bold text-neo-text">
                          {formatCurrency(asset.value)}
                        </p>
                        <p className="font-neo text-neo-text/60">
                          {formatPercentage(asset.allocation)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Allocation Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-neo-surface/30 dark:bg-neo-surface-dark/30 rounded-neo overflow-hidden">
                        <div
                          className="h-3 bg-gradient-to-r from-neo-primary via-neo-secondary to-neo-accent"
                          style={{ width: `${asset.allocation}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Asset Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="font-neo text-neo-text/60">Price</p>
                        <p className="font-neo font-bold text-neo-text">
                          {formatCurrency(asset.current_price)}
                        </p>
                      </div>
                      <div>
                        <p className="font-neo text-neo-text/60">Quantity</p>
                        <p className="font-neo font-bold text-neo-text">
                          {asset.quantity.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <p className="font-neo text-neo-text/60">24h Change</p>
                        <p className={`font-neo font-bold ${
                          asset.price_change_percentage_24h >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatPercentage(asset.price_change_percentage_24h)}
                        </p>
                      </div>
                      <div>
                        <p className="font-neo text-neo-text/60">Market Cap</p>
                        <p className="font-neo font-bold text-neo-text">
                          ${(asset.market_cap / 1e9).toFixed(2)}B
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Education Section */}
            <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
              <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
                📚 PORTFOLIO STRATEGY GUIDE
              </h2>
              <p className="text-lg font-neo text-neo-text/80 mb-6">
                Learn about the strategy behind your {userPreferences.riskProfile} portfolio allocation and best practices for crypto investing.
              </p>
              <PortfolioEducation 
                selectedRiskProfile={userPreferences.riskProfile}
              />
            </div>

            {/* Dynamic Allocation Section */}
            {generatedPortfolio && (
              <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
                <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
                  🎯 MARKET-ADAPTIVE ALLOCATION
                </h2>
                <p className="text-lg font-neo text-neo-text/80 mb-6">
                  Your portfolio allocation has been dynamically adjusted based on current market sentiment and volatility analysis.
                </p>
                <DynamicAllocationWidget 
                  assets={generatedPortfolio.assets}
                  riskProfile={userPreferences.riskProfile}
                  sentiment={marketSentiment}
                />
              </div>
            )}

            {/* Suggestions Section */}
            {suggestions.length > 0 && (
              <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
                <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
                  💡 PORTFOLIO SUGGESTIONS
                </h2>
                <p className="text-lg font-neo text-neo-text/80 mb-6">
                  Consider adding these coins to further diversify your {userPreferences.riskProfile} portfolio:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((coin) => (
                    <div
                      key={coin.id}
                      className="p-4 border-neo border-neo-border rounded-neo-lg bg-neo-surface/50 dark:bg-neo-surface-dark/50 hover:shadow-neo-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-10 h-10 rounded-neo"
                        />
                        <div>
                          <h3 className="font-neo font-bold text-neo-text">
                            {coin.symbol}
                          </h3>
                          <p className="text-sm font-neo text-neo-text/60">
                            {coin.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-neo text-neo-text/60">Price</span>
                          <span className="font-neo font-bold text-neo-text">
                            {formatCurrency(coin.current_price)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-neo text-neo-text/60">24h Change</span>
                          <span className={`font-neo font-bold ${
                            coin.price_change_percentage_24h >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatPercentage(coin.price_change_percentage_24h)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-neo text-neo-text/60">Market Cap</span>
                          <span className="font-neo font-bold text-neo-text">
                            ${(coin.market_cap / 1e9).toFixed(2)}B
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-neo-primary/10 dark:bg-neo-primary-dark/10 border-neo border-neo-primary dark:border-neo-primary-dark rounded-neo">
                  <p className="text-sm font-neo text-neo-text/80">
                    <strong>💡 Tip:</strong> These suggestions are based on your risk profile and current portfolio composition. 
                    Consider adding them gradually to maintain your desired risk level.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleRegenerate}
                variant="secondary"
                size="lg"
              >
                REGENERATE PORTFOLIO
              </Button>
              <Button
                onClick={handleContinue}
                variant="primary"
                size="lg"
              >
                GO TO DASHBOARD
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PortfolioPage 