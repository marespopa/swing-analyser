import React, { useEffect, useState, useCallback } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { portfolioAtom, potentialCoinsAtom, addPotentialCoinAtom, removePotentialCoinAtom, setLoadingAtom, setPortfolioAtom } from '../../store'
import { CoinGeckoAPI } from '../../services/api'
import { PotentialCoinsService } from '../../services/potentialCoins'
import { RebalancingService } from '../../services/rebalancing'
import { StopLossService } from '../../services/stopLoss'
import LoadingOverlay from '../../components/ui/LoadingOverlay'
import Dialog from '../../components/ui/Dialog'
import { MarketSentimentWidget } from '../../components/MarketSentimentWidget'
import {
  DashboardHeader,
  PortfolioHoldings,
  PortfolioPerformance,
  PortfolioRebalancing,
  PotentialCoins
} from './index'

const DashboardPage: React.FC = () => {
  const [portfolio] = useAtom(portfolioAtom)
  const [potentialCoins] = useAtom(potentialCoinsAtom)
  const [, addPotentialCoin] = useAtom(addPotentialCoinAtom)
  const [, removePotentialCoin] = useAtom(removePotentialCoinAtom)
  const [isLoading, setIsLoading] = useAtom(setLoadingAtom)
  const [, setPortfolio] = useAtom(setPortfolioAtom)
  const navigate = useNavigate()
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date())
  const [rebalancingRecommendation, setRebalancingRecommendation] = useState(() => {
    return portfolio ? RebalancingService.analyzePortfolio(portfolio) : null
  })
  const [stopLossAnalysis, setStopLossAnalysis] = useState(() => {
    return portfolio ? StopLossService.analyzePortfolio(portfolio) : null
  })

  const [showResetDialog, setShowResetDialog] = useState(false)

  // Update timestamp when data is refreshed
  const updateTimestamp = useCallback(() => {
    const now = new Date()
    console.log('Updating timestamp to:', now.toLocaleString())
    setLastUpdated(now)
  }, [])

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

  // Recalculate rebalancing recommendation and stop loss analysis when portfolio changes
  useEffect(() => {
    if (portfolio) {
      const newRecommendation = RebalancingService.analyzePortfolio(portfolio)
      const newStopLossAnalysis = StopLossService.analyzePortfolio(portfolio)
      setRebalancingRecommendation(newRecommendation)
      setStopLossAnalysis(newStopLossAnalysis)
    }
  }, [portfolio])

  // Update portfolio with real-time prices (efficient batch request)
  const updatePortfolioPrices = useCallback(async () => {
    if (!portfolio) return

    // Prevent multiple simultaneous requests
    if (isLoading) {
      console.log('Dashboard - Skipping price update, already loading...')
      return
    }

    // Check if we recently updated (within last 2 minutes)
    const lastUpdate = portfolio.updatedAt ? new Date(portfolio.updatedAt) : null
    const now = new Date()
    if (lastUpdate && (now.getTime() - lastUpdate.getTime()) < 120000) {
      console.log('Dashboard - Skipping price update, data is recent (< 2 minutes)')
      return
    }

    try {
      console.log('Dashboard - Updating portfolio prices...')
      
      // Filter out USDC and get unique coin IDs
      const cryptoAssets = portfolio.assets.filter(asset => asset.id !== 'usd-coin')
      
      if (cryptoAssets.length > 0) {
        // Get batch price data for specific portfolio assets
        const cryptoIds = cryptoAssets.map(asset => asset.id)
        const batchData = await CoinGeckoAPI.getCryptocurrenciesByIds(cryptoIds)
        const priceMap = new Map(batchData.map(coin => [coin.id, coin]))
        
        // Update assets with batch data
        const updatedAssets = portfolio.assets.map(asset => {
          if (asset.id === 'usd-coin') {
            return {
              ...asset,
              current_price: 1.00,
              price_change_percentage_24h: 0.00,
              price_change_percentage_7d: 0.00
            }
          }

          const currentData = priceMap.get(asset.id)
          if (currentData) {
            // Calculate new value and profit/loss
            const newValue = asset.quantity * currentData.current_price
            const profitLoss = newValue - (asset.quantity * asset.current_price)
            const profitLossPercentage = ((newValue - (asset.quantity * asset.current_price)) / (asset.quantity * asset.current_price)) * 100

            return {
              ...asset,
              current_price: currentData.current_price,
              price_change_percentage_24h: currentData.price_change_percentage_24h,
              price_change_percentage_7d: currentData.price_change_percentage_7d,
              value: newValue,
              profitLoss,
              profitLossPercentage
            }
          }
          
          // Return original asset if no update data found
          return asset
        })

        // Calculate new portfolio totals
        const newTotalValue = updatedAssets.reduce((sum, asset) => sum + asset.value, 0)
        const newTotalProfitLoss = updatedAssets.reduce((sum, asset) => sum + asset.profitLoss, 0)
        const newTotalProfitLossPercentage = ((newTotalValue - portfolio.startingAmount) / portfolio.startingAmount) * 100

        // Update portfolio allocations
        const updatedAssetsWithAllocation = updatedAssets.map(asset => ({
          ...asset,
          allocation: (asset.value / newTotalValue) * 100
        }))

        const updatedPortfolio = {
          ...portfolio,
          totalValue: newTotalValue,
          totalProfitLoss: newTotalProfitLoss,
          totalProfitLossPercentage: newTotalProfitLossPercentage,
          assets: updatedAssetsWithAllocation,
          updatedAt: new Date()
        }

        console.log('Dashboard - Updated portfolio:', {
          totalValue: newTotalValue,
          totalProfitLoss: newTotalProfitLoss,
          totalProfitLossPercentage: newTotalProfitLossPercentage
        })

        setPortfolio(updatedPortfolio)
        updateTimestamp()
      }
    } catch (error) {
      console.error('Error updating portfolio prices:', error)
    }
  }, [portfolio, setPortfolio, updateTimestamp, isLoading])

  const analyzeForPotentialCoins = useCallback(async () => {
    if (!portfolio) return

    setIsLoading(true)
    try {
      // Find potential coins using the new service
      const newPotentialCoins = await PotentialCoinsService.findPotentialCoins(portfolio)

      // Clear ALL existing potential coins first to prevent duplicates
      potentialCoins.forEach(coin => {
        removePotentialCoin(coin.id)
      })
      
      // Add new potential coins
      newPotentialCoins.forEach(coin => {
        addPotentialCoin(coin)
      })

      updateTimestamp()
    } catch (error) {
      console.error('Error analyzing for potential coins:', error)
    } finally {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio, setIsLoading, addPotentialCoin, removePotentialCoin, potentialCoins])

  useEffect(() => {
    if (portfolio) {
      // Update timestamp when portfolio loads
      updateTimestamp()
      
      // Simulate periodic analysis for potential coins
      const interval = setInterval(() => {
        analyzeForPotentialCoins()
      }, 300000) // Check every 5 minutes instead of 30 seconds

      return () => clearInterval(interval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio, analyzeForPotentialCoins])

  // Update portfolio prices and timestamp every 5 minutes
  useEffect(() => {
    if (!portfolio) return

    const interval = setInterval(() => {
      updatePortfolioPrices()
    }, 300000) // Update every 5 minutes instead of 2 minutes

    return () => clearInterval(interval)
  }, [portfolio, updatePortfolioPrices])

  // Update timestamp every 30 seconds to show current time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      console.log('Periodic timestamp update:', now.toLocaleString())
      setLastUpdated(now)
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [setLastUpdated])

  const handleResetPortfolio = () => {
    setShowResetDialog(true)
  }

  const confirmResetPortfolio = () => {
    setPortfolio(null)
    navigate('/setup')
  }

  const handleRefresh = () => {
    updatePortfolioPrices()
    analyzeForPotentialCoins()
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
        <DashboardHeader
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          onResetPortfolio={handleResetPortfolio}
        />

        {/* Portfolio Assets with Stop Loss Recommendations */}
        <PortfolioHoldings
          portfolio={portfolio}
          stopLossAnalysis={stopLossAnalysis}
          onPortfolioUpdate={setPortfolio}
        />

        {/* Market Sentiment Widget */}
        <div className="mb-8">
          <MarketSentimentWidget />
        </div>

        {/* Portfolio Performance */}
        <PortfolioPerformance portfolio={portfolio} />

        {/* Portfolio Rebalancing */}
        <PortfolioRebalancing
          portfolio={portfolio}
          rebalancingRecommendation={rebalancingRecommendation}
          onPortfolioUpdate={setPortfolio}
        />

        {/* Potential Coins */}
        <PotentialCoins
          potentialCoins={potentialCoins}
          portfolio={portfolio}
        />
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