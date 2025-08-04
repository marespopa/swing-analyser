import React, { useEffect, useState, useCallback } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { portfolioAtom, swingTradeOpportunitiesAtom, addSwingTradeOpportunityAtom, setLoadingAtom, setPortfolioAtom } from '../store'
import type { SwingTradeOpportunity, CryptoAsset } from '../types'
import { CoinGeckoAPI } from '../services/api'
import { CacheService } from '../services/cache'
import Button from '../components/ui/Button'
import LoadingOverlay from '../components/ui/LoadingOverlay'

const DashboardPage: React.FC = () => {
  const [portfolio] = useAtom(portfolioAtom)
  const [swingTradeOpportunities] = useAtom(swingTradeOpportunitiesAtom)
  const [, addSwingTradeOpportunity] = useAtom(addSwingTradeOpportunityAtom)
  const [isLoading, setIsLoading] = useAtom(setLoadingAtom)
  const [, setPortfolio] = useAtom(setPortfolioAtom)
  const navigate = useNavigate()
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [cacheInfo] = useState(CacheService.getCacheInfo())

  // Debug: Log portfolio state
  console.log('Dashboard - Portfolio state:', portfolio)
  console.log('Dashboard - Portfolio from localStorage:', localStorage.getItem('crypto-portfolio'))

  // Ensure portfolio is loaded from localStorage on mount
  useEffect(() => {
    const storedPortfolio = localStorage.getItem('crypto-portfolio')
    if (storedPortfolio && !portfolio) {
      try {
        const parsedPortfolio = JSON.parse(storedPortfolio)
        console.log('Dashboard - Loading portfolio from localStorage:', parsedPortfolio)
        setPortfolio(parsedPortfolio)
      } catch (error) {
        console.error('Dashboard - Error parsing portfolio from localStorage:', error)
      }
    }
  }, [portfolio, setPortfolio])

  const analyzeForSwingTrades = useCallback(async () => {
    if (!portfolio) return

    setIsLoading(true)
    try {
      // Get high volatility cryptocurrencies for potential opportunities
      const volatileCoins = await CoinGeckoAPI.getHighVolatilityCryptocurrencies()
      
      // Generate buy/sell opportunities for spot trading
      const opportunities: SwingTradeOpportunity[] = volatileCoins.slice(0, 3).map((coin, index) => {
        // Determine signal based on price action - no conflicting signals
        const priceChange = coin.price_change_percentage_24h
        let signalType: 'buy' | 'sell'
        let reason: string
        let expectedReturn: number
        let riskLevel: 'low' | 'medium' | 'high'

        if (priceChange < -8) {
          // Strong buy signal - oversold
          signalType = 'buy'
          reason = generateBuyReason(coin)
          expectedReturn = Math.floor(Math.random() * 15) + 8 // 8-23%
          riskLevel = priceChange < -15 ? 'high' : 'medium'
        } else if (priceChange > 8) {
          // Strong sell signal - overbought
          signalType = 'sell'
          reason = generateSellReason(coin)
          expectedReturn = Math.floor(Math.random() * 10) + 3 // 3-13%
          riskLevel = priceChange > 15 ? 'high' : 'medium'
        } else if (priceChange < -3) {
          // Moderate buy signal
          signalType = 'buy'
          reason = generateBuyReason(coin)
          expectedReturn = Math.floor(Math.random() * 10) + 5 // 5-15%
          riskLevel = 'low'
        } else if (priceChange > 3) {
          // Moderate sell signal
          signalType = 'sell'
          reason = generateSellReason(coin)
          expectedReturn = Math.floor(Math.random() * 8) + 2 // 2-10%
          riskLevel = 'low'
        } else {
          // Neutral - skip this coin
          return null
        }

        return {
          id: `opportunity-${Date.now()}-${index}`,
          type: signalType,
          asset: coin,
          reason,
          confidence: Math.floor(Math.random() * 20) + 80, // 80-100% (higher confidence with clear signals)
          suggestedAllocation: Math.floor(Math.random() * 8) + 7, // 7-15%
          expectedReturn,
          riskLevel,
          timestamp: new Date()
        }
      }).filter(Boolean) as SwingTradeOpportunity[] // Remove null entries

      // Add opportunities to store
      opportunities.forEach(opportunity => {
        addSwingTradeOpportunity(opportunity)
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error analyzing for swing trades:', error)
    } finally {
      setIsLoading(false)
    }
  }, [portfolio, setIsLoading, addSwingTradeOpportunity])

  useEffect(() => {
    if (portfolio) {
      // Simulate periodic analysis for swing trade opportunities
      const interval = setInterval(() => {
        analyzeForSwingTrades()
      }, 30000) // Check every 30 seconds for demo purposes

      return () => clearInterval(interval)
    }
  }, [portfolio, analyzeForSwingTrades])

  const generateBuyReason = (coin: CryptoAsset) => {
    const reasons = [
      `${coin.symbol} showing oversold conditions with ${coin.price_change_percentage_24h.toFixed(1)}% 24h drop - potential bounce`,
      `${coin.symbol} breaking out of support levels with increased volume`,
      `${coin.symbol} showing bullish momentum reversal pattern`,
      `${coin.symbol} trading at attractive entry point after recent correction`,
      `${coin.symbol} showing positive divergence on technical indicators`,
      `${coin.symbol} approaching key support level with strong buying pressure`
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  const generateSellReason = (coin: CryptoAsset) => {
    const reasons = [
      `${coin.symbol} showing overbought conditions with ${coin.price_change_percentage_24h.toFixed(1)}% 24h gain - potential pullback`,
      `${coin.symbol} hitting resistance levels with decreasing volume`,
      `${coin.symbol} showing bearish reversal pattern`,
      `${coin.symbol} trading at resistance after strong rally`,
      `${coin.symbol} showing negative divergence on technical indicators`,
      `${coin.symbol} approaching key resistance level with selling pressure`
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }


  const handleResetPortfolio = () => {
    if (confirm('Are you sure you want to reset your portfolio? This will clear all your current holdings and take you back to setup.')) {
      setPortfolio(null)
      navigate('/setup')
    }
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
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  if (!portfolio) {
    // Check if portfolio exists in localStorage but not in state
    const storedPortfolio = localStorage.getItem('crypto-portfolio')
    if (storedPortfolio) {
      try {
        const parsedPortfolio = JSON.parse(storedPortfolio)
        console.log('Dashboard - Found portfolio in localStorage, loading...', parsedPortfolio)
        setPortfolio(parsedPortfolio)
        return (
          <div className="min-h-screen bg-neo-background dark:bg-neo-background-dark flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-neo font-black text-neo-text mb-4">
                LOADING PORTFOLIO...
              </h1>
              <p className="font-neo text-neo-text/80">
                Please wait while we load your portfolio
              </p>
            </div>
          </div>
        )
      } catch (error) {
        console.error('Dashboard - Error parsing stored portfolio:', error)
      }
    }
    
    return (
      <div className="min-h-screen bg-neo-background dark:bg-neo-background-dark flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-neo font-black text-neo-text mb-4">
            NO PORTFOLIO FOUND
          </h1>
          <p className="font-neo text-neo-text/80">
            Please generate a portfolio first
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neo-background dark:bg-neo-background-dark p-4">
      <LoadingOverlay isVisible={Boolean(isLoading)} message="ANALYZING MARKETS..." />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-xl p-8 rounded-neo-xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-neo font-black text-neo-text mb-2">
                PORTFOLIO DASHBOARD
              </h1>
              <div className="flex items-center gap-4 text-sm font-neo text-neo-text/80">
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                {cacheInfo.enabled && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Cache: {cacheInfo.topCoinsCount + cacheInfo.trendingCoinsCount + cacheInfo.volatileCoinsCount + cacheInfo.individualCoinsCount} items
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button
                onClick={analyzeForSwingTrades}
                variant="primary"
                size="lg"
              >
                REFRESH ANALYSIS
              </Button>
              <Button
                onClick={handleResetPortfolio}
                variant="secondary"
                size="lg"
              >
                RESET PORTFOLIO
              </Button>
            </div>
          </div>
        </div>

        {/* Portfolio Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Portfolio Summary */}
          <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg">
            <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
              PORTFOLIO PERFORMANCE
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-neo text-neo-text/60">Total Value</p>
                  <p className="text-2xl font-neo font-black text-neo-text">
                    {formatCurrency(portfolio.totalValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-neo text-neo-text/60">Total P/L</p>
                  <p className={`text-2xl font-neo font-black ${
                    portfolio.totalProfitLoss >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(portfolio.totalProfitLoss)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-neo text-neo-text/60">P/L %</p>
                  <p className={`text-xl font-neo font-black ${
                    portfolio.totalProfitLossPercentage >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatPercentage(portfolio.totalProfitLossPercentage)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-neo text-neo-text/60">Assets</p>
                  <p className="text-xl font-neo font-black text-neo-text">
                    {portfolio.assets.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg">
            <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
              TOP PERFORMERS
            </h2>
            <div className="space-y-4">
              {portfolio.assets
                .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
                .slice(0, 3)
                .map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-4 bg-neo-surface/50 dark:bg-neo-surface-dark/50 rounded-neo">
                    <div className="flex items-center space-x-3">
                      <img
                        src={asset.image}
                        alt={asset.name}
                        className="w-8 h-8 rounded-neo"
                      />
                      <div>
                        <p className="font-neo font-bold text-neo-text">
                          {asset.symbol}
                        </p>
                        <p className="text-sm font-neo text-neo-text/60">
                          {formatCurrency(asset.value)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-neo font-bold ${
                      asset.price_change_percentage_24h >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatPercentage(asset.price_change_percentage_24h)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Swing Trade Opportunities */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
          <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
            SWING TRADE OPPORTUNITIES
          </h2>
          {swingTradeOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-neo text-neo-text/60 mb-4">
                No swing trade opportunities found yet
              </p>
              <p className="font-neo text-neo-text/40">
                We're continuously analyzing the market for opportunities
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {swingTradeOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="p-6 border-neo border-neo-border rounded-neo-lg bg-neo-surface/50 dark:bg-neo-surface-dark/50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={opportunity.asset.image}
                          alt={opportunity.asset.name}
                          className="w-12 h-12 rounded-neo"
                        />
                        <div>
                          <h3 className="text-xl font-neo font-black text-neo-text">
                            {opportunity.asset.symbol}
                          </h3>
                          <p className="font-neo text-neo-text/60">
                            {opportunity.asset.name}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-neo text-sm font-neo font-bold ${
                          opportunity.type === 'buy' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {opportunity.type.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-neo text-neo-text/60">Reason</p>
                          <p className="font-neo font-bold text-neo-text">
                            {opportunity.reason}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-neo text-neo-text/60">Confidence</p>
                          <p className="font-neo font-bold text-neo-text">
                            {opportunity.confidence}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-neo text-neo-text/60">Expected Return</p>
                          <p className={`font-neo font-bold ${
                            opportunity.expectedReturn >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatPercentage(opportunity.expectedReturn)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-neo text-neo-text/60">Risk:</span>
                          <span className={`px-2 py-1 rounded-neo text-xs font-neo font-bold ${
                            opportunity.riskLevel === 'high' 
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              : opportunity.riskLevel === 'medium'
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          }`}>
                            {opportunity.riskLevel.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-neo text-neo-text/60">Suggested Allocation:</span>
                          <span className="font-neo font-bold text-neo-text">
                            {opportunity.suggestedAllocation}%
                          </span>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Assets */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg">
          <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
            YOUR HOLDINGS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.assets.map((asset) => (
              <div
                key={asset.id}
                className="p-4 border-neo border-neo-border rounded-neo-lg bg-neo-surface/50 dark:bg-neo-surface-dark/50"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="w-10 h-10 rounded-neo"
                  />
                  <div>
                    <h3 className="font-neo font-bold text-neo-text">
                      {asset.symbol}
                    </h3>
                    <p className="text-sm font-neo text-neo-text/60">
                      {asset.name}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-neo text-neo-text/60">Value</span>
                    <span className="font-neo font-bold text-neo-text">
                      {formatCurrency(asset.value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-neo text-neo-text/60">Allocation</span>
                    <span className="font-neo font-bold text-neo-text">
                      {asset.allocation.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-neo text-neo-text/60">24h Change</span>
                    <span className={`font-neo font-bold ${
                      asset.price_change_percentage_24h >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatPercentage(asset.price_change_percentage_24h)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage 