import { useState, useEffect } from 'react';
import { filterCoins } from '../utils/coinFiltering';
import { Coin } from '../types';
import { CoinGeckoAPI } from '../utils/api';

interface MarketSentiment {
  sentiment: string;
  upPercentage: number;
  downPercentage: number;
  upCount: number;
  downCount: number;
  neutralCount: number;
  total: number;
}

export const useCoinData = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('market_cap');
  const [sortOrder, setSortOrder] = useState('desc');
  const [timeframe, setTimeframe] = useState('24h');

  const api = CoinGeckoAPI.getInstance();

  async function fetchTop100Coins(): Promise<Coin[]> {
    try {
      const data = await api.fetchTop100Coins();
      setError(null);
      return data;
    } catch (error) {
      throw error;
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getMarketSentiment = (): MarketSentiment => {
    if (coins.length === 0) return { 
      sentiment: 'neutral', 
      upPercentage: 0, 
      downPercentage: 0,
      upCount: 0, 
      downCount: 0, 
      neutralCount: 0,
      total: 0
    };

    // Filter out stablecoins for sentiment analysis
    const nonStablecoins = filterCoins(coins, {
      excludeStablecoins: true,
      excludeMemeCoins: false,
      minMarketCap: 10000000, // $10M minimum
      minVolume: 1000000 // $1M minimum volume
    });

    let upCount = 0;
    let downCount = 0;
    let neutralCount = 0;

    nonStablecoins.forEach(coin => {
      const change = getPriceChange(coin);
      if (change === null || change === undefined) {
        neutralCount++;
      } else if (change > 0) {
        upCount++;
      } else if (change < 0) {
        downCount++;
      } else {
        neutralCount++;
      }
    });

    const total = nonStablecoins.length;
    const upPercentage = (upCount / total) * 100;
    const downPercentage = (downCount / total) * 100;

    let sentiment = 'neutral';
    if (upPercentage >= 60) {
      sentiment = 'bullish';
    } else if (downPercentage >= 60) {
      sentiment = 'bearish';
    }

    return {
      sentiment,
      upPercentage,
      downPercentage,
      upCount,
      downCount,
      neutralCount,
      total
    };
  };

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'bearish':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
  };

  const getSentimentIcon = (sentiment: string): string => {
    switch (sentiment) {
      case 'bullish':
        return '📈';
      case 'bearish':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getPriceChange = (coin: Coin): number | null => {
    switch (timeframe) {
      case '1h':
        return coin.price_change_percentage_1h_in_currency ?? null;
      case '4h':
        return coin.price_change_percentage_4h_in_currency ?? coin.price_change_percentage_24h;
      case '24h':
        return coin.price_change_percentage_24h;
      default:
        return coin.price_change_percentage_24h;
    }
  };

  // Filter and sort coins
  useEffect(() => {
    let result = [...coins];

    // Filter out stablecoins first
    result = filterCoins(result, {
      excludeStablecoins: true,
      excludeMemeCoins: false,
      minMarketCap: 10000000, // $10M minimum
      minVolume: 1000000, // $1M minimum volume
      maxPrice: 1000000 // $1M maximum price (allow high-value coins like Bitcoin)
    });

    // Filter by search term
    if (searchTerm) {
      result = result.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort coins
    result.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.current_price;
          bValue = b.current_price;
          break;
        case 'market_cap':
          aValue = a.market_cap;
          bValue = b.market_cap;
          break;
        case 'volume':
          aValue = a.total_volume;
          bValue = b.total_volume;
          break;
        case 'change_1h':
          aValue = a.price_change_percentage_1h_in_currency ?? a.price_change_percentage_24h ?? 0;
          bValue = b.price_change_percentage_1h_in_currency ?? b.price_change_percentage_24h ?? 0;
          break;
        case 'change_4h':
          aValue = a.price_change_percentage_4h_in_currency ?? a.price_change_percentage_24h ?? 0;
          bValue = b.price_change_percentage_4h_in_currency ?? b.price_change_percentage_24h ?? 0;
          break;
        case 'change_24h':
          aValue = a.price_change_percentage_24h;
          bValue = b.price_change_percentage_24h;
          break;
        default:
          aValue = a.market_cap;
          bValue = b.market_cap;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCoins(result);
  }, [coins, searchTerm, sortBy, sortOrder, timeframe]);

  useEffect(() => {
    const loadCoins = async () => {
      try {
        setLoading(true);
        const data = await fetchTop100Coins();
        setCoins(data);
        setFilteredCoins(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCoins();
  }, []);

  return {
    coins,
    setCoins,
    filteredCoins,
    loading,
    setLoading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    sortOrder,
    timeframe,
    setTimeframe,
    fetchTop100Coins,
    handleSort,
    getMarketSentiment,
    getSentimentColor,
    getSentimentIcon,
    getPriceChange
  };
}; 