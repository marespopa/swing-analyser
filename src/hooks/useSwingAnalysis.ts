import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Coin, EMAData } from '../types';
import { analyzeCoinsForSwing, getHighQualitySignals } from '../utils/swingAnalysis';
import { fetchBatchHistoricalData } from '../utils/realDataFetcher';
import { historicalDataAtom } from '../stores/historicalDataStore';
import { getComprehensiveSwingPortfolio } from '../utils/coinFiltering';

interface AnalyzedCoin extends Coin {
  emaData: EMAData;
}

export const useSwingAnalysis = (coins: Coin[]) => {
  const [emaLoading, setEmaLoading] = useState(false);
  const [swingSignals, setSwingSignals] = useState<AnalyzedCoin[]>([]);
  const [allAnalyzedCoins, setAllAnalyzedCoins] = useState<AnalyzedCoin[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentCoin: '' });
  const [historicalData, setHistoricalData] = useAtom(historicalDataAtom);

  // Calculate swing signals when coins are available
  useEffect(() => {
    if (coins.length > 0 && swingSignals.length === 0) {
      performSwingAnalysis();
    }
  }, [coins, swingSignals.length]);

  const performSwingAnalysis = async () => {
    if (coins.length === 0) return;
    
    setEmaLoading(true);
    setProgress({ current: 0, total: 0, currentCoin: '' }); // Will be set after filtering
    
    try {
      // Use comprehensive swing trading portfolio strategy
      const comprehensiveCoins = getComprehensiveSwingPortfolio(coins);
      const testCoins = comprehensiveCoins.slice(0, 30); // Optimized to 30 for API efficiency
      
      // Update progress with actual number of coins to analyze
      setProgress({ current: 0, total: testCoins.length, currentCoin: '' });
      
      // Fetch historical data for test coins with rate limiting
      const coinIds = testCoins.map(coin => coin.id);
      const historicalDataMap = await fetchBatchHistoricalData(
        coinIds,
        200,
        (_atom) => {
          // The atom parameter is actually the historicalDataAtom, so we need to get its value
          return historicalData;
        },
        (_atom, value) => setHistoricalData(value),
        (current, total, coinId) => {
          setProgress({ current, total, currentCoin: coinId });
        }
      );
      
      if (Object.keys(historicalDataMap).length === 0) {
        throw new Error('No historical data was fetched successfully');
      }
      
      // Analyze coins with the fetched data
      const analyzedCoins = await analyzeCoinsForSwing(
        testCoins,
        historicalDataMap,
        (_atom) => {
          // The atom parameter is actually the historicalDataAtom, so we need to get its value
          return historicalData;
        },
        (_atom, value) => setHistoricalData(value)
      );
      
      setAllAnalyzedCoins(analyzedCoins);
      
      // Get high-quality swing signals
      const highQualitySignals = getHighQualitySignals(analyzedCoins);
      setSwingSignals(highQualitySignals);
      
    } catch (error) {
      // Clear any partial results on error
      setSwingSignals([]);
      setAllAnalyzedCoins([]);
    } finally {
      setEmaLoading(false);
      setProgress({ current: 0, total: 0, currentCoin: '' });
    }
  };

  const clearSwingSignals = () => {
    setSwingSignals([]);
    setAllAnalyzedCoins([]);
  };

  const recalculateSignals = () => {
    if (coins.length > 0) {
      // Clear existing signals first
      clearSwingSignals();
      // Start fresh analysis
      performSwingAnalysis();
    }
  };

  return {
    emaLoading,
    setEmaLoading,
    swingSignals,
    setSwingSignals,
    allAnalyzedCoins,
    setAllAnalyzedCoins,
    clearSwingSignals,
    recalculateSignals,
    progress
  };
}; 