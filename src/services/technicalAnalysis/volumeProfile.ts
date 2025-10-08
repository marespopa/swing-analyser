import type { PriceDataPoint } from '../coingeckoApi'

export interface VolumeProfile {
  priceLevels: Array<{
    price: number
    volume: number
    volumePercent: number
    isHighVolume: boolean
    isSupport: boolean
    isResistance: boolean
  }>
  valueArea: {
    high: number
    low: number
    volume: number
    volumePercent: number
  }
  pointOfControl: {
    price: number
    volume: number
  }
  volumeAtPrice: {
    price: number
    volume: number
    strength: 'weak' | 'moderate' | 'strong' | 'very-strong'
  }[]
  supportLevels: Array<{
    price: number
    volume: number
    strength: number
    touches: number
  }>
  resistanceLevels: Array<{
    price: number
    volume: number
    strength: number
    touches: number
  }>
}

export interface VolumeAnalysis {
  volumeTrend: 'increasing' | 'decreasing' | 'stable'
  volumeSpikes: Array<{
    index: number
    volume: number
    volumeRatio: number
    priceChange: number
    significance: 'low' | 'medium' | 'high'
  }>
  volumeDivergence: Array<{
    index: number
    type: 'bullish' | 'bearish'
    strength: number
    description: string
  }>
  accumulationDistribution: number[]
  onBalanceVolume: number[]
  volumeProfile: VolumeProfile
}

/**
 * Advanced Volume Analysis and Volume Profile
 * Provides comprehensive volume-based insights for better pattern confirmation
 */
export class VolumeProfileAnalysis {
  /**
   * Perform comprehensive volume analysis
   */
  static analyzeVolume(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[]
  ): VolumeAnalysis {
    const volumeTrend = this.calculateVolumeTrend(volumes)
    const volumeSpikes = this.detectVolumeSpikes(data, prices, volumes)
    const volumeDivergence = this.detectVolumeDivergence(prices, volumes)
    const accumulationDistribution = this.calculateAccumulationDistribution(data)
    const onBalanceVolume = this.calculateOnBalanceVolume(data)
    const volumeProfile = this.calculateVolumeProfile(data, prices, volumes)
    
    return {
      volumeTrend,
      volumeSpikes,
      volumeDivergence,
      accumulationDistribution,
      onBalanceVolume,
      volumeProfile
    }
  }

  /**
   * Calculate volume trend over time
   */
  private static calculateVolumeTrend(volumes: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (volumes.length < 20) return 'stable'
    
    const recent20 = volumes.slice(-20)
    const previous20 = volumes.slice(-40, -20)
    
    if (previous20.length === 0) return 'stable'
    
    const recentAvg = recent20.reduce((a, b) => a + b, 0) / recent20.length
    const previousAvg = previous20.reduce((a, b) => a + b, 0) / previous20.length
    
    const change = (recentAvg - previousAvg) / previousAvg
    
    if (change > 0.1) return 'increasing'
    if (change < -0.1) return 'decreasing'
    return 'stable'
  }

  /**
   * Detect significant volume spikes
   */
  private static detectVolumeSpikes(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[]
  ): Array<{
    index: number
    volume: number
    volumeRatio: number
    priceChange: number
    significance: 'low' | 'medium' | 'high'
  }> {
    const spikes: Array<{
      index: number
      volume: number
      volumeRatio: number
      priceChange: number
      significance: 'low' | 'medium' | 'high'
    }> = []
    
    const volumeSMA = this.calculateVolumeSMA(volumes, 20)
    
    for (let i = 20; i < data.length; i++) {
      const currentVolume = volumes[i]
      const avgVolume = volumeSMA[i]
      const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1
      
      if (volumeRatio > 1.5) { // At least 1.5x average volume
        const priceChange = i > 0 ? (prices[i] - prices[i - 1]) / prices[i - 1] : 0
        
        let significance: 'low' | 'medium' | 'high' = 'low'
        if (volumeRatio > 3.0) significance = 'high'
        else if (volumeRatio > 2.0) significance = 'medium'
        
        spikes.push({
          index: i,
          volume: currentVolume,
          volumeRatio,
          priceChange,
          significance
        })
      }
    }
    
    return spikes.slice(-10) // Return last 10 spikes
  }

  /**
   * Detect volume divergence patterns
   */
  private static detectVolumeDivergence(
    prices: number[],
    volumes: number[]
  ): Array<{
    index: number
    type: 'bullish' | 'bearish'
    strength: number
    description: string
  }> {
    const divergences: Array<{
      index: number
      type: 'bullish' | 'bearish'
      strength: number
      description: string
    }> = []
    
    const lookback = 10
    
    for (let i = lookback; i < prices.length - lookback; i++) {
      const priceWindow = prices.slice(i - lookback, i + 1)
      const volumeWindow = volumes.slice(i - lookback, i + 1)
      
      // Calculate trends
      const priceTrend = (priceWindow[priceWindow.length - 1] - priceWindow[0]) / priceWindow[0]
      const volumeTrend = (volumeWindow[volumeWindow.length - 1] - volumeWindow[0]) / volumeWindow[0]
      
      // Bullish divergence: price down, volume down (less selling pressure)
      if (priceTrend < -0.02 && volumeTrend < -0.1) {
        const strength = Math.abs(priceTrend) * Math.abs(volumeTrend) * 100
        divergences.push({
          index: i,
          type: 'bullish',
          strength,
          description: 'Price declining with decreasing volume (bullish divergence)'
        })
      }
      
      // Bearish divergence: price up, volume down (less buying pressure)
      if (priceTrend > 0.02 && volumeTrend < -0.1) {
        const strength = Math.abs(priceTrend) * Math.abs(volumeTrend) * 100
        divergences.push({
          index: i,
          type: 'bearish',
          strength,
          description: 'Price rising with decreasing volume (bearish divergence)'
        })
      }
    }
    
    return divergences.slice(-5) // Return last 5 divergences
  }

  /**
   * Calculate Accumulation/Distribution Line
   */
  private static calculateAccumulationDistribution(data: PriceDataPoint[]): number[] {
    const ad: number[] = []
    let cumulativeAD = 0
    
    for (let i = 0; i < data.length; i++) {
      const current = data[i]
      
      if (current.high && current.low && current.close && current.volume) {
        const high = current.high
        const low = current.low
        const close = current.close
        const volume = current.volume
        
        const moneyFlowMultiplier = ((close - low) - (high - close)) / (high - low)
        const moneyFlowVolume = moneyFlowMultiplier * volume
        
        cumulativeAD += moneyFlowVolume
        ad.push(cumulativeAD)
      } else {
        ad.push(cumulativeAD)
      }
    }
    
    return ad
  }

  /**
   * Calculate On-Balance Volume (OBV)
   */
  private static calculateOnBalanceVolume(data: PriceDataPoint[]): number[] {
    const obv: number[] = []
    let cumulativeOBV = 0
    
    for (let i = 0; i < data.length; i++) {
      const current = data[i]
      const previous = i > 0 ? data[i - 1] : current
      
      if (current.close && current.volume) {
        const currentClose = current.close
        const previousClose = previous.close || currentClose
        const volume = current.volume
        
        if (currentClose > previousClose) {
          cumulativeOBV += volume
        } else if (currentClose < previousClose) {
          cumulativeOBV -= volume
        }
        // If close is equal, OBV stays the same
        
        obv.push(cumulativeOBV)
      } else {
        obv.push(cumulativeOBV)
      }
    }
    
    return obv
  }

  /**
   * Calculate comprehensive volume profile
   */
  private static calculateVolumeProfile(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[]
  ): VolumeProfile {
    const priceLevels = this.calculatePriceLevels(data, prices, volumes)
    const valueArea = this.calculateValueArea(priceLevels)
    const pointOfControl = this.calculatePointOfControl(priceLevels)
    const volumeAtPrice = this.calculateVolumeAtPrice(priceLevels)
    const supportLevels = this.identifySupportLevels(priceLevels)
    const resistanceLevels = this.identifyResistanceLevels(priceLevels)
    
    return {
      priceLevels,
      valueArea,
      pointOfControl,
      volumeAtPrice,
      supportLevels,
      resistanceLevels
    }
  }

  /**
   * Calculate price levels with volume distribution
   */
  private static calculatePriceLevels(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[]
  ): Array<{
    price: number
    volume: number
    volumePercent: number
    isHighVolume: boolean
    isSupport: boolean
    isResistance: boolean
  }> {
    const priceVolumeMap = new Map<number, number>()
    const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0)
    
    // Group volume by price levels
    for (let i = 0; i < data.length; i++) {
      const price = prices[i]
      const volume = volumes[i] || 0
      
      // Round price to nearest 0.1% for grouping
      const roundedPrice = Math.round(price * 1000) / 1000
      
      if (priceVolumeMap.has(roundedPrice)) {
        priceVolumeMap.set(roundedPrice, priceVolumeMap.get(roundedPrice)! + volume)
      } else {
        priceVolumeMap.set(roundedPrice, volume)
      }
    }
    
    // Convert to array and calculate percentages
    const priceLevels = Array.from(priceVolumeMap.entries()).map(([price, volume]) => ({
      price,
      volume,
      volumePercent: (volume / totalVolume) * 100,
      isHighVolume: false,
      isSupport: false,
      isResistance: false
    }))
    
    // Sort by volume (highest first)
    priceLevels.sort((a, b) => b.volume - a.volume)
    
    // Identify high volume levels (top 20%)
    const highVolumeThreshold = priceLevels[Math.floor(priceLevels.length * 0.2)]?.volume || 0
    priceLevels.forEach(level => {
      level.isHighVolume = level.volume >= highVolumeThreshold
    })
    
    // Identify support and resistance levels
    const sortedByPrice = [...priceLevels].sort((a, b) => a.price - b.price)
    const currentPrice = prices[prices.length - 1]
    
    sortedByPrice.forEach(level => {
      if (level.price < currentPrice && level.isHighVolume) {
        level.isSupport = true
      } else if (level.price > currentPrice && level.isHighVolume) {
        level.isResistance = true
      }
    })
    
    return priceLevels
  }

  /**
   * Calculate Value Area (70% of volume)
   */
  private static calculateValueArea(priceLevels: Array<{
    price: number
    volume: number
    volumePercent: number
  }>): {
    high: number
    low: number
    volume: number
    volumePercent: number
  } {
    // Sort by price
    const sortedLevels = [...priceLevels].sort((a, b) => a.price - b.price)
    
    let cumulativeVolume = 0
    const targetVolume = 70 // 70% of total volume
    let endIndex = sortedLevels.length - 1
    
    // Find the range that contains 70% of volume
    for (let i = 0; i < sortedLevels.length; i++) {
      cumulativeVolume += sortedLevels[i].volumePercent
      if (cumulativeVolume >= targetVolume) {
        endIndex = i
        break
      }
    }
    
    const valueAreaLevels = sortedLevels.slice(0, endIndex + 1)
    const high = Math.max(...valueAreaLevels.map(l => l.price))
    const low = Math.min(...valueAreaLevels.map(l => l.price))
    const volume = valueAreaLevels.reduce((sum, l) => sum + l.volume, 0)
    const volumePercent = valueAreaLevels.reduce((sum, l) => sum + l.volumePercent, 0)
    
    return { high, low, volume, volumePercent }
  }

  /**
   * Calculate Point of Control (highest volume price)
   */
  private static calculatePointOfControl(priceLevels: Array<{
    price: number
    volume: number
  }>): {
    price: number
    volume: number
  } {
    const poc = priceLevels.reduce((max, current) => 
      current.volume > max.volume ? current : max
    )
    
    return { price: poc.price, volume: poc.volume }
  }

  /**
   * Calculate volume at price with strength ratings
   */
  private static calculateVolumeAtPrice(priceLevels: Array<{
    price: number
    volume: number
    volumePercent: number
  }>): Array<{
    price: number
    volume: number
    strength: 'weak' | 'moderate' | 'strong' | 'very-strong'
  }> {
    const maxVolume = Math.max(...priceLevels.map(l => l.volume))
    
    return priceLevels.map(level => {
      const volumeRatio = level.volume / maxVolume
      let strength: 'weak' | 'moderate' | 'strong' | 'very-strong' = 'weak'
      
      if (volumeRatio >= 0.8) strength = 'very-strong'
      else if (volumeRatio >= 0.6) strength = 'strong'
      else if (volumeRatio >= 0.4) strength = 'moderate'
      
      return {
        price: level.price,
        volume: level.volume,
        strength
      }
    }).sort((a, b) => b.volume - a.volume)
  }

  /**
   * Identify support levels from volume profile
   */
  private static identifySupportLevels(priceLevels: Array<{
    price: number
    volume: number
    volumePercent: number
    isSupport: boolean
  }>): Array<{
    price: number
    volume: number
    strength: number
    touches: number
  }> {
    return priceLevels
      .filter(level => level.isSupport)
      .map(level => ({
        price: level.price,
        volume: level.volume,
        strength: level.volumePercent,
        touches: Math.floor(level.volumePercent / 5) // Estimate touches based on volume
      }))
      .sort((a, b) => b.strength - a.strength)
  }

  /**
   * Identify resistance levels from volume profile
   */
  private static identifyResistanceLevels(priceLevels: Array<{
    price: number
    volume: number
    volumePercent: number
    isResistance: boolean
  }>): Array<{
    price: number
    volume: number
    strength: number
    touches: number
  }> {
    return priceLevels
      .filter(level => level.isResistance)
      .map(level => ({
        price: level.price,
        volume: level.volume,
        strength: level.volumePercent,
        touches: Math.floor(level.volumePercent / 5) // Estimate touches based on volume
      }))
      .sort((a, b) => b.strength - a.strength)
  }

  /**
   * Calculate volume moving average
   */
  private static calculateVolumeSMA(volumes: number[], period: number): number[] {
    const sma: number[] = []
    
    for (let i = 0; i < volumes.length; i++) {
      if (i < period - 1) {
        sma.push(NaN)
      } else {
        const sum = volumes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
        sma.push(sum / period)
      }
    }
    
    return sma
  }
}
