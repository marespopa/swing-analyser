export interface TokenMarketData {
  address: string
  name: string
  symbol: string
  price: number
  priceChange24h: number
  priceChangePercent24h: number
  volume24h: number
  marketCap: number
  liquidity: number
  lastUpdated: string
}

interface BirdeyeResponse {
  success: boolean
  data: TokenMarketData
}

export class BirdeyeApiError extends Error {
  public status?: number
  
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'BirdeyeApiError'
    this.status = status
  }
}

export class BirdeyeApiService {
  private baseUrl = 'https://public-api.birdeye.so/defi/v3'
  private apiKey: string | null = null
  
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }
  
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (this.apiKey) {
      headers['X-API-KEY'] = this.apiKey
    }
    
    return headers
  }
  
  async getTokenMarketData(address: string): Promise<TokenMarketData> {
    try {
      const response = await fetch(`${this.baseUrl}/token/market-data?address=${address}`, {
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new BirdeyeApiError(
            'API key required. Please configure your Birdeye API key in settings.', 
            response.status
          )
        }
        throw new BirdeyeApiError(
          `HTTP error! status: ${response.status}`, 
          response.status
        )
      }
      
      const data: BirdeyeResponse = await response.json()
      
      if (!data.success) {
        throw new BirdeyeApiError('API returned unsuccessful response')
      }
      
      return data.data
    } catch (error) {
      if (error instanceof BirdeyeApiError) {
        throw error
      }
      
      // Handle network errors or other issues
      throw new BirdeyeApiError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }

  async getMultipleTokensMarketData(addresses: string[]): Promise<TokenMarketData[]> {
    const promises = addresses.map(address => this.getTokenMarketData(address))
    return Promise.all(promises)
  }
}

// Export a singleton instance
export const birdeyeApi = new BirdeyeApiService()
