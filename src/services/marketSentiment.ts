import { CoinGeckoAPI } from './api'
import type { CryptoAsset } from '../types'

export interface MarketSentiment {
  overallSentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number // 0-100
  indicators: {
    fearGreedIndex: number // 0-100
    bitcoinDominance: number // percentage
    altcoinSeasonIndex: number // 0-100
    marketMomentum: number // -100 to 100
    volatilityIndex: number // 0-100
  }
  signals: {
    isAltcoinSeason: boolean
    isBullMarket: boolean
    isBearMarket: boolean
    shouldRebalance: boolean
    riskLevel: 'low' | 'medium' | 'high'
  }
  analysis: {
    summary: string
    recommendations: string[]
    keyMetrics: {
      totalMarketCap: number
      totalVolume24h: number
      averagePriceChange24h: number
      topPerformers: string[]
      worstPerformers: string[]
    }
  }
  timestamp: Date
}

export interface FearGreedData {
  value: number
  classification: string
  timestamp: Date
}

export class MarketSentimentService {
  // Calculate overall market sentiment based on multiple indicators
  static async getMarketSentiment(): Promise<MarketSentiment> {
    try {
      // Fetch market data
      const topCoins = await CoinGeckoAPI.getTopCryptocurrencies(100)
      const bitcoin = topCoins.find(coin => coin.symbol === 'BTC')
      const ethereum = topCoins.find(coin => coin.symbol === 'ETH')
      
      if (!bitcoin || !ethereum) {
        throw new Error('Bitcoin and Ethereum data required for sentiment analysis')
      }

      // Calculate various indicators
      const fearGreedIndex = await this.calculateFearGreedIndex(topCoins)
      const bitcoinDominance = this.calculateBitcoinDominance(topCoins, bitcoin)
      const altcoinSeasonIndex = this.calculateAltcoinSeasonIndex(topCoins, bitcoin)
      const marketMomentum = this.calculateMarketMomentum(topCoins)
      const volatilityIndex = this.calculateVolatilityIndex(topCoins)

      // Determine overall sentiment
      const sentimentScore = this.calculateSentimentScore({
        fearGreedIndex,
        bitcoinDominance,
        altcoinSeasonIndex,
        marketMomentum,
        volatilityIndex
      })

      const overallSentiment = this.getSentimentClassification(sentimentScore)
      const confidence = Math.abs(sentimentScore)

      // Generate signals
      const signals = this.generateSignals({
        fearGreedIndex,
        bitcoinDominance,
        altcoinSeasonIndex,
        marketMomentum,
        volatilityIndex,
        sentimentScore
      })

      // Generate analysis and recommendations
      const analysis = this.generateAnalysis({
        topCoins,
        bitcoin,
        ethereum,
        signals,
        sentimentScore
      })

      return {
        overallSentiment,
        confidence,
        indicators: {
          fearGreedIndex,
          bitcoinDominance,
          altcoinSeasonIndex,
          marketMomentum,
          volatilityIndex
        },
        signals,
        analysis,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error calculating market sentiment:', error)
      throw new Error('Failed to analyze market sentiment')
    }
  }

  // Calculate Fear & Greed Index based on market metrics
  private static async calculateFearGreedIndex(coins: CryptoAsset[]): Promise<number> {
    // Calculate components of Fear & Greed Index
    const volatility = this.calculateVolatilityComponent(coins)
    const momentum = this.calculateMomentumComponent(coins)
    const social = this.calculateSocialComponent(coins)
    const dominance = this.calculateDominanceComponent(coins)
    const trend = this.calculateTrendComponent(coins)

    // Weighted average of components
    const fearGreedIndex = (
      volatility * 0.25 +
      momentum * 0.25 +
      social * 0.15 +
      dominance * 0.20 +
      trend * 0.15
    )

    return Math.max(0, Math.min(100, fearGreedIndex))
  }

  private static calculateVolatilityComponent(coins: CryptoAsset[]): number {
    const avgVolatility = coins.reduce((sum, coin) => 
      sum + Math.abs(coin.price_change_percentage_24h), 0
    ) / coins.length

    // Higher volatility = higher fear (lower index)
    return Math.max(0, 100 - (avgVolatility * 2))
  }

  private static calculateMomentumComponent(coins: CryptoAsset[]): number {
    const positiveChanges = coins.filter(coin => coin.price_change_percentage_24h > 0).length
    const momentumRatio = positiveChanges / coins.length

    // More positive changes = higher greed (higher index)
    return momentumRatio * 100
  }

  private static calculateSocialComponent(coins: CryptoAsset[]): number {
    // Simplified social sentiment based on volume
    const avgVolume = coins.reduce((sum, coin) => sum + coin.total_volume, 0) / coins.length
    const maxVolume = Math.max(...coins.map(coin => coin.total_volume))
    
    // Higher volume relative to max = higher social interest
    return (avgVolume / maxVolume) * 100
  }

  private static calculateDominanceComponent(coins: CryptoAsset[]): number {
    const bitcoin = coins.find(coin => coin.symbol === 'BTC')
    if (!bitcoin) return 50

    const totalMarketCap = coins.reduce((sum, coin) => sum + coin.market_cap, 0)
    const bitcoinDominance = (bitcoin.market_cap / totalMarketCap) * 100

    // Lower dominance = higher greed (altcoin season)
    return Math.max(0, 100 - bitcoinDominance)
  }

  private static calculateTrendComponent(coins: CryptoAsset[]): number {
    const avgPriceChange = coins.reduce((sum, coin) => 
      sum + coin.price_change_percentage_24h, 0
    ) / coins.length

    // Positive trend = higher greed
    return Math.max(0, Math.min(100, 50 + avgPriceChange))
  }

  // Calculate Bitcoin Dominance
  private static calculateBitcoinDominance(coins: CryptoAsset[], bitcoin: CryptoAsset): number {
    const totalMarketCap = coins.reduce((sum, coin) => sum + coin.market_cap, 0)
    return (bitcoin.market_cap / totalMarketCap) * 100
  }

  // Calculate Altcoin Season Index
  private static calculateAltcoinSeasonIndex(coins: CryptoAsset[], bitcoin: CryptoAsset): number {
    // Altcoin season indicators:
    // 1. Bitcoin dominance below 40%
    // 2. 75% of top 50 coins outperforming Bitcoin in 90 days
    // 3. High altcoin volume relative to Bitcoin

    const bitcoinDominance = this.calculateBitcoinDominance(coins, bitcoin)
    const bitcoinPerformance = bitcoin.price_change_percentage_24h

    // Calculate how many altcoins are outperforming Bitcoin
    const outperformingAltcoins = coins
      .filter(coin => coin.symbol !== 'BTC')
      .filter(coin => coin.price_change_percentage_24h > bitcoinPerformance)
      .length

    const totalAltcoins = coins.length - 1
    const outperformanceRatio = outperformingAltcoins / totalAltcoins

    // Calculate altcoin season score
    let altcoinSeasonScore = 0

    // Bitcoin dominance factor (lower = more altcoin season)
    if (bitcoinDominance < 40) altcoinSeasonScore += 40
    else if (bitcoinDominance < 50) altcoinSeasonScore += 20
    else if (bitcoinDominance < 60) altcoinSeasonScore += 10

    // Altcoin outperformance factor
    altcoinSeasonScore += outperformanceRatio * 40

    // Volume factor (simplified)
    const altcoinVolume = coins
      .filter(coin => coin.symbol !== 'BTC')
      .reduce((sum, coin) => sum + coin.total_volume, 0)
    const bitcoinVolume = bitcoin.total_volume
    const volumeRatio = altcoinVolume / (bitcoinVolume + altcoinVolume)
    altcoinSeasonScore += volumeRatio * 20

    return Math.max(0, Math.min(100, altcoinSeasonScore))
  }

  // Calculate Market Momentum
  private static calculateMarketMomentum(coins: CryptoAsset[]): number {
    const avgPriceChange = coins.reduce((sum, coin) => 
      sum + coin.price_change_percentage_24h, 0
    ) / coins.length

    // Convert to -100 to 100 scale
    return Math.max(-100, Math.min(100, avgPriceChange * 2))
  }

  // Calculate Volatility Index
  private static calculateVolatilityIndex(coins: CryptoAsset[]): number {
    const volatilities = coins.map(coin => Math.abs(coin.price_change_percentage_24h))
    const avgVolatility = volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length
    
    // Normalize to 0-100 scale
    return Math.min(100, avgVolatility * 2)
  }

  // Calculate overall sentiment score
  private static calculateSentimentScore(indicators: {
    fearGreedIndex: number
    bitcoinDominance: number
    altcoinSeasonIndex: number
    marketMomentum: number
    volatilityIndex: number
  }): number {
    const { fearGreedIndex, bitcoinDominance, altcoinSeasonIndex, marketMomentum, volatilityIndex } = indicators

    // Fear & Greed Index (0-100, higher = more greedy/bullish)
    const fearGreedScore = (fearGreedIndex - 50) * 2 // -100 to 100

    // Bitcoin Dominance (lower = more bullish for altcoins)
    const dominanceScore = (50 - bitcoinDominance) * 2 // -100 to 100

    // Altcoin Season Index (0-100, higher = more altcoin season)
    const altcoinSeasonScore = (altcoinSeasonIndex - 50) * 2 // -100 to 100

    // Market Momentum (already -100 to 100)
    const momentumScore = marketMomentum

    // Volatility (lower = more stable/bullish)
    const volatilityScore = (50 - volatilityIndex) * 2 // -100 to 100

    // Weighted average
    const sentimentScore = (
      fearGreedScore * 0.25 +
      dominanceScore * 0.20 +
      altcoinSeasonScore * 0.25 +
      momentumScore * 0.20 +
      volatilityScore * 0.10
    )

    return Math.max(-100, Math.min(100, sentimentScore))
  }

  // Classify sentiment based on score
  private static getSentimentClassification(score: number): 'bullish' | 'bearish' | 'neutral' {
    if (score > 20) return 'bullish'
    if (score < -20) return 'bearish'
    return 'neutral'
  }

  // Generate trading signals
  private static generateSignals(indicators: {
    fearGreedIndex: number
    bitcoinDominance: number
    altcoinSeasonIndex: number
    marketMomentum: number
    volatilityIndex: number
    sentimentScore: number
  }): MarketSentiment['signals'] {
    const { fearGreedIndex, altcoinSeasonIndex, volatilityIndex, sentimentScore } = indicators

    const isAltcoinSeason = altcoinSeasonIndex > 60
    const isBullMarket = sentimentScore > 20
    const isBearMarket = sentimentScore < -20
    const shouldRebalance = Math.abs(sentimentScore) > 30

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'medium'
    if (volatilityIndex > 70 || fearGreedIndex > 80) riskLevel = 'high'
    else if (volatilityIndex < 30 && fearGreedIndex < 30) riskLevel = 'low'

    return {
      isAltcoinSeason,
      isBullMarket,
      isBearMarket,
      shouldRebalance,
      riskLevel
    }
  }

  // Generate analysis and recommendations
  private static generateAnalysis(data: {
    topCoins: CryptoAsset[]
    bitcoin: CryptoAsset
    ethereum: CryptoAsset
    signals: MarketSentiment['signals']
    sentimentScore: number
  }): MarketSentiment['analysis'] {
    const { topCoins, signals } = data

    // Calculate key metrics
    const totalMarketCap = topCoins.reduce((sum, coin) => sum + coin.market_cap, 0)
    const totalVolume24h = topCoins.reduce((sum, coin) => sum + coin.total_volume, 0)
    const averagePriceChange24h = topCoins.reduce((sum, coin) => sum + coin.price_change_percentage_24h, 0) / topCoins.length

    // Get top and worst performers
    const sortedByPerformance = [...topCoins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    const topPerformers = sortedByPerformance.slice(0, 5).map(coin => coin.symbol)
    const worstPerformers = sortedByPerformance.slice(-5).map(coin => coin.symbol)

    // Generate summary
    let summary = ''
    if (signals.isBullMarket) {
      summary = 'Market is showing bullish signals with strong momentum and positive sentiment.'
    } else if (signals.isBearMarket) {
      summary = 'Market is showing bearish signals with declining momentum and negative sentiment.'
    } else {
      summary = 'Market is in a neutral state with mixed signals and moderate volatility.'
    }

    if (signals.isAltcoinSeason) {
      summary += ' Altcoin season appears to be active with strong altcoin performance relative to Bitcoin.'
    }

    // Generate recommendations
    const recommendations: string[] = []

    if (signals.isBullMarket) {
      recommendations.push('Consider increasing exposure to growth assets')
      recommendations.push('Monitor for potential profit-taking opportunities')
      if (signals.isAltcoinSeason) {
        recommendations.push('Focus on altcoin diversification for maximum growth')
      }
    } else if (signals.isBearMarket) {
      recommendations.push('Consider defensive positioning with stablecoins')
      recommendations.push('Focus on Bitcoin and Ethereum for stability')
      recommendations.push('Avoid aggressive altcoin positions')
    } else {
      recommendations.push('Maintain balanced portfolio allocation')
      recommendations.push('Monitor for trend confirmation')
    }

    if (signals.shouldRebalance) {
      recommendations.push('Portfolio rebalancing recommended due to significant market changes')
    }

    if (signals.riskLevel === 'high') {
      recommendations.push('High market volatility - consider reducing position sizes')
    }

    return {
      summary,
      recommendations,
      keyMetrics: {
        totalMarketCap,
        totalVolume24h,
        averagePriceChange24h,
        topPerformers,
        worstPerformers
      }
    }
  }

  // Get historical sentiment data (simplified)
  static async getHistoricalSentiment(): Promise<MarketSentiment[]> {
    // This would typically fetch historical data from an API
    // For now, return current sentiment as placeholder
    const currentSentiment = await this.getMarketSentiment()
    return [currentSentiment]
  }
} 