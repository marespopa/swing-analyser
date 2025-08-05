import type { CryptoAsset, PotentialCoin, Portfolio } from '../types'
import { CoinGeckoAPI } from './api'

export class PotentialCoinsService {
  static async findPotentialCoins(portfolio: Portfolio): Promise<PotentialCoin[]> {
    const potentialCoins: PotentialCoin[] = []
    
    try {
      // Get various market data for analysis
      const [trendingCoins, losers, lowMarketCap] = await Promise.all([
        CoinGeckoAPI.getTrendingCryptocurrencies(),
        CoinGeckoAPI.getTopLosers(),
        CoinGeckoAPI.getLowMarketCapCryptocurrencies()
      ])

      // Find Gems (low market cap with high potential)
      const gems = this.analyzeGems(lowMarketCap, portfolio)
      potentialCoins.push(...gems)

      // Find Replacement Items (better alternatives to current holdings)
      const replacements = this.analyzeReplacements(portfolio, trendingCoins)
      potentialCoins.push(...replacements)

      // Find Oversold Coins (good buying opportunities)
      const oversold = this.analyzeOversoldCoins(losers, portfolio)
      potentialCoins.push(...oversold)

      // Find Trending Coins (momentum plays)
      const trending = this.analyzeTrendingCoins(trendingCoins, portfolio)
      potentialCoins.push(...trending)

      // Find Degen Plays (high risk, high reward)
      const degen = this.analyzeDegenPlays(lowMarketCap, portfolio)
      potentialCoins.push(...degen)

      // Sort by confidence and return top 3 results
      return potentialCoins
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3) // Limit to top 3 potential coins

    } catch (error) {
      console.error('Error finding potential coins:', error)
      return []
    }
  }

  private static analyzeGems(lowMarketCap: CryptoAsset[], portfolio: Portfolio): PotentialCoin[] {
    const gems: PotentialCoin[] = []
    const existingIds = new Set(portfolio.assets.map(asset => asset.id))

    for (const coin of lowMarketCap.slice(0, 20)) {
      if (existingIds.has(coin.id)) continue

      // Analyze for gem potential
      const marketCap = coin.market_cap
      const volume = coin.total_volume
      const priceChange = coin.price_change_percentage_24h

      // Criteria for gems: low market cap, increasing volume, positive momentum
      if (marketCap < 100000000 && // Under $100M market cap
          volume > marketCap * 0.1 && // Good volume relative to market cap
          priceChange > 5) { // Positive price movement

        const confidence = Math.min(85, 50 + (priceChange * 2) + (volume / marketCap * 10))
        const expectedReturn = Math.min(200, 50 + priceChange * 3)
        const riskLevel = marketCap < 50000000 ? 'high' : 'medium'

        gems.push({
          id: `gem-${coin.id}`,
          asset: coin,
          category: 'gem',
          reason: `Low market cap gem with strong volume and momentum`,
          confidence: Math.round(confidence),
          suggestedAllocation: 3,
          expectedReturn,
          riskLevel,
          marketSignal: 'Strong volume and momentum in low cap',
          technicalScore: priceChange + (volume / marketCap * 100),
          timestamp: new Date()
        })
      }
    }

    return gems.slice(0, 1) // Return top 1 gem
  }

  private static analyzeReplacements(portfolio: Portfolio, trendingCoins: CryptoAsset[]): PotentialCoin[] {
    const replacements: PotentialCoin[] = []
    const existingIds = new Set(portfolio.assets.map(asset => asset.id))

    for (const coin of trendingCoins.slice(0, 15)) {
      if (existingIds.has(coin.id)) continue

      // Find coins that might be better than current holdings
      const priceChange = coin.price_change_percentage_24h
      const volume = coin.total_volume
      const marketCap = coin.market_cap

      // Criteria: strong performance, good volume, reasonable market cap
      if (priceChange > 10 && volume > 10000000 && marketCap > 50000000) {
        const confidence = Math.min(80, 60 + priceChange)
        const expectedReturn = Math.min(100, 30 + priceChange * 2)
        const riskLevel = marketCap < 100000000 ? 'medium' : 'low'

        replacements.push({
          id: `replacement-${coin.id}`,
          asset: coin,
          category: 'replacement',
          reason: `Strong trending alternative to current holdings`,
          confidence: Math.round(confidence),
          suggestedAllocation: 5,
          expectedReturn,
          riskLevel,
          marketSignal: 'High momentum with strong fundamentals',
          technicalScore: priceChange + (volume / marketCap * 50),
          timestamp: new Date()
        })
      }
    }

    return replacements.slice(0, 1) // Return top 1 replacement
  }

  private static analyzeOversoldCoins(losers: CryptoAsset[], portfolio: Portfolio): PotentialCoin[] {
    const oversold: PotentialCoin[] = []
    const existingIds = new Set(portfolio.assets.map(asset => asset.id))

    for (const coin of losers.slice(0, 20)) {
      if (existingIds.has(coin.id)) continue

      const priceChange = coin.price_change_percentage_24h
      const volume = coin.total_volume
      const marketCap = coin.market_cap

      // Criteria for oversold: significant drop but with volume (not dead)
      if (priceChange < -15 && volume > 5000000 && marketCap > 10000000) {
        const confidence = Math.min(75, 40 + Math.abs(priceChange))
        const expectedReturn = Math.min(80, Math.abs(priceChange) * 2)
        const riskLevel = marketCap < 50000000 ? 'high' : 'medium'

        oversold.push({
          id: `oversold-${coin.id}`,
          asset: coin,
          category: 'oversold',
          reason: `Significantly oversold with potential bounce`,
          confidence: Math.round(confidence),
          suggestedAllocation: 4,
          expectedReturn,
          riskLevel,
          marketSignal: 'Oversold conditions with volume support',
          technicalScore: Math.abs(priceChange) + (volume / marketCap * 20),
          timestamp: new Date()
        })
      }
    }

    return oversold.slice(0, 1) // Return top 1 oversold
  }

  private static analyzeTrendingCoins(trendingCoins: CryptoAsset[], portfolio: Portfolio): PotentialCoin[] {
    const trending: PotentialCoin[] = []
    const existingIds = new Set(portfolio.assets.map(asset => asset.id))

    for (const coin of trendingCoins.slice(0, 10)) {
      if (existingIds.has(coin.id)) continue

      const priceChange = coin.price_change_percentage_24h
      const volume = coin.total_volume
      const marketCap = coin.market_cap

      // Criteria: strong momentum with good fundamentals
      if (priceChange > 20 && volume > 20000000 && marketCap > 100000000) {
        const confidence = Math.min(90, 70 + priceChange)
        const expectedReturn = Math.min(150, 40 + priceChange * 2)
        const riskLevel = priceChange > 50 ? 'high' : 'medium'

        trending.push({
          id: `trending-${coin.id}`,
          asset: coin,
          category: 'trending',
          reason: `Strong momentum and trending upward`,
          confidence: Math.round(confidence),
          suggestedAllocation: 6,
          expectedReturn,
          riskLevel,
          marketSignal: 'High momentum with strong volume',
          technicalScore: priceChange + (volume / marketCap * 30),
          timestamp: new Date()
        })
      }
    }

    return trending.slice(0, 1) // Return top 1 trending (already correct)
  }

  private static analyzeDegenPlays(lowMarketCap: CryptoAsset[], portfolio: Portfolio): PotentialCoin[] {
    const degen: PotentialCoin[] = []
    const existingIds = new Set(portfolio.assets.map(asset => asset.id))

    for (const coin of lowMarketCap.slice(0, 30)) {
      if (existingIds.has(coin.id)) continue

      const marketCap = coin.market_cap
      const volume = coin.total_volume
      const priceChange = coin.price_change_percentage_24h

      // Criteria for degen plays: very low market cap, high volatility, some volume
      if (marketCap < 10000000 && // Under $10M market cap
          volume > 100000 && // Some volume
          Math.abs(priceChange) > 20) { // High volatility

        const confidence = Math.min(60, 30 + Math.abs(priceChange))
        const expectedReturn = Math.min(500, 100 + Math.abs(priceChange) * 5)
        const riskLevel = 'high'

        degen.push({
          id: `degen-${coin.id}`,
          asset: coin,
          category: 'degen',
          reason: `Ultra low cap with high volatility - degen play`,
          confidence: Math.round(confidence),
          suggestedAllocation: 2,
          expectedReturn,
          riskLevel,
          marketSignal: 'Ultra low cap with high volatility',
          technicalScore: Math.abs(priceChange) + (volume / marketCap * 200),
          timestamp: new Date()
        })
      }
    }

    return degen.slice(0, 1) // Return top 1 degen play (already correct)
  }

  static getCategoryColor(category: PotentialCoin['category']): string {
    switch (category) {
      case 'gem':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      case 'replacement':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'oversold':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
      case 'trending':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'degen':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
    }
  }

  static getCategoryDescription(category: PotentialCoin['category']): string {
    switch (category) {
      case 'gem':
        return 'Low market cap with high potential'
      case 'replacement':
        return 'Better alternative to current holdings'
      case 'oversold':
        return 'Significantly undervalued'
      case 'trending':
        return 'Strong momentum and trending'
      case 'degen':
        return 'High risk, high reward play'
      default:
        return 'Market opportunity'
    }
  }

  // Normalize technical score to 0-100 scale for consistent interpretation
  static normalizeTechnicalScore(technicalScore: number, category: PotentialCoin['category']): number {
    const maxScore = this.getMaxTechnicalScore(category)
    return Math.min(100, Math.max(0, (technicalScore / maxScore) * 100))
  }

  // Get the maximum technical score for a category (for internal calculations)
  private static getMaxTechnicalScore(category: PotentialCoin['category']): number {
    switch (category) {
      case 'gem':
        return 200 // priceChange (up to 100) + volume/marketCap * 100 (up to 100)
      case 'replacement':
        return 150 // priceChange (up to 100) + volume/marketCap * 50 (up to 50)
      case 'oversold':
        return 120 // abs(priceChange) (up to 100) + volume/marketCap * 20 (up to 20)
      case 'trending':
        return 180 // priceChange (up to 150) + volume/marketCap * 30 (up to 30)
      case 'degen':
        return 500 // abs(priceChange) (up to 300) + volume/marketCap * 200 (up to 200)
      default:
        return 200
    }
  }

  // Format technical score as normalized value (e.g., "85/100")
  static formatTechnicalScore(technicalScore: number, category: PotentialCoin['category']): string {
    const normalizedScore = this.normalizeTechnicalScore(technicalScore, category)
    return `${Math.round(normalizedScore)}/100`
  }

  // Get technical score percentage for color coding (0-100)
  static getTechnicalScorePercentage(technicalScore: number, category: PotentialCoin['category']): number {
    return this.normalizeTechnicalScore(technicalScore, category)
  }
} 