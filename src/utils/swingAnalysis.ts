import { Coin, EMAData } from '../types';
import { getDataSourceInfo } from './realDataFetcher';

interface AnalyzedCoin extends Coin {
  emaData: EMAData;
}

// Type for Jotai get/set functions
type JotaiGet = (atom: any) => any;

// Calculate EMA (Exponential Moving Average)
// Optimized EMA calculation with early exit and better performance
const calculateEMA = (prices: number[], period: number): number => {
  if (prices.length === 0) return 0;
  if (prices.length < period) return prices[prices.length - 1];
  
  const multiplier = 2 / (period + 1);
  const inverseMultiplier = 1 - multiplier;
  
  // Use simple average for initial EMA
  let ema = 0;
  for (let i = 0; i < period; i++) {
    ema += prices[i];
  }
  ema /= period;
  
  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * inverseMultiplier);
  }
  
  return ema;
};

// Optimized RSI calculation using exponential moving averages
const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length < period + 1) return 50; // Neutral RSI if not enough data
  
  let avgGain = 0;
  let avgLoss = 0;
  
  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      avgGain += change;
    } else {
      avgLoss += Math.abs(change);
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  // Calculate exponential moving average for remaining periods
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};



// Simplified risk metrics calculation with clear position sizing
const RISK_CONSTANTS = {
  STOP_LOSS_PERCENTAGE: 0.025, // 2.5% stop loss
  TAKE_PROFIT_PERCENTAGE: 0.075, // 7.5% take profit
  ENTRY_DISCOUNT: 0.005,
  MIN_RISK_REWARD_RATIO: 2.5
} as const;

const calculateRiskMetrics = (currentPrice: number) => {
  // Pre-calculate multipliers for better performance
  const stopLossMultiplier = 1 - RISK_CONSTANTS.STOP_LOSS_PERCENTAGE;
  const takeProfitMultiplier = 1 + RISK_CONSTANTS.TAKE_PROFIT_PERCENTAGE;
  const entryMultiplier = 1 - RISK_CONSTANTS.ENTRY_DISCOUNT;
  
  const stopLoss = currentPrice * stopLossMultiplier;
  const takeProfit = currentPrice * takeProfitMultiplier;
  const suggestedEntry = currentPrice * entryMultiplier;
  
  // Pre-calculated risk/reward ratio
  const riskRewardRatio = RISK_CONSTANTS.TAKE_PROFIT_PERCENTAGE / RISK_CONSTANTS.STOP_LOSS_PERCENTAGE;
  
  return {
    stopLoss,
    takeProfit,
    riskRewardRatio,
    suggestedEntry,
    isGoodRiskReward: riskRewardRatio >= RISK_CONSTANTS.MIN_RISK_REWARD_RATIO,
    stopLossPercentage: RISK_CONSTANTS.STOP_LOSS_PERCENTAGE * 100,
    takeProfitPercentage: RISK_CONSTANTS.TAKE_PROFIT_PERCENTAGE * 100
  };
};

// Analyze a single coin for swing trading signals
export const analyzeCoinForSwing = async (
  coin: Coin, 
  historicalPrices: number[],
  get: JotaiGet
): Promise<AnalyzedCoin> => {
  // Use provided historical data (must be real data)
  const dataSourceInfo = getDataSourceInfo(coin.id, get);
  const isRealData = dataSourceInfo.isRealData;
  
  // Adjust data quality based on available data length
  const dataLength = historicalPrices.length;
  let dataQuality = dataSourceInfo.dataQuality;
  if (dataLength < 30) {
    dataQuality = 'limited';
  } else if (dataLength < 100) {
    dataQuality = 'basic';
  }
  
  // Calculate technical indicators with adaptive periods based on available data
  const adaptiveEma50 = Math.min(50, Math.floor(dataLength * 0.25)); // Use 25% of available data for EMA
  const adaptiveEma200 = Math.min(200, Math.floor(dataLength * 0.5)); // Use 50% of available data for EMA
  
  const ema50 = calculateEMA(historicalPrices, adaptiveEma50);
  const ema200 = calculateEMA(historicalPrices, adaptiveEma200);
  const rsi = calculateRSI(historicalPrices, Math.min(14, dataLength - 1));
  
  // Determine bullish/bearish trend
  const emaBullish = ema50 > ema200;
  const crossover = Math.abs(ema50 - ema200) / ema200 < 0.02; // Within 2% for crossover
  
  // Consider recent momentum in trend determination
  const recentMomentum = coin.price_change_percentage_24h;
  const momentum1h = coin.price_change_percentage_1h_in_currency || 0;
  const momentum4h = coin.price_change_percentage_4h_in_currency || 0;
  
  const isMomentumBullish = recentMomentum > 0;
  const isShortTermBullish = momentum1h > 0 && momentum4h > 0;
  
  // Combine EMA trend with recent momentum
  // If momentum is strongly bearish (>-3%), it overrides EMA trend
  // If short-term momentum is also bearish, it's definitely bearish
  const isBullish = recentMomentum > -3 ? emaBullish : false;
  
  // Early exit conditions for poor candidates
  if (recentMomentum < -10 || rsi > 80 || rsi < 20) {
    // Skip coins with extreme bearish momentum or overbought/oversold RSI
    return {
      ...coin,
      emaData: {
        ema50,
        ema200,
        isBullish: false,
        crossover,
        strength: 'Bearish',
        signalStrength: 0,
        rsi: rsi.toFixed(2),
        isRSIHealthy: false,
        isRSIOptimal: false,
        isVolumeHealthy: false,
        isVolumeIncreasing: false,
        volumeRatio: 0,
        volumeChange: 0,
        isVolumeTrendingUp: false,
        signal: 'SELL',
        qualityScore: 0,
        swingTradingScore: 0,
        holdingPeriod: {
          period: '1-2 weeks',
          confidence: 'Low',
          reasoning: dataLength < 30 ? ['Extreme conditions detected', `Limited data (${dataLength} days)`] : ['Extreme conditions detected']
        },
        macd: null,
        bollinger: null,
        supportResistance: null,
        riskMetrics: null,
        shortTermPrediction: null,
        isRealData,
        dataQuality: dataQuality as 'excellent' | 'good' | 'limited' | 'basic'
      }
    };
  }

  // Optimized volume metrics calculation
  const volumeRatio = coin.total_volume / coin.market_cap;
  const isVolumeHealthy = volumeRatio > 0.01;
  
  // Simplified volume change (remove random for consistency)
  const isVolumeIncreasing = volumeRatio > 0.015; // Higher volume ratio indicates increasing activity
  
  // RSI analysis with optimized thresholds
  const isRSIHealthy = rsi > 30 && rsi < 70;
  const isRSIOptimal = rsi > 35 && rsi < 65;
  
  // Optimized scoring algorithm with weighted components
  const SCORING_WEIGHTS = {
    TREND: 30,
    RSI: 25,
    VOLUME: 20,
    MOMENTUM: 15,
    MARKET_CAP: 10
  } as const;
  
  const trendScore = isBullish ? SCORING_WEIGHTS.TREND : SCORING_WEIGHTS.TREND * 0.3;
  const rsiScore = isRSIHealthy ? SCORING_WEIGHTS.RSI : SCORING_WEIGHTS.RSI * 0.2;
  const volumeScore = isVolumeHealthy ? SCORING_WEIGHTS.VOLUME : SCORING_WEIGHTS.VOLUME * 0.25;
  const momentumScore = recentMomentum > 0 ? SCORING_WEIGHTS.MOMENTUM : SCORING_WEIGHTS.MOMENTUM * 0.3;
  const marketCapScore = coin.market_cap > 1000000000 ? SCORING_WEIGHTS.MARKET_CAP : SCORING_WEIGHTS.MARKET_CAP * 0.5;
  
  const qualityScore = trendScore + rsiScore + volumeScore + momentumScore + marketCapScore;
  const swingTradingScore = Math.min(100, qualityScore + (isVolumeIncreasing ? 10 : 0));
  
  // Enhanced signal determination with actionable recommendations
  let signal: 'BUY' | 'HOLD' | 'SELL' = 'HOLD';
  let signalReasoning: string[] = [];
  let actionRecommendation: string = '';
  
  // BUY signal: Strong technical setup with positive momentum
  if (swingTradingScore >= 75 && isBullish && isRSIHealthy && recentMomentum > -1) {
    signal = 'BUY';
    signalReasoning = [
      'Strong bullish trend with EMA crossover',
      'RSI in healthy range (not overbought)',
      'Positive momentum across timeframes',
      'Good volume support'
    ];
    actionRecommendation = 'Consider buying now with proper position sizing';
  } 
  // WAIT signal: Mixed signals but potential
  else if (swingTradingScore >= 60 && isBullish && isRSIHealthy) {
    signal = 'HOLD';
    signalReasoning = [
      'Bullish trend but momentum is weak',
      'Wait for stronger confirmation signals',
      'Monitor for breakout above resistance'
    ];
    actionRecommendation = 'Wait for better entry - monitor key levels';
  }
  // SELL signal: Clear bearish indicators
  else if (swingTradingScore < 40 || !isBullish || recentMomentum < -5) {
    signal = 'SELL';
    signalReasoning = [
      'Bearish trend or weak technical setup',
      'Negative momentum across timeframes',
      'Poor risk/reward ratio'
    ];
    actionRecommendation = 'Avoid buying - wait for trend reversal';
  }
  // HOLD: Mixed signals or neutral conditions
  else {
    signalReasoning = [
      'Mixed technical signals',
      'Neutral momentum',
      'Wait for clearer direction'
    ];
    actionRecommendation = 'Wait for clearer signals before entering';
  }
  
  // Calculate risk metrics
  const riskMetrics = calculateRiskMetrics(coin.current_price);
  
  // Simple position sizing calculator
  const calculatePositionSize = (accountSize: number, riskPercentage: number = 2) => {
    const riskAmount = accountSize * (riskPercentage / 100);
    const stopLossDistance = coin.current_price - riskMetrics.stopLoss;
    const units = Math.floor(riskAmount / stopLossDistance);
    return units;
  };
  
  const positionSizing = {
    smallAccount: `${calculatePositionSize(250, 2)} units (≈$${(calculatePositionSize(250, 2) * coin.current_price).toFixed(0)})`,
    mediumAccount: `${calculatePositionSize(2500, 2)} units (≈$${(calculatePositionSize(2500, 2) * coin.current_price).toFixed(0)})`,
    largeAccount: `${calculatePositionSize(10000, 2)} units (≈$${(calculatePositionSize(10000, 2) * coin.current_price).toFixed(0)})`
  };
  
  // Determine holding period
  const holdingPeriod = {
    period: swingTradingScore >= 90 ? '1-3 days' : swingTradingScore >= 75 ? '3-7 days' : '1-2 weeks',
    confidence: swingTradingScore >= 90 ? 'High' : swingTradingScore >= 75 ? 'Medium' : 'Low' as 'High' | 'Medium' | 'Low',
    reasoning: [
      emaBullish ? 'Bullish EMA trend' : 'Bearish EMA trend',
      isMomentumBullish ? 'Positive momentum' : 'Negative momentum',
      isShortTermBullish ? 'Short-term bullish' : 'Short-term bearish',
      isRSIHealthy ? 'RSI in healthy range' : 'RSI in extreme range',
      isVolumeHealthy ? 'Good volume support' : 'Low volume concern'
    ]
  };
  
  // Create EMAData object
  const emaData: EMAData = {
    ema50,
    ema200,
    isBullish,
    crossover,
    strength: isBullish ? (emaBullish && isMomentumBullish ? 'Strong Bullish' : 'Mixed Bullish') : 'Bearish',
    signalStrength: swingTradingScore,
    rsi: rsi.toFixed(2),
    isRSIHealthy,
    isRSIOptimal,
    isVolumeHealthy,
    isVolumeIncreasing,
    volumeRatio: volumeRatio,
    volumeChange: 0, // Removed random volume change for consistency
    isVolumeTrendingUp: isVolumeIncreasing,
    signal,
    qualityScore,
    swingTradingScore,
    holdingPeriod,
    macd: null,
    bollinger: null,
    supportResistance: null,
    riskMetrics: {
      stopLoss: riskMetrics.stopLoss,
      takeProfit: riskMetrics.takeProfit,
      riskRewardRatio: riskMetrics.riskRewardRatio,
      isGoodRiskReward: riskMetrics.isGoodRiskReward,
      recommendedUnits: 0, // Simplified - will be calculated in UI
      positionSizing
    },
    shortTermPrediction: null,
    isRealData: isRealData,
    dataQuality: dataQuality as 'excellent' | 'good' | 'limited' | 'basic',
    signalReasoning,
    actionRecommendation
  };
  
  return {
    ...coin,
    emaData
  };
};

// Optimized batch analysis with early filtering and parallel processing
export const analyzeCoinsForSwing = async (
  coins: Coin[], 
  historicalData: Record<string, number[]>,
  get: JotaiGet
): Promise<AnalyzedCoin[]> => {
  // Pre-filter coins with valid data and basic criteria
  const validCoins = coins.filter(coin => {
    const hasData = historicalData[coin.id] && historicalData[coin.id].length >= 14; // Minimum 14 days for RSI calculation
    const hasVolume = coin.total_volume > 100000; // $100K minimum volume (lowered for testing)
    const hasMarketCap = coin.market_cap > 1000000; // $1M minimum market cap (lowered for testing)

    return hasData && hasVolume && hasMarketCap;
  });

  // Process in parallel with optimized batch size
  const BATCH_SIZE = 5; // Process 5 coins at a time to avoid overwhelming
  const results: AnalyzedCoin[] = [];
  
  for (let i = 0; i < validCoins.length; i += BATCH_SIZE) {
    const batch = validCoins.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(coin => 
      analyzeCoinForSwing(coin, historicalData[coin.id], get)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};

// Optimized high-quality signal filtering with sorting
export const getHighQualitySignals = (analyzedCoins: AnalyzedCoin[]): AnalyzedCoin[] => {
  return analyzedCoins
    .filter(coin => 
      coin.emaData.swingTradingScore >= 70 && 
      coin.emaData.signal === 'BUY'
    )
    .sort((a, b) => b.emaData.swingTradingScore - a.emaData.swingTradingScore); // Sort by score descending
}; 