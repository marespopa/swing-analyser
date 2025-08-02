import { Coin } from '../types';

// List of known stablecoins to filter out
const STABLECOINS = [
  'tether', 'usd-coin', 'binance-usd', 'dai', 'frax', 'true-usd', 'paxos-standard',
  'gemini-dollar', 'husd', 'neutrino', 'fei-usd', 'nusd', 'gusd', 'usdd', 'tusd',
  'usdn', 'usdk', 'usdx', 'usdp', 'usdt', 'busd', 'husd', 'gusd', 'dusd', 'susd',
  'eurs', 'eurt', 'jpyc', 'gbpt', 'cadc', 'audc', 'chfc', 'sgdc', 'nzdc', 'seur',
  'stasis-euro', 'euro-coin', 'stasis-eurs', 'euro-coin', 'stasis-eurs',
  // Bridge tokens and wrapped stablecoins
  'polygon-bridged-usdt', 'polygon-bridged-usdc', 'polygon-bridged-dai',
  'wrapped-bitcoin', 'wbtc', 'weth', 'wrapped-ether',
  // Additional stablecoins
  'fei', 'rai', 'lusd', 'alusd', 'gusd', 'husd', 'musd', 'susd', 'yusd',
  'usdk', 'usdn', 'usdp', 'usdx', 'usdt', 'busd', 'dusd', 'susd',
  // Euro stablecoins
  'euro-coin', 'stasis-euro', 'euro-coin', 'stasis-eurs', 'eurs', 'eurt',
  // Other fiat stablecoins
  'jpyc', 'gbpt', 'cadc', 'audc', 'chfc', 'sgdc', 'nzdc', 'seur',
  // Ethena stablecoins
  'ethena-usde', 'usde', 'ethena-usds', 'usds'
];

// Keywords that indicate a coin is likely a stablecoin
const STABLECOIN_KEYWORDS = [
  'usdt', 'usdc', 'busd', 'dai', 'tusd', 'usdd', 'frax', 'lusd', 'alusd',
  'gusd', 'husd', 'musd', 'susd', 'yusd', 'usdk', 'usdn', 'usdp', 'usdx',
  'dusd', 'eurs', 'eurt', 'jpyc', 'gbpt', 'cadc', 'audc', 'chfc', 'sgdc',
  'nzdc', 'seur', 'bridged', 'wrapped', 'polygon-bridged', 'usde', 'usds'
];

// List of known meme coins to potentially filter out (optional)
const MEME_COINS = [
  'dogecoin', 'shiba-inu', 'pepe', 'floki', 'bonk', 'dogwifhat', 'myro', 'book-of-meme',
  'cat-in-a-dogs-world', 'popcat', 'dogelon-mars', 'baby-doge-coin', 'safemoon',
  'doge', 'shib', 'pepe', 'floki', 'bonk', 'wif', 'myro', 'bome', 'catdog', 'popcat'
];

export interface CoinFilterOptions {
  excludeStablecoins?: boolean;
  excludeMemeCoins?: boolean;
  minMarketCap?: number;
  minVolume?: number;
  maxPrice?: number;
  minPrice?: number;
}

export interface CoinSortOptions {
  sortBy: 'market_cap' | 'volume' | 'price_change_24h' | 'price_change_percentage_24h' | 'market_cap_rank';
  sortOrder: 'asc' | 'desc';
}

/**
 * Filter coins based on various criteria
 */
export const filterCoins = (coins: Coin[], options: CoinFilterOptions = {}): Coin[] => {
  const {
    excludeStablecoins = true,
    excludeMemeCoins = false,
    minMarketCap = 10000000, // $10M minimum market cap
    minVolume = 1000000, // $1M minimum 24h volume
    maxPrice = 10000, // $10k maximum price
    minPrice = 0.0001 // $0.0001 minimum price
  } = options;

  return coins.filter(coin => {
    // Filter out stablecoins using exact match and keyword detection
    if (excludeStablecoins) {
      const coinId = coin.id.toLowerCase();
      const coinName = coin.name.toLowerCase();
      const coinSymbol = coin.symbol.toLowerCase();
      
      // Check exact match in stablecoin list
      if (STABLECOINS.includes(coinId)) {
        return false;
      }
      
      // Check for stablecoin keywords in name, symbol, or id
      const hasStablecoinKeyword = STABLECOIN_KEYWORDS.some(keyword => 
        coinId.includes(keyword) || 
        coinName.includes(keyword) || 
        coinSymbol.includes(keyword)
      );
      
      if (hasStablecoinKeyword) {
        return false;
      }
    }

    // Filter out meme coins (optional)
    if (excludeMemeCoins && MEME_COINS.includes(coin.id.toLowerCase())) {
      return false;
    }

    // Filter by market cap
    if (coin.market_cap < minMarketCap) {
      return false;
    }

    // Filter by volume
    if (coin.total_volume < minVolume) {
      return false;
    }

    // Filter by price range
    if (coin.current_price < minPrice || coin.current_price > maxPrice) {
      return false;
    }

    return true;
  });
};

/**
 * Sort coins by various criteria useful for swing trading
 */
export const sortCoins = (coins: Coin[], options: CoinSortOptions): Coin[] => {
  const { sortBy, sortOrder } = options;

  return [...coins].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case 'market_cap':
        aValue = a.market_cap;
        bValue = b.market_cap;
        break;
      case 'volume':
        aValue = a.total_volume;
        bValue = b.total_volume;
        break;
      case 'price_change_24h':
        aValue = a.price_change_24h;
        bValue = b.price_change_24h;
        break;
      case 'price_change_percentage_24h':
        aValue = a.price_change_percentage_24h;
        bValue = b.price_change_percentage_24h;
        break;
      case 'market_cap_rank':
        aValue = a.market_cap_rank;
        bValue = b.market_cap_rank;
        break;
      default:
        aValue = a.market_cap;
        bValue = b.market_cap;
    }

    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });
};

/**
 * Get the best coins for swing trading analysis
 * Combines filtering and sorting with swing trading specific criteria
 */
export const getBestSwingTradingCoins = (
  coins: Coin[], 
  limit: number = 20,
  options: CoinFilterOptions = {}
): Coin[] => {
  // Filter out stablecoins and apply other filters
  const filteredCoins = filterCoins(coins, {
    excludeStablecoins: true,
    excludeMemeCoins: false, // Keep meme coins as they can be good for swing trading
    minMarketCap: 50000000, // $50M minimum for better liquidity
    minVolume: 5000000, // $5M minimum 24h volume
    ...options
  });

  // Sort by volume (higher volume = better liquidity for swing trading)
  const sortedCoins = sortCoins(filteredCoins, {
    sortBy: 'volume',
    sortOrder: 'desc'
  });

  // Return top N coins
  return sortedCoins.slice(0, limit);
};

/**
 * Get coins sorted by 24h price change (for momentum-based swing trading)
 */
export const getMomentumCoins = (
  coins: Coin[], 
  limit: number = 15,
  options: CoinFilterOptions = {}
): Coin[] => {
  const filteredCoins = filterCoins(coins, {
    excludeStablecoins: true,
    excludeMemeCoins: false,
    minMarketCap: 100000000, // $100M minimum for momentum trading
    minVolume: 10000000, // $10M minimum volume
    ...options
  });

  // Sort by 24h price change percentage
  const sortedCoins = sortCoins(filteredCoins, {
    sortBy: 'price_change_percentage_24h',
    sortOrder: 'desc'
  });

  return sortedCoins.slice(0, limit);
};

/**
 * Get top market cap coins (for trend-following swing trading)
 */
export const getTopMarketCapCoins = (
  coins: Coin[], 
  limit: number = 15,
  options: CoinFilterOptions = {}
): Coin[] => {
  const filteredCoins = filterCoins(coins, {
    excludeStablecoins: true,
    excludeMemeCoins: false,
    minMarketCap: 1000000000, // $1B minimum for large caps
    minVolume: 50000000, // $50M minimum volume
    ...options
  });

  // Sort by market cap
  const sortedCoins = sortCoins(filteredCoins, {
    sortBy: 'market_cap',
    sortOrder: 'desc'
  });

  return sortedCoins.slice(0, limit);
};

/**
 * Get mid-cap coins (market cap between $100M - $1B) - often best for swing trading
 */
export const getMidCapCoins = (
  coins: Coin[], 
  limit: number = 20,
  options: CoinFilterOptions = {}
): Coin[] => {
  const filteredCoins = filterCoins(coins, {
    excludeStablecoins: true,
    excludeMemeCoins: false,
    minMarketCap: 100000000, // $100M minimum
    minVolume: 5000000, // $5M minimum volume
    ...options
  });

  // Filter for mid-cap range ($100M - $1B)
  const midCapCoins = filteredCoins.filter(coin => 
    coin.market_cap >= 100000000 && coin.market_cap <= 1000000000
  );

  // Sort by volume for liquidity
  const sortedCoins = sortCoins(midCapCoins, {
    sortBy: 'volume',
    sortOrder: 'desc'
  });

  return sortedCoins.slice(0, limit);
};

/**
 * Get emerging coins (market cap between $10M - $100M) - high potential, higher risk
 */
export const getEmergingCoins = (
  coins: Coin[], 
  limit: number = 15,
  options: CoinFilterOptions = {}
): Coin[] => {
  const filteredCoins = filterCoins(coins, {
    excludeStablecoins: true,
    excludeMemeCoins: false,
    minMarketCap: 10000000, // $10M minimum
    minVolume: 2000000, // $2M minimum volume
    ...options
  });

  // Filter for emerging range ($10M - $100M)
  const emergingCoins = filteredCoins.filter(coin => 
    coin.market_cap >= 10000000 && coin.market_cap <= 100000000
  );

  // Sort by 24h price change for momentum
  const sortedCoins = sortCoins(emergingCoins, {
    sortBy: 'price_change_percentage_24h',
    sortOrder: 'desc'
  });

  return sortedCoins.slice(0, limit);
};

/**
 * Get high volatility coins (good for swing trading due to larger price swings)
 */
export const getHighVolatilityCoins = (
  coins: Coin[], 
  limit: number = 15,
  options: CoinFilterOptions = {}
): Coin[] => {
  const filteredCoins = filterCoins(coins, {
    excludeStablecoins: true,
    excludeMemeCoins: false,
    minMarketCap: 50000000, // $50M minimum
    minVolume: 3000000, // $3M minimum volume
    ...options
  });

  // Calculate volatility (using 24h price change as proxy)
  const coinsWithVolatility = filteredCoins.map(coin => ({
    ...coin,
    volatility: Math.abs(coin.price_change_percentage_24h)
  }));

  // Sort by volatility (highest first)
  const sortedCoins = coinsWithVolatility.sort((a, b) => b.volatility - a.volatility);

  return sortedCoins.slice(0, limit);
};

/**
 * Get comprehensive swing trading portfolio - balanced across market segments
 */
export const getComprehensiveSwingPortfolio = (
  coins: Coin[], 
  options: CoinFilterOptions = {}
): Coin[] => {
  const largeCaps = getTopMarketCapCoins(coins, 5, options); // 5 large caps
  const midCaps = getMidCapCoins(coins, 8, options); // 8 mid caps
  const momentum = getMomentumCoins(coins, 5, options); // 5 momentum
  const emerging = getEmergingCoins(coins, 3, options); // 3 emerging
  const volatile = getHighVolatilityCoins(coins, 4, options); // 4 high volatility

  // Combine all categories and remove duplicates
  const allCoins = [...largeCaps, ...midCaps, ...momentum, ...emerging, ...volatile];
  const uniqueCoins = allCoins.filter((coin, index, self) => 
    index === self.findIndex(c => c.id === coin.id)
  );

  return uniqueCoins;
}; 