// Rate limiter utility to manage API requests
// CoinGecko free tier: 30 requests per minute

class RateLimiter {
  private requestTimes: number[] = []
  private readonly maxRequests = 30
  private readonly timeWindow = 60000 // 1 minute in milliseconds

  // Check if we can make a request
  canMakeRequest(): boolean {
    const now = Date.now()
    
    // Remove old requests outside the time window
    this.requestTimes = this.requestTimes.filter(time => now - time < this.timeWindow)
    
    return this.requestTimes.length < this.maxRequests
  }

  // Record a request
  recordRequest(): void {
    this.requestTimes.push(Date.now())
  }

  // Get time until next available slot
  getTimeUntilNextSlot(): number {
    if (this.canMakeRequest()) {
      return 0
    }

    const now = Date.now()
    const oldestRequest = Math.min(...this.requestTimes)
    return this.timeWindow - (now - oldestRequest)
  }

  // Wait until we can make a request
  async waitForSlot(): Promise<void> {
    const waitTime = this.getTimeUntilNextSlot()
    if (waitTime > 0) {
      console.log(`Rate limit: waiting ${Math.ceil(waitTime / 1000)}s for next available slot`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  // Get current usage info
  getUsageInfo(): { current: number; remaining: number; resetTime: number } {
    const now = Date.now()
    this.requestTimes = this.requestTimes.filter(time => now - time < this.timeWindow)
    
    const current = this.requestTimes.length
    const remaining = Math.max(0, this.maxRequests - current)
    const resetTime = this.requestTimes.length > 0 
      ? Math.max(...this.requestTimes) + this.timeWindow
      : now

    return { current, remaining, resetTime }
  }
}

export const rateLimiter = new RateLimiter() 