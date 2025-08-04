import React, { useEffect, useState, useCallback } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { portfolioAtom, swingTradeOpportunitiesAtom, addSwingTradeOpportunityAtom, removeSwingTradeOpportunityAtom, setLoadingAtom, setPortfolioAtom } from '../store'
import type { SwingTradeOpportunity } from '../types'
import { CoinGeckoAPI } from '../services/api'
import { CacheService } from '../services/cache'
import { RebalancingService } from '../services/rebalancing'
import { TechnicalAnalysisService } from '../services/technicalAnalysis'
import Button from '../components/ui/Button'
import LoadingOverlay from '../components/ui/LoadingOverlay'
import Dialog from '../components/ui/Dialog'

const DashboardPage: React.FC = () => {
  const [portfolio] = useAtom(portfolioAtom)
  const [swingTradeOpportunities] = useAtom(swingTradeOpportunitiesAtom)
  const [, addSwingTradeOpportunity] = useAtom(addSwingTradeOpportunityAtom)
  const [, removeSwingTradeOpportunity] = useAtom(removeSwingTradeOpportunityAtom)
  const [isLoading, setIsLoading] = useAtom(setLoadingAtom)
  const [, setPortfolio] = useAtom(setPortfolioAtom)
  const navigate = useNavigate()
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [cacheInfo] = useState(CacheService.getCacheInfo())
  const [rebalancingRecommendation] = useState(() => {
    return portfolio ? RebalancingService.analyzePortfolio(portfolio) : null
  })
  const [showResetDialog, setShowResetDialog] = useState(false)

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
      
      // Generate swing trade opportunities using real technical analysis
      const opportunities: SwingTradeOpportunity[] = []
      const usedCoinIds = new Set<string>()
      
      for (const coin of volatileCoins) {
        if (opportunities.length >= 10) break // Generate more opportunities for better selection
        if (usedCoinIds.has(coin.id)) continue // Skip if coin already used
        
        // Additional check: skip if this coin already has an opportunity
        const existingOpportunity = swingTradeOpportunities.find(opp => opp.asset.id === coin.id)
        if (existingOpportunity) continue
        
        // Generate real technical analysis signal
        const technicalSignal = TechnicalAnalysisService.generateSwingTradeSignal(coin, portfolio.assets)
        
        // Only add if we have a clear buy or sell signal with good confidence
        if (technicalSignal.signal !== 'hold' && technicalSignal.confidence >= 70) {
          const expectedReturn = technicalSignal.signal === 'buy' 
            ? Math.abs(technicalSignal.technicalScore) * 0.3 + 5 // 5-20% for buys
            : Math.abs(technicalSignal.technicalScore) * 0.2 + 3 // 3-15% for sells
          
          const riskLevel = technicalSignal.riskScore > 50 ? 'high' : 
                           technicalSignal.riskScore > 25 ? 'medium' : 'low'
          
          opportunities.push({
            id: `opportunity-${Date.now()}-${coin.id}`,
            type: technicalSignal.signal,
            asset: coin,
            reason: technicalSignal.reasons.join(', '),
            confidence: technicalSignal.confidence,
            suggestedAllocation: Math.floor(Math.random() * 8) + 7, // 7-15%
            expectedReturn,
            riskLevel,
            timestamp: new Date()
          })
          
          usedCoinIds.add(coin.id) // Mark coin as used
        }
      }

      // Clear ALL existing opportunities first to prevent duplicates
      swingTradeOpportunities.forEach(opportunity => {
        removeSwingTradeOpportunity(opportunity.id)
      })
      
      // Sort opportunities by confidence and freshness, then limit to 5
      const sortedOpportunities = opportunities
        .sort((a, b) => {
          // Primary sort by confidence
          if (b.confidence !== a.confidence) {
            return b.confidence - a.confidence
          }
          // Secondary sort by timestamp (freshest first)
          return b.timestamp.getTime() - a.timestamp.getTime()
        })
        .slice(0, 5) // Limit to 5 items
      
      // Add new opportunities
      sortedOpportunities.forEach(opportunity => {
        addSwingTradeOpportunity(opportunity)
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error analyzing for swing trades:', error)
    } finally {
      setIsLoading(false)
    }
  }, [portfolio, setIsLoading, addSwingTradeOpportunity, removeSwingTradeOpportunity, swingTradeOpportunities])

  useEffect(() => {
    if (portfolio) {
      // Simulate periodic analysis for swing trade opportunities
      const interval = setInterval(() => {
        analyzeForSwingTrades()
      }, 30000) // Check every 30 seconds for demo purposes

      return () => clearInterval(interval)
    }
  }, [portfolio, analyzeForSwingTrades])

  const handleResetPortfolio = () => {
    setShowResetDialog(true)
  }

  const confirmResetPortfolio = () => {
    setPortfolio(null)
    navigate('/setup')
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

        {/* Portfolio Rebalancing */}
        {rebalancingRecommendation && (
          <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-neo font-black text-neo-text">
                PORTFOLIO REBALANCING
              </h2>
              <div className={`px-3 py-1 rounded-neo text-sm font-neo font-bold ${
                rebalancingRecommendation.urgency === 'high' 
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : rebalancingRecommendation.urgency === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }`}>
                {rebalancingRecommendation.urgency.toUpperCase()} PRIORITY
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Rebalancing Summary */}
              <div>
                <h3 className="text-xl font-neo font-black text-neo-text mb-4">
                  RECOMMENDATION
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-neo text-neo-text/60">Action</p>
                    <p className={`font-neo font-bold text-lg ${
                      rebalancingRecommendation.type === 'rebalance' 
                        ? 'text-red-600 dark:text-red-400'
                        : rebalancingRecommendation.type === 'partial-rebalance'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {rebalancingRecommendation.type.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-neo text-neo-text/60">Portfolio Drift</p>
                    <p className={`font-neo font-bold text-lg ${
                      rebalancingRecommendation.driftPercentage > 15 
                        ? 'text-red-600 dark:text-red-400'
                        : rebalancingRecommendation.driftPercentage > 10
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {rebalancingRecommendation.driftPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-neo text-neo-text/60">Next Review</p>
                    <p className="font-neo font-bold text-neo-text">
                      {rebalancingRecommendation.nextReviewDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-neo text-neo-text/60">Reason</p>
                    <p className="font-neo text-neo-text">
                      {rebalancingRecommendation.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggested Actions */}
              <div>
                <h3 className="text-xl font-neo font-black text-neo-text mb-4">
                  SUGGESTED ACTIONS
                </h3>
                <ul className="space-y-2">
                  {rebalancingRecommendation.suggestedActions.map((action, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-neo-primary dark:text-neo-primary-dark mt-1">•</span>
                      <span className="font-neo text-neo-text/80">{action}</span>
                    </li>
                  ))}
                </ul>

                {/* Strategy Recommendations */}
                <div className="mt-6 p-4 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border rounded-neo">
                  <h4 className="font-neo font-bold text-neo-text mb-2">Strategy Tips</h4>
                  <div className="space-y-2 text-sm font-neo text-neo-text/80">
                    <p>{RebalancingService.getFrequencyRecommendation(portfolio.riskProfile)}</p>
                    <p>{RebalancingService.getHoldingPeriodRecommendation(portfolio.riskProfile)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets to Rebalance */}
            {rebalancingRecommendation.assetsToRebalance.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-neo font-black text-neo-text mb-4">
                  ASSETS TO REBALANCE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rebalancingRecommendation.assetsToRebalance.map((item) => (
                    <div
                      key={item.asset.id}
                      className="p-4 border-neo border-neo-border rounded-neo bg-neo-surface/50 dark:bg-neo-surface-dark/50"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={item.asset.image}
                          alt={item.asset.name}
                          className="w-10 h-10 rounded-neo"
                        />
                        <div>
                          <h4 className="font-neo font-bold text-neo-text">
                            {item.asset.symbol}
                          </h4>
                          <p className="text-sm font-neo text-neo-text/60">
                            {item.asset.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-neo text-neo-text/60">Current</span>
                          <span className="font-neo font-bold text-neo-text">
                            {item.currentAllocation.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-neo text-neo-text/60">Target</span>
                          <span className="font-neo font-bold text-neo-text">
                            {item.targetAllocation.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-neo text-neo-text/60">Action</span>
                          <span className={`font-neo font-bold ${
                            item.action === 'sell' 
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {item.action.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-neo text-neo-text/60">Amount</span>
                          <span className="font-neo font-bold text-neo-text">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

                      {/* Technical Analysis Details */}
                      <div className="mt-4 p-4 bg-neo-surface/30 dark:bg-neo-surface-dark/30 border-neo border-neo-border rounded-neo">
                        <h4 className="font-neo font-bold text-neo-text mb-3">Technical Analysis</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {(() => {
                            const indicators = TechnicalAnalysisService.calculateAllIndicators(opportunity.asset)
                            const metrics = TechnicalAnalysisService.calculateAdvancedMetrics(opportunity.asset)
                            return (
                              <>
                                <div>
                                  <p className="text-neo-text/60">RSI</p>
                                  <p className={`font-neo font-bold ${
                                    indicators.rsi < 30 ? 'text-green-600 dark:text-green-400' :
                                    indicators.rsi > 70 ? 'text-red-600 dark:text-red-400' :
                                    'text-neo-text'
                                  }`}>
                                    {indicators.rsi.toFixed(1)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-neo-text/60">Sharpe Ratio</p>
                                  <p className={`font-neo font-bold ${
                                    metrics.sharpeRatio > 1 ? 'text-green-600 dark:text-green-400' :
                                    metrics.sharpeRatio < 0 ? 'text-red-600 dark:text-red-400' :
                                    'text-neo-text'
                                  }`}>
                                    {metrics.sharpeRatio.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-neo-text/60">Volatility</p>
                                  <p className="font-neo font-bold text-neo-text">
                                    {(metrics.volatility * 100).toFixed(1)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-neo-text/60">Max Drawdown</p>
                                  <p className={`font-neo font-bold ${
                                    metrics.maxDrawdown > 0.3 ? 'text-red-600 dark:text-red-400' :
                                    metrics.maxDrawdown > 0.2 ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-green-600 dark:text-green-400'
                                  }`}>
                                    {(metrics.maxDrawdown * 100).toFixed(1)}%
                                  </p>
                                </div>
                              </>
                            )
                          })()}
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

      {/* Reset Portfolio Dialog */}
      <Dialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={confirmResetPortfolio}
        title="Reset Portfolio"
        message="Are you sure you want to reset your portfolio? This will clear all your current holdings and take you back to setup. This action cannot be undone."
        confirmText="Reset Portfolio"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

export default DashboardPage 