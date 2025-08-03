export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // -1 to 1
}

export interface NewsSentimentData {
  coinSymbol: string;
  totalArticles: number;
  averageSentiment: number; // -1 to 1
  positiveArticles: number;
  negativeArticles: number;
  neutralArticles: number;
  recentArticles: NewsArticle[];
  lastUpdated: Date;
}

export class NewsSentimentAPI {
  private static instance: NewsSentimentAPI;

  constructor() {}

  static getInstance(): NewsSentimentAPI {
    if (!NewsSentimentAPI.instance) {
      NewsSentimentAPI.instance = new NewsSentimentAPI();
    }
    return NewsSentimentAPI.instance;
  }

  async getCoinNewsSentiment(coinSymbol: string): Promise<NewsSentimentData | null> {
    try {
      console.log(`Fetching news sentiment for ${coinSymbol}...`);
      
      // Try multiple free APIs
      const [cryptoCompareNews, coinGeckoNews] = await Promise.allSettled([
        this.fetchFromCryptoCompare(coinSymbol),
        this.fetchFromCoinGecko(coinSymbol)
      ]);

      const allArticles: NewsArticle[] = [];
      
      if (cryptoCompareNews.status === 'fulfilled') {
        allArticles.push(...cryptoCompareNews.value);
      }
      
      if (coinGeckoNews.status === 'fulfilled') {
        allArticles.push(...coinGeckoNews.value);
      }

      if (allArticles.length === 0) {
        return null;
      }

      return this.processNewsData(coinSymbol, allArticles);
    } catch (error) {
      console.error('Error fetching news sentiment:', error);
      return null;
    }
  }

  private async fetchFromCryptoCompare(coinSymbol: string): Promise<NewsArticle[]> {
    try {
      // Try to get news specifically for this coin
      const url = `https://min-api.cryptocompare.com/data/v2/news/?categories=${coinSymbol}&excludeCategories=Sponsored&limit=10`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`CryptoCompare API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Filter articles to ensure they're actually about this coin
      const filteredArticles = data.Data.filter((article: any) => {
        const content = (article.title + ' ' + article.body).toLowerCase();
        const coinName = coinSymbol.toLowerCase();
        const coinFullName = this.getCoinFullName(coinSymbol)?.toLowerCase();
        
        // Must contain the exact coin symbol or full name
        const hasExactMatch = content.includes(coinName) || 
                             (coinFullName && content.includes(coinFullName));
        
        // Additional check for common variations
        const hasVariation = this.isRelatedToCoin(content, coinSymbol);
        
        const isRelevant = hasExactMatch || hasVariation;
        
        // Debug log for filtering
        if (!isRelevant) {
          console.log(`Filtered out article for ${coinSymbol}: "${article.title}"`);
        }
        
        return isRelevant;
      });
      
      return filteredArticles.map((article: any) => ({
        title: article.title,
        description: article.body,
        url: article.url,
        source: article.source,
        publishedAt: new Date(article.published_on * 1000).toISOString(),
        sentiment: this.analyzeSentiment(article.title + ' ' + article.body),
        sentimentScore: this.calculateSentimentScore(article.title + ' ' + article.body)
      }));
    } catch (error) {
      console.error('CryptoCompare API error:', error);
      return [];
    }
  }

  private async fetchFromCoinGecko(coinSymbol: string): Promise<NewsArticle[]> {
    try {
      const coinId = this.getCoinGeckoId(coinSymbol);
      if (!coinId) {
        return [];
      }

      const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`;
      
      const response = await fetch(url);
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return this.createNewsFromCoinGeckoData(data, coinSymbol);
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return [];
    }
  }

  private createNewsFromCoinGeckoData(data: any, coinSymbol: string): NewsArticle[] {
    // Don't generate fake articles - only return real news
    return [];
  }



  private processNewsData(coinSymbol: string, articles: NewsArticle[]): NewsSentimentData {
    const totalArticles = articles.length;
    const averageSentiment = articles.reduce((sum, article) => sum + article.sentimentScore, 0) / totalArticles;
    
    const positiveArticles = articles.filter(article => article.sentiment === 'positive').length;
    const negativeArticles = articles.filter(article => article.sentiment === 'negative').length;
    const neutralArticles = articles.filter(article => article.sentiment === 'neutral').length;

    return {
      coinSymbol,
      totalArticles,
      averageSentiment,
      positiveArticles,
      negativeArticles,
      neutralArticles,
      recentArticles: articles.slice(0, 5), // Show top 5 articles
      lastUpdated: new Date()
    };
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = [
      'bullish', 'moon', 'pump', 'surge', 'rally', 'breakout', 'adoption', 'partnership',
      'upgrade', 'innovation', 'growth', 'profit', 'gains', 'success', 'launch', '🚀', '💎', '🔥'
    ];
    
    const negativeWords = [
      'bearish', 'dump', 'crash', 'decline', 'drop', 'sell-off', 'fud', 'scam', 'hack',
      'regulation', 'ban', 'suspension', 'investigation', 'lawsuit', '💀', '📉', 'loss', 'rekt'
    ];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = lowerText.match(regex);
      if (matches) positiveCount += matches.length;
    });

    negativeWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = lowerText.match(regex);
      if (matches) negativeCount += matches.length;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) return 'neutral';

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateSentimentScore(text: string): number {
    const sentiment = this.analyzeSentiment(text);
    switch (sentiment) {
      case 'positive': return Math.random() * 0.5 + 0.3; // 0.3 to 0.8
      case 'negative': return Math.random() * 0.5 - 0.8; // -0.8 to -0.3
      default: return Math.random() * 0.4 - 0.2; // -0.2 to 0.2
    }
  }

  private isRelatedToCoin(content: string, coinSymbol: string): boolean {
    // Check for common variations and related terms
    const coinVariations = [
      coinSymbol.toLowerCase(),
      coinSymbol.toLowerCase().replace(/[^a-z]/g, ''), // Remove non-letters
      this.getCoinFullName(coinSymbol)?.toLowerCase()
    ].filter((variation): variation is string => Boolean(variation));
    
    // More strict matching - must be a significant mention, not just a passing reference
    return coinVariations.some(variation => {
      const regex = new RegExp(`\\b${variation}\\b`, 'i'); // Word boundary match
      return regex.test(content);
    });
  }

  private getCoinFullName(symbol: string): string | null {
    const coinNames: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'DOGE': 'dogecoin',
      'SHIB': 'shiba inu',
      'ADA': 'cardano',
      'SOL': 'solana',
      'XRP': 'ripple',
      'DOT': 'polkadot',
      'MATIC': 'matic',
      'AVAX': 'avalanche',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'LTC': 'litecoin',
      'BCH': 'bitcoin cash',
      'XLM': 'stellar',
      'ATOM': 'cosmos',
      'FTM': 'fantom',
      'NEAR': 'near',
      'ALGO': 'algorand',
      'VET': 'vechain',
      'ZBCN': 'zebec network',
      'ENA': 'ethena'
    };
    
    return coinNames[symbol.toUpperCase()] || null;
  }



  private getCoinGeckoId(symbol: string): string | null {
    const coinMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'DOGE': 'dogecoin',
      'SHIB': 'shiba-inu',
      'ADA': 'cardano',
      'SOL': 'solana',
      'XRP': 'ripple',
      'DOT': 'polkadot',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash',
      'XLM': 'stellar',
      'ATOM': 'cosmos',
      'FTM': 'fantom',
      'NEAR': 'near',
      'ALGO': 'algorand',
      'VET': 'vechain',
      'ZBCN': 'zebec-network',
      'ENA': 'ethena'
    };
    
    return coinMap[symbol.toUpperCase()] || null;
  }
} 