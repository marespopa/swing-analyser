import type { PriceDataPoint } from '../coingeckoApi'

export interface DemandZone {
  index: number
  startIndex: number
  endIndex: number
  high: number
  low: number
  strength: 'weak' | 'moderate' | 'strong' | 'very-strong'
  confidence: number
  volumeProfile: {
    totalVolume: number
    averageVolume: number
    volumeRatio: number
  }
  touches: number
  lastTouch: number
  age: number
  isActive: boolean
  description: string
  entryPrice?: number
  stopLoss?: number
  takeProfit?: number
  riskRewardRatio?: number
}

/**
 * Advanced Demand Zones Detection
 * Identifies areas where buying pressure is strong and price is likely to bounce
 */
export class DemandZones {
  /**
   * Detect demand zones using multiple methodologies
   */
  static detectDemandZones(
    data: PriceDataPoint[],
    rsi: number[],
    sma20: number[],
    sma50: number[],
    atr?: number[]
  ): DemandZone[] {
    const zones: DemandZone[] = []
    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Method 1: Volume-based demand zones
    zones.push(...this.detectVolumeBasedZones(data, prices, volumes, rsi))
    
    // Method 2: Support level demand zones
    zones.push(...this.detectSupportBasedZones(data, prices, volumes, sma20, sma50))
    
    // Method 3: RSI oversold bounce zones
    zones.push(...this.detectRSIBounceZones(data, prices, volumes, rsi))
    
    // Method 4: ATR-based demand zones
    if (atr && atr.length > 0) {
      zones.push(...this.detectATRBasedZones(data, prices, volumes, atr))
    }
    
    // Method 5: Fibonacci retracement demand zones
    zones.push(...this.detectFibonacciDemandZones(data, prices, volumes))
    
    // Filter and merge overlapping zones
    return this.filterAndMergeZones(zones, data.length)
  }

  /**
   * Detect demand zones based on volume spikes and price reactions
   */
  private static detectVolumeBasedZones(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[],
    rsi: number[]
  ): DemandZone[] {
    const zones: DemandZone[] = []
    
    // Calculate volume moving average
    const volumeSMA = this.calculateVolumeSMA(volumes, 20)
    
    for (let i = 20; i < data.length - 5; i++) {
      const currentVolume = volumes[i]
      const avgVolume = volumeSMA[i]
      const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1
      
      // Look for volume spikes with price rejection
      if (volumeRatio > 1.5 && rsi[i] < 40) {
        // Find the low point in the next 5 periods
        let lowestPrice = prices[i]
        let lowestIndex = i
        
        for (let j = i; j < Math.min(i + 5, data.length); j++) {
          if (prices[j] < lowestPrice) {
            lowestPrice = prices[j]
            lowestIndex = j
          }
        }
        
        // Check if price bounced from this level
        const bounceStrength = this.calculateBounceStrength(data, lowestIndex, 5)
        
        if (bounceStrength > 0.02) { // At least 2% bounce
          const zone = this.createDemandZone(
            data,
            prices,
            volumes,
            lowestIndex,
            lowestPrice,
            'Volume Spike Bounce',
            volumeRatio,
            bounceStrength
          )
          
          if (zone) zones.push(zone)
        }
      }
    }
    
    return zones
  }

  /**
   * Detect demand zones based on support levels
   */
  private   static detectSupportBasedZones(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[],
    _sma20: number[],
    _sma50: number[]
  ): DemandZone[] {
    const zones: DemandZone[] = []
    
    // Find significant lows (support levels)
    const supportLevels = this.findSupportLevels(prices, 10)
    
    for (const support of supportLevels) {
      const { index, price } = support
      
      // Check if this support has been tested multiple times
      const touches = this.countSupportTouches(prices, price, index, 0.02) // 2% tolerance
      
      if (touches >= 2) {
        // Check for recent bounce from this level
        const recentBounce = this.checkRecentBounce(data, prices, index, 5)
        
        if (recentBounce) {
          const zone = this.createDemandZone(
            data,
            prices,
            volumes,
            index,
            price,
            'Support Level Bounce',
            touches,
            recentBounce
          )
          
          if (zone) zones.push(zone)
        }
      }
    }
    
    return zones
  }

  /**
   * Detect demand zones based on RSI oversold bounces
   */
  private static detectRSIBounceZones(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[],
    rsi: number[]
  ): DemandZone[] {
    const zones: DemandZone[] = []
    
    for (let i = 14; i < data.length - 3; i++) {
      // Look for RSI oversold conditions
      if (rsi[i] < 30 && rsi[i] > rsi[i - 1]) {
        // Find the low point during this oversold period
        let lowestPrice = prices[i]
        let lowestIndex = i
        
        for (let j = Math.max(0, i - 3); j <= i; j++) {
          if (prices[j] < lowestPrice) {
            lowestPrice = prices[j]
            lowestIndex = j
          }
        }
        
        // Check if price bounced significantly
        const bounceStrength = this.calculateBounceStrength(data, lowestIndex, 3)
        
        if (bounceStrength > 0.03) { // At least 3% bounce
          const zone = this.createDemandZone(
            data,
            prices,
            volumes,
            lowestIndex,
            lowestPrice,
            'RSI Oversold Bounce',
            1,
            bounceStrength
          )
          
          if (zone) zones.push(zone)
        }
      }
    }
    
    return zones
  }

  /**
   * Detect demand zones based on ATR levels
   */
  private static detectATRBasedZones(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[],
    atr: number[]
  ): DemandZone[] {
    const zones: DemandZone[] = []
    
    for (let i = 14; i < data.length - 3; i++) {
      const currentATR = atr[i]
      
      // Look for price drops that are 1.5-2x ATR
      const atrDrop = currentATR * 1.5
      const priceDrop = this.calculatePriceDrop(prices, i, 5)
      
      if (priceDrop >= atrDrop) {
        // Find the low point
        let lowestPrice = prices[i]
        let lowestIndex = i
        
        for (let j = Math.max(0, i - 5); j <= i; j++) {
          if (prices[j] < lowestPrice) {
            lowestPrice = prices[j]
            lowestIndex = j
          }
        }
        
        // Check for bounce
        const bounceStrength = this.calculateBounceStrength(data, lowestIndex, 3)
        
        if (bounceStrength > 0.02) {
          const zone = this.createDemandZone(
            data,
            prices,
            volumes,
            lowestIndex,
            lowestPrice,
            'ATR-Based Drop Bounce',
            priceDrop / currentATR,
            bounceStrength
          )
          
          if (zone) zones.push(zone)
        }
      }
    }
    
    return zones
  }

  /**
   * Detect demand zones at Fibonacci retracement levels
   */
  private static detectFibonacciDemandZones(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[]
  ): DemandZone[] {
    const zones: DemandZone[] = []
    
    // Find recent swing high and low
    const swingHigh = this.findSwingHigh(prices, 20)
    const swingLow = this.findSwingLow(prices, 20)
    
    if (!swingHigh || !swingLow) return zones
    
    const range = swingHigh.price - swingLow.price
    const fibLevels = [0.236, 0.382, 0.5, 0.618, 0.786]
    
    for (const level of fibLevels) {
      const fibPrice = swingLow.price + (range * level)
      
      // Find the closest price to this Fibonacci level
      let closestIndex = -1
      let closestDistance = Infinity
      
      for (let i = 0; i < prices.length; i++) {
        const distance = Math.abs(prices[i] - fibPrice)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = i
        }
      }
      
      if (closestIndex >= 0 && closestDistance < fibPrice * 0.02) { // Within 2%
        // Check for bounce from this level
        const bounceStrength = this.calculateBounceStrength(data, closestIndex, 5)
        
        if (bounceStrength > 0.02) {
          const zone = this.createDemandZone(
            data,
            prices,
            volumes,
            closestIndex,
            prices[closestIndex],
            `Fibonacci ${(level * 100).toFixed(1)}% Retracement`,
            1,
            bounceStrength
          )
          
          if (zone) zones.push(zone)
        }
      }
    }
    
    return zones
  }

  /**
   * Create a demand zone object
   */
  private static createDemandZone(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[],
    index: number,
    price: number,
    description: string,
    volumeMultiplier: number,
    bounceStrength: number
  ): DemandZone | null {
    if (index < 0 || index >= data.length) return null
    
    const age = data.length - 1 - index
    
    // Calculate zone strength based on multiple factors
    const strength = this.calculateZoneStrength(
      volumeMultiplier,
      bounceStrength,
      age,
      this.countSupportTouches(prices, price, index, 0.02)
    )
    
    // Calculate confidence
    const confidence = this.calculateZoneConfidence(
      strength,
      bounceStrength,
      volumeMultiplier,
      age
    )
    
    // Calculate volume profile
    const zoneVolume = this.calculateZoneVolume(volumes, index, 3)
    const avgVolume = this.calculateAverageVolume(volumes, 20)
    
    // Calculate risk management levels
    const entryPrice = price * 1.001 // Slightly above the zone
    const stopLoss = price * 0.98 // 2% below the zone
    const takeProfit = price * (1 + bounceStrength * 2) // 2x the bounce strength
    const riskRewardRatio = (takeProfit - entryPrice) / (entryPrice - stopLoss)
    
    return {
      index,
      startIndex: Math.max(0, index - 2),
      endIndex: Math.min(data.length - 1, index + 2),
      high: price * 1.01, // 1% above the zone
      low: price * 0.99,  // 1% below the zone
      strength,
      confidence,
      volumeProfile: {
        totalVolume: zoneVolume,
        averageVolume: avgVolume,
        volumeRatio: avgVolume > 0 ? zoneVolume / avgVolume : 1
      },
      touches: this.countSupportTouches(prices, price, index, 0.02),
      lastTouch: index,
      age,
      isActive: age < 10, // Active if less than 10 periods old
      description,
      entryPrice,
      stopLoss,
      takeProfit,
      riskRewardRatio
    }
  }

  /**
   * Calculate zone strength based on multiple factors
   */
  private static calculateZoneStrength(
    volumeMultiplier: number,
    bounceStrength: number,
    age: number,
    touches: number
  ): 'weak' | 'moderate' | 'strong' | 'very-strong' {
    let score = 0
    
    // Volume factor
    if (volumeMultiplier > 2) score += 3
    else if (volumeMultiplier > 1.5) score += 2
    else if (volumeMultiplier > 1.2) score += 1
    
    // Bounce strength factor
    if (bounceStrength > 0.05) score += 3
    else if (bounceStrength > 0.03) score += 2
    else if (bounceStrength > 0.02) score += 1
    
    // Age factor (fresher is better)
    if (age < 3) score += 2
    else if (age < 7) score += 1
    
    // Touches factor
    if (touches >= 3) score += 2
    else if (touches >= 2) score += 1
    
    if (score >= 7) return 'very-strong'
    if (score >= 5) return 'strong'
    if (score >= 3) return 'moderate'
    return 'weak'
  }

  /**
   * Calculate zone confidence (0-100)
   */
  private static calculateZoneConfidence(
    strength: string,
    bounceStrength: number,
    volumeMultiplier: number,
    age: number
  ): number {
    let confidence = 0
    
    // Base confidence from strength
    const strengthScores: { [key: string]: number } = { 'weak': 20, 'moderate': 40, 'strong': 60, 'very-strong': 80 }
    confidence += strengthScores[strength] || 20
    
    // Bounce strength bonus
    confidence += Math.min(20, bounceStrength * 400)
    
    // Volume bonus
    confidence += Math.min(15, (volumeMultiplier - 1) * 10)
    
    // Age penalty (older zones are less reliable)
    confidence -= Math.min(20, age * 2)
    
    return Math.max(0, Math.min(100, confidence))
  }

  /**
   * Filter and merge overlapping demand zones
   */
  private static filterAndMergeZones(zones: DemandZone[], _dataLength: number): DemandZone[] {
    if (zones.length === 0) return []
    
    // Sort by confidence (highest first)
    const sortedZones = zones.sort((a, b) => b.confidence - a.confidence)
    const mergedZones: DemandZone[] = []
    
    for (const zone of sortedZones) {
      // Check if this zone overlaps with any existing zone
      const overlapping = mergedZones.find(existing => 
        this.zonesOverlap(zone, existing)
      )
      
      if (!overlapping) {
        mergedZones.push(zone)
      } else if (zone.confidence > overlapping.confidence) {
        // Replace the overlapping zone with the better one
        const index = mergedZones.indexOf(overlapping)
        mergedZones[index] = zone
      }
    }
    
    // Return only the most recent and highest confidence zones
    return mergedZones
      .filter(zone => zone.isActive)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5) // Limit to top 5 zones
  }

  /**
   * Check if two zones overlap
   */
  private static zonesOverlap(zone1: DemandZone, zone2: DemandZone): boolean {
    const priceOverlap = !(zone1.high < zone2.low || zone2.high < zone1.low)
    const timeOverlap = !(zone1.endIndex < zone2.startIndex || zone2.endIndex < zone1.startIndex)
    
    return priceOverlap && timeOverlap
  }

  // Helper methods
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

  private static calculateBounceStrength(data: PriceDataPoint[], lowIndex: number, lookAhead: number): number {
    const lowPrice = data[lowIndex].price
    let highestPrice = lowPrice
    
    for (let i = lowIndex; i < Math.min(lowIndex + lookAhead, data.length); i++) {
      if (data[i].price > highestPrice) {
        highestPrice = data[i].price
      }
    }
    
    return (highestPrice - lowPrice) / lowPrice
  }

  private static findSupportLevels(prices: number[], lookback: number): Array<{ index: number; price: number }> {
    const supports: Array<{ index: number; price: number }> = []
    
    for (let i = lookback; i < prices.length - lookback; i++) {
      const currentPrice = prices[i]
      let isSupport = true
      
      // Check if this is a local minimum
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && prices[j] < currentPrice) {
          isSupport = false
          break
        }
      }
      
      if (isSupport) {
        supports.push({ index: i, price: currentPrice })
      }
    }
    
    return supports
  }

  private static countSupportTouches(prices: number[], supportPrice: number, startIndex: number, tolerance: number): number {
    let touches = 0
    const toleranceAmount = supportPrice * tolerance
    
    for (let i = startIndex; i < prices.length; i++) {
      if (Math.abs(prices[i] - supportPrice) <= toleranceAmount) {
        touches++
      }
    }
    
    return touches
  }

  private static checkRecentBounce(data: PriceDataPoint[], _prices: number[], index: number, lookAhead: number): number {
    return this.calculateBounceStrength(data, index, lookAhead)
  }

  private static calculatePriceDrop(prices: number[], currentIndex: number, lookback: number): number {
    const currentPrice = prices[currentIndex]
    let highestPrice = currentPrice
    
    for (let i = Math.max(0, currentIndex - lookback); i < currentIndex; i++) {
      if (prices[i] > highestPrice) {
        highestPrice = prices[i]
      }
    }
    
    return (highestPrice - currentPrice) / highestPrice
  }

  private static findSwingHigh(prices: number[], lookback: number): { index: number; price: number } | null {
    let highestPrice = 0
    let highestIndex = -1
    
    for (let i = lookback; i < prices.length - lookback; i++) {
      const currentPrice = prices[i]
      let isSwingHigh = true
      
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && prices[j] >= currentPrice) {
          isSwingHigh = false
          break
        }
      }
      
      if (isSwingHigh && currentPrice > highestPrice) {
        highestPrice = currentPrice
        highestIndex = i
      }
    }
    
    return highestIndex >= 0 ? { index: highestIndex, price: highestPrice } : null
  }

  private static findSwingLow(prices: number[], lookback: number): { index: number; price: number } | null {
    let lowestPrice = Infinity
    let lowestIndex = -1
    
    for (let i = lookback; i < prices.length - lookback; i++) {
      const currentPrice = prices[i]
      let isSwingLow = true
      
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && prices[j] <= currentPrice) {
          isSwingLow = false
          break
        }
      }
      
      if (isSwingLow && currentPrice < lowestPrice) {
        lowestPrice = currentPrice
        lowestIndex = i
      }
    }
    
    return lowestIndex >= 0 ? { index: lowestIndex, price: lowestPrice } : null
  }

  private static calculateZoneVolume(volumes: number[], index: number, window: number): number {
    let totalVolume = 0
    const start = Math.max(0, index - window)
    const end = Math.min(volumes.length, index + window + 1)
    
    for (let i = start; i < end; i++) {
      totalVolume += volumes[i] || 0
    }
    
    return totalVolume
  }

  private static calculateAverageVolume(volumes: number[], period: number): number {
    const validVolumes = volumes.filter(v => !isNaN(v) && v > 0)
    if (validVolumes.length === 0) return 0
    
    const recentVolumes = validVolumes.slice(-period)
    return recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length
  }
}
