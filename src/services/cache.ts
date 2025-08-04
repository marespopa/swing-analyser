import type { CryptoAsset } from '../types'

interface CoinCacheData {
  topCoins: CryptoAsset[]
  trendingCoins: CryptoAsset[]
  volatileCoins: CryptoAsset[]
  individualCoins: { [id: string]: CryptoAsset }
}

const CACHE_KEYS = {
  COIN_DATA: 'swing-analyser-coin-cache',
  CACHE_SETTINGS: 'swing-analyser-cache-settings'
}

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export class CacheService {
  private static getCacheSettings() {
    const settings = localStorage.getItem(CACHE_KEYS.CACHE_SETTINGS)
    return settings ? JSON.parse(settings) : { enabled: true, duration: DEFAULT_CACHE_DURATION }
  }

  private static setCacheSettings(settings: { enabled: boolean; duration: number }) {
    localStorage.setItem(CACHE_KEYS.CACHE_SETTINGS, JSON.stringify(settings))
  }

  static isEnabled(): boolean {
    return this.getCacheSettings().enabled
  }

  static setEnabled(enabled: boolean) {
    const settings = this.getCacheSettings()
    settings.enabled = enabled
    this.setCacheSettings(settings)
  }

  static getCacheDuration(): number {
    return this.getCacheSettings().duration
  }

  static setCacheDuration(duration: number) {
    const settings = this.getCacheSettings()
    settings.duration = duration
    this.setCacheSettings(settings)
  }

  private static getCacheData(): CoinCacheData {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.COIN_DATA)
      return cached ? JSON.parse(cached) : {
        topCoins: [],
        trendingCoins: [],
        volatileCoins: [],
        individualCoins: {}
      }
    } catch {
      return {
        topCoins: [],
        trendingCoins: [],
        volatileCoins: [],
        individualCoins: {}
      }
    }
  }

  private static setCacheData(data: CoinCacheData) {
    try {
      localStorage.setItem(CACHE_KEYS.COIN_DATA, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save cache data:', error)
    }
  }

  private static isExpired(timestamp: number): boolean {
    const now = Date.now()
    const cacheDuration = this.getCacheDuration()
    return (now - timestamp) > cacheDuration
  }

  static getTopCoins(): CryptoAsset[] | null {
    if (!this.isEnabled()) return null
    
    const cacheData = this.getCacheData()
    if (!cacheData.topCoins.length) return null

    // Check if cache is expired
    const cacheEntry = cacheData.topCoins as unknown as { timestamp?: number }
    if (cacheEntry.timestamp && this.isExpired(cacheEntry.timestamp)) {
      return null
    }

    return cacheData.topCoins
  }

  static setTopCoins(coins: CryptoAsset[]) {
    if (!this.isEnabled()) return

    const cacheData = this.getCacheData()
    cacheData.topCoins = coins
    this.setCacheData(cacheData)
  }

  static getTrendingCoins(): CryptoAsset[] | null {
    if (!this.isEnabled()) return null
    
    const cacheData = this.getCacheData()
    if (!cacheData.trendingCoins.length) return null

    // Check if cache is expired
    const cacheEntry = cacheData.trendingCoins as unknown as { timestamp?: number }
    if (cacheEntry.timestamp && this.isExpired(cacheEntry.timestamp)) {
      return null
    }

    return cacheData.trendingCoins
  }

  static setTrendingCoins(coins: CryptoAsset[]) {
    if (!this.isEnabled()) return

    const cacheData = this.getCacheData()
    cacheData.trendingCoins = coins
    this.setCacheData(cacheData)
  }

  static getVolatileCoins(): CryptoAsset[] | null {
    if (!this.isEnabled()) return null
    
    const cacheData = this.getCacheData()
    if (!cacheData.volatileCoins.length) return null

    // Check if cache is expired
    const cacheEntry = cacheData.volatileCoins as unknown as { timestamp?: number }
    if (cacheEntry.timestamp && this.isExpired(cacheEntry.timestamp)) {
      return null
    }

    return cacheData.volatileCoins
  }

  static setVolatileCoins(coins: CryptoAsset[]) {
    if (!this.isEnabled()) return

    const cacheData = this.getCacheData()
    cacheData.volatileCoins = coins
    this.setCacheData(cacheData)
  }

  static getIndividualCoin(id: string): CryptoAsset | null {
    if (!this.isEnabled()) return null
    
    const cacheData = this.getCacheData()
    const coin = cacheData.individualCoins[id]
    if (!coin) return null

    // Check if cache is expired
    const cacheEntry = coin as unknown as { timestamp?: number }
    if (cacheEntry.timestamp && this.isExpired(cacheEntry.timestamp)) {
      return null
    }

    return coin
  }

  static setIndividualCoin(id: string, coin: CryptoAsset) {
    if (!this.isEnabled()) return

    const cacheData = this.getCacheData()
    cacheData.individualCoins[id] = coin
    this.setCacheData(cacheData)
  }

  static clearCache() {
    try {
      localStorage.removeItem(CACHE_KEYS.COIN_DATA)
      console.log('Cache cleared successfully')
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }

  static getCacheInfo() {
    const cacheData = this.getCacheData()
    const settings = this.getCacheSettings()
    
    return {
      enabled: settings.enabled,
      duration: settings.duration,
      topCoinsCount: cacheData.topCoins.length,
      trendingCoinsCount: cacheData.trendingCoins.length,
      volatileCoinsCount: cacheData.volatileCoins.length,
      individualCoinsCount: Object.keys(cacheData.individualCoins).length
    }
  }
} 