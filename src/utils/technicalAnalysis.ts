// Remove conflicting imports - we'll define our own interfaces

// Calculate EMA using available price data (can work with less than 200 days)
export function calculateEMA(prices: [number, number][], period: number): number | null {
  if (prices.length < period) {
    return null;
  }

  const multiplier = 2 / (period + 1);
  let ema = prices[0][1]; // Start with first price

  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i][1] * multiplier) + (ema * (1 - multiplier));
  }

  return ema;
}

// Calculate RSI with flexible period
export function calculateRSI(prices: [number, number][], period: number = 14): number | null {
  if (prices.length < period + 1) {
    return null;
  }

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i][1] - prices[i - 1][1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate RSI for the rest of the data
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i][1] - prices[i - 1][1];
    let currentGain = 0;
    let currentLoss = 0;

    if (change > 0) {
      currentGain = change;
    } else {
      currentLoss = Math.abs(change);
    }

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return rsi;
}

interface Coin {
  total_volume: number;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

interface EMAData {
  ema50: number;
  ema200: number;
  isBullish: boolean;
  crossover: boolean;
  strength: string;
  rsi: string;
  isRSIHealthy: boolean;
  isRSIOptimal: boolean;
  isVolumeHealthy: boolean;
  volumeRatio: string;
  volumeChange: string;
  signal: string;
  qualityScore: number;
  swingTradingScore: number;
  holdingPeriod: HoldingPeriod;
  isRealData: boolean;
  dataQuality: string;
}

interface HoldingPeriod {
  period: string;
  confidence: string;
  reasoning: string[];
}

// Calculate volume analysis
export function calculateVolumeAnalysis(coin: Coin) {
  // For now, we'll use the current volume data and simulate volume trends
  // In a real implementation, you'd fetch historical volume data
  const currentVolume = coin.total_volume;
  const avgVolume = currentVolume * (0.8 + Math.random() * 0.4); // Simulate average
  const volumeRatio = currentVolume / avgVolume;
  const volumeChange = (Math.random() - 0.3) * 100; // Simulate volume change

  return {
    volumeRatio: volumeRatio.toFixed(2),
    volumeChange: volumeChange.toFixed(1),
    isVolumeIncreasing: volumeRatio > 1.2,
    isVolumeTrendingUp: volumeChange > 10,
    isVolumeHealthy: volumeRatio > 1.2 && volumeChange > 10
  };
}

interface MACDResult {
  macdLine: string;
  signalLine: string;
  histogram: string;
  isBullish: boolean;
}

// Calculate MACD (Moving Average Convergence Divergence)
export function calculateMACD(prices: [number, number][], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): MACDResult | null {
  if (prices.length < slowPeriod + signalPeriod) return null;

  // Calculate fast EMA
  const fastEMA = calculateEMA(prices, fastPeriod);
  // Calculate slow EMA
  const slowEMA = calculateEMA(prices, slowPeriod);

  if (!fastEMA || !slowEMA) return null;

  const macdLine = fastEMA - slowEMA;

  // For signal line, we'd need to calculate MACD for each period
  // For simplicity, we'll use a simplified approach
  const signalLine = macdLine * 0.8; // Simplified signal line
  const histogram = macdLine - signalLine;

  return {
    macdLine: macdLine.toFixed(4),
    signalLine: signalLine.toFixed(4),
    histogram: histogram.toFixed(4),
    isBullish: macdLine > signalLine && histogram > 0
  };
}

interface BollingerBandsResult {
  upper: string;
  middle: string;
  lower: string;
  percentB: string;
  isSqueeze: boolean;
  position: 'above' | 'below' | 'inside';
}

// Calculate Bollinger Bands
export function calculateBollingerBands(prices: [number, number][], period: number = 20, stdDev: number = 2): BollingerBandsResult | null {
  if (prices.length < period) return null;

  // Calculate SMA for the period
  const recentPrices = prices.slice(-period).map(p => p[1]);
  const sma = recentPrices.reduce((sum, price) => sum + price, 0) / period;

  // Calculate standard deviation
  const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance);

  const upperBand = sma + (standardDeviation * stdDev);
  const lowerBand = sma - (standardDeviation * stdDev);
  const currentPrice = prices[prices.length - 1][1];

  // Calculate %B (position within bands)
  const percentB = (currentPrice - lowerBand) / (upperBand - lowerBand);

  return {
    upper: upperBand.toFixed(2),
    middle: sma.toFixed(2),
    lower: lowerBand.toFixed(2),
    percentB: percentB.toFixed(3),
    isSqueeze: (upperBand - lowerBand) / sma < 0.1, // Low volatility
    position: currentPrice > upperBand ? 'above' : currentPrice < lowerBand ? 'below' : 'inside'
  };
}

interface SupportResistanceResult {
  resistance: string;
  support: string;
  distanceToResistance: string;
  distanceToSupport: string;
  riskRewardRatio: string;
}

// Calculate Support and Resistance levels with improved algorithm
export function calculateSupportResistance(prices: [number, number][], lookback: number = 100): SupportResistanceResult | null {
  if (prices.length < lookback) return null;

  const recentPrices = prices.slice(-lookback);
  const highs: number[] = [];
  const lows: number[] = [];

  // Enhanced peak detection with minimum swing requirement
  const minSwingPercent = 0.005; // 0.5% minimum swing for significance
  
  for (let i = 2; i < recentPrices.length - 2; i++) {
    const current = recentPrices[i][1];
    const prev1 = recentPrices[i - 1][1];
    const prev2 = recentPrices[i - 2][1];
    const next1 = recentPrices[i + 1][1];
    const next2 = recentPrices[i + 2][1];

    // More robust high detection (higher than 2 candles on each side)
    if (current > prev1 && current > prev2 && current > next1 && current > next2) {
      const swingSize = Math.min(
        (current - prev1) / prev1,
        (current - next1) / next1
      );
      if (swingSize > minSwingPercent) {
        highs.push(current);
      }
    }
    
    // More robust low detection (lower than 2 candles on each side)
    if (current < prev1 && current < prev2 && current < next1 && current < next2) {
      const swingSize = Math.min(
        (prev1 - current) / current,
        (next1 - current) / current
      );
      if (swingSize > minSwingPercent) {
        lows.push(current);
      }
    }
  }

  // Find significant levels with improved clustering
  const resistance = findSignificantLevel(highs);
  const support = findSignificantLevel(lows);

  const currentPrice = prices[prices.length - 1][1];

  // Validate support and resistance levels
  const validResistance = resistance > currentPrice ? resistance : currentPrice * 1.05;
  const validSupport = support < currentPrice ? support : currentPrice * 0.95;

  return {
    resistance: validResistance.toFixed(2),
    support: validSupport.toFixed(2),
    distanceToResistance: ((validResistance - currentPrice) / currentPrice * 100).toFixed(1),
    distanceToSupport: ((currentPrice - validSupport) / currentPrice * 100).toFixed(1),
    riskRewardRatio: ((validResistance - currentPrice) / (currentPrice - validSupport)).toFixed(2)
  };
}

// Helper function to find significant price levels with improved clustering
export function findSignificantLevel(prices: number[]): number {
  if (prices.length === 0) return 0;

  // Sort prices for better clustering
  const sortedPrices = [...prices].sort((a, b) => a - b);
  
  // Adaptive tolerance based on price range
  const priceRange = sortedPrices[sortedPrices.length - 1] - sortedPrices[0];
  const baseTolerance = 0.015; // 1.5% base tolerance
  const adaptiveTolerance = Math.min(baseTolerance, priceRange / sortedPrices[0] * 0.5);
  const tolerance = Math.max(adaptiveTolerance, 0.005); // Minimum 0.5% tolerance

  const groups: number[][] = [];

  sortedPrices.forEach(price => {
    let added = false;
    for (const group of groups) {
      const avg = group.reduce((sum, p) => sum + p, 0) / group.length;
      if (Math.abs(price - avg) / avg < tolerance) {
        group.push(price);
        added = true;
        break;
      }
    }
    if (!added) {
      groups.push([price]);
    }
  });

  // Find the most significant group (considering both size and price level)
  let bestGroup = groups[0];
  let bestScore = 0;

  groups.forEach(group => {
    const sizeScore = group.length;
    const recencyScore = group.length > 1 ? 1 : 0; // Bonus for multiple occurrences
    
    const totalScore = sizeScore + recencyScore;
    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestGroup = group;
    }
  });

  return bestGroup.reduce((sum, price) => sum + price, 0) / bestGroup.length;
}

interface RiskMetricsResult {
  stopLoss: string;
  takeProfit: string;
  riskPerUnit: string;
  rewardPerUnit: string;
  riskRewardRatio: string;
  recommendedUnits: number;
  maxRiskAmount: string;
  isGoodRiskReward: boolean;
}

// Calculate Risk Management metrics
export function calculateRiskMetrics(coin: Coin, _emaData: any, supportResistance: SupportResistanceResult): RiskMetricsResult {
  const currentPrice = coin.current_price; // Fixed: Use current_price instead of total_volume
  const stopLoss = parseFloat(supportResistance.support);
  const takeProfit = parseFloat(supportResistance.resistance);

  const riskPerUnit = currentPrice - stopLoss;
  const rewardPerUnit = takeProfit - currentPrice;
  const riskRewardRatio = rewardPerUnit / riskPerUnit;

  // Position sizing recommendation
  const maxRiskPercent = 2; // 2% max risk per trade
  const accountSize = 10000; // Example account size
  const maxRiskAmount = accountSize * (maxRiskPercent / 100);
  
  // Handle edge cases for very small risk per unit
  let recommendedUnits = 0;
  if (riskPerUnit > 0 && isFinite(riskPerUnit)) {
    recommendedUnits = Math.floor(maxRiskAmount / riskPerUnit);
    // Cap at reasonable maximum (e.g., 1000 units)
    recommendedUnits = Math.min(recommendedUnits, 1000);
  }

  return {
    stopLoss: stopLoss.toFixed(2),
    takeProfit: takeProfit.toFixed(2),
    riskPerUnit: riskPerUnit.toFixed(2),
    rewardPerUnit: rewardPerUnit.toFixed(2),
    riskRewardRatio: riskRewardRatio.toFixed(2),
    recommendedUnits,
    maxRiskAmount: maxRiskAmount.toFixed(2),
    isGoodRiskReward: riskRewardRatio >= 2
  };
}

// Short-term price prediction functions
export const calculateShortTermPrediction = (coin: Coin, historicalData: [number, number][] | null = null) => {
  if (!historicalData || historicalData.length < 24) {
    return null; // Need at least 24 data points for short-term analysis
  }

  const recentPrices = historicalData.slice(-24); // Last 24 data points
  const currentPrice = coin.current_price; // Fixed: Use current_price instead of total_volume

  // Calculate momentum indicators
  const priceChanges: number[] = [];
  for (let i = 1; i < recentPrices.length; i++) {
    const change = ((recentPrices[i][1] - recentPrices[i - 1][1]) / recentPrices[i - 1][1]) * 100;
    priceChanges.push(change);
  }

  // 4-hour prediction (using last 4 data points)
  const fourHourData = recentPrices.slice(-4);
  const fourHourChanges = priceChanges.slice(-3);
  const fourHourPrediction = analyzeShortTermMomentum(fourHourData, fourHourChanges, currentPrice, '4h');

  // 1-day prediction (using last 24 data points)
  const oneDayData = recentPrices;
  const oneDayChanges = priceChanges;
  const oneDayPrediction = analyzeShortTermMomentum(oneDayData, oneDayChanges, currentPrice, '1d');

  return {
    fourHour: fourHourPrediction,
    oneDay: oneDayPrediction,
    confidence: calculatePredictionConfidence(fourHourPrediction, oneDayPrediction)
  };
};

interface MomentumResult {
  sentiment: string;
  confidence: string;
  score: number;
  reasoning: string;
  metrics: {
    recentChange: string;
    avgChange: string;
    volatility: string;
    pattern: string;
  };
}

export const analyzeShortTermMomentum = (priceData: [number, number][], changes: number[], _currentPrice: number, _timeframe: string): MomentumResult => {
  // Calculate various momentum indicators
  const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
  const recentChange = changes[changes.length - 1];
  const volatility = Math.sqrt(changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length);

  // Price pattern analysis
  const pricePattern = analyzePricePattern(priceData);

  // Momentum scoring
  let momentumScore = 0;
  const reasoning: string[] = [];

  // Recent price change (40% weight)
  if (recentChange > 2) {
    momentumScore += 40;
    reasoning.push('Strong recent momentum (+' + recentChange.toFixed(1) + '%)');
  } else if (recentChange > 0) {
    momentumScore += 20;
    reasoning.push('Positive recent momentum (+' + recentChange.toFixed(1) + '%)');
  } else if (recentChange < -2) {
    momentumScore -= 20;
    reasoning.push('Negative recent momentum (' + recentChange.toFixed(1) + '%)');
  }

  // Average trend (30% weight)
  if (avgChange > 1) {
    momentumScore += 30;
    reasoning.push('Strong upward trend (+' + avgChange.toFixed(1) + '% avg)');
  } else if (avgChange > 0) {
    momentumScore += 15;
    reasoning.push('Positive trend (+' + avgChange.toFixed(1) + '% avg)');
  } else if (avgChange < -1) {
    momentumScore -= 15;
    reasoning.push('Downward trend (' + avgChange.toFixed(1) + '% avg)');
  }

  // Volatility analysis (20% weight)
  if (volatility < 3) {
    momentumScore += 20;
    reasoning.push('Low volatility (stable movement)');
  } else if (volatility > 8) {
    momentumScore -= 10;
    reasoning.push('High volatility (unstable)');
  }

  // Price pattern analysis (10% weight)
  if (pricePattern === 'uptrend') {
    momentumScore += 10;
    reasoning.push('Uptrend pattern detected');
  } else if (pricePattern === 'downtrend') {
    momentumScore -= 10;
    reasoning.push('Downtrend pattern detected');
  }

  // Determine sentiment
  let sentiment = 'neutral';
  let confidence = 'low';

  if (momentumScore >= 60) {
    sentiment = 'bullish';
    confidence = 'high';
  } else if (momentumScore >= 30) {
    sentiment = 'bullish';
    confidence = 'medium';
  } else if (momentumScore >= 10) {
    sentiment = 'slightly_bullish';
    confidence = 'low';
  } else if (momentumScore <= -30) {
    sentiment = 'bearish';
    confidence = 'high';
  } else if (momentumScore <= -10) {
    sentiment = 'bearish';
    confidence = 'medium';
  } else if (momentumScore < 0) {
    sentiment = 'slightly_bearish';
    confidence = 'low';
  }

  return {
    sentiment,
    confidence,
    score: momentumScore,
    reasoning: reasoning.join(', '),
    metrics: {
      recentChange: recentChange.toFixed(2) + '%',
      avgChange: avgChange.toFixed(2) + '%',
      volatility: volatility.toFixed(2) + '%',
      pattern: pricePattern
    }
  };
};

export const analyzePricePattern = (priceData: [number, number][]): string => {
  if (priceData.length < 4) return 'neutral';

  const prices = priceData.map(p => p[1]);
  const recent = prices.slice(-4);

  // Check for uptrend (each price higher than previous)
  const isUptrend = recent.every((price, i) => i === 0 || price >= recent[i - 1]);

  // Check for downtrend (each price lower than previous)
  const isDowntrend = recent.every((price, i) => i === 0 || price <= recent[i - 1]);

  // Check for consolidation (prices within 2% range)
  const minPrice = Math.min(...recent);
  const maxPrice = Math.max(...recent);
  const range = ((maxPrice - minPrice) / minPrice) * 100;
  const isConsolidation = range < 2;

  if (isUptrend) return 'uptrend';
  if (isDowntrend) return 'downtrend';
  if (isConsolidation) return 'consolidation';
  return 'mixed';
};

export const calculatePredictionConfidence = (fourHour: MomentumResult | null, oneDay: MomentumResult | null): string => {
  if (!fourHour || !oneDay) return 'low';

  // Higher confidence if both timeframes agree
  if (fourHour.sentiment === oneDay.sentiment) {
    if (fourHour.confidence === 'high' && oneDay.confidence === 'high') {
      return 'very_high';
    }
    if (fourHour.confidence === 'high' || oneDay.confidence === 'high') {
      return 'high';
    }
    return 'medium';
  }

  // Lower confidence if timeframes disagree
  if (fourHour.confidence === 'high' || oneDay.confidence === 'high') {
    return 'medium';
  }
  return 'low';
};

// Calculate Quality Score
export function calculateQualityScore(coin: Coin, emaData: Partial<EMAData>): number {
  let score = 0;
  
  // EMA Strength (30%)
  if (emaData.strength) {
    const strength = parseFloat(emaData.strength);
    if (strength > 5) score += 30;
    else if (strength > 2) score += 20;
    else if (strength > 0) score += 10;
  }
  
  // RSI Health (25%)
  if (emaData.isRSIOptimal) score += 25;
  else if (emaData.isRSIHealthy) score += 15;
  
  // Volume Health (20%)
  if (emaData.isVolumeHealthy) score += 20;
  
  // Market Cap Stability (15%)
  if (coin.market_cap > 100000000) score += 15;
  else if (coin.market_cap > 10000000) score += 10;
  
  // Price Momentum (10%)
  if (coin.price_change_percentage_24h > 5) score += 10;
  else if (coin.price_change_percentage_24h > 0) score += 5;
  
  return Math.min(score, 100);
}

// Calculate Holding Period
export function calculateHoldingPeriod(coin: Coin, emaData: Partial<EMAData>): HoldingPeriod {
  let period = '3-7 days';
  let confidence: HoldingPeriod['confidence'] = 'Medium';
  const reasoning: string[] = [];
  
  if (emaData.strength) {
    const strength = parseFloat(emaData.strength);
    if (strength > 5) {
      period = '1-3 days';
      confidence = 'High';
      reasoning.push('Strong EMA crossover suggests quick momentum');
    } else if (strength > 2) {
      period = '3-7 days';
      confidence = 'Medium';
      reasoning.push('Moderate EMA strength indicates steady trend');
    } else {
      period = '7-14 days';
      confidence = 'Low';
      reasoning.push('Weak EMA crossover may need more time to develop');
    }
  }
  
  if (coin.price_change_percentage_24h > 10) {
    period = '1-3 days';
    reasoning.push('High volatility suggests quick moves');
  }
  
  if (coin.market_cap > 1000000000) {
    reasoning.push('Large cap stability supports longer holds');
  }
  
  return { period, confidence, reasoning };
} 