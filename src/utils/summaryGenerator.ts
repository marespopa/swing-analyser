import type { TechnicalAnalysisData } from '../services/coingeckoApi'

interface CoinInfo {
  id: string
  name: string
  symbol: string
  currentPrice?: number
}

interface TradingRecommendation {
  action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT'
  confidence: 'low' | 'medium' | 'high'
  signalColor: 'green' | 'amber' | 'red'
  trend: string
  strength: string
  priceChange: string
  swingAnalysis: {
    trend: 'Bullish' | 'Bearish' | 'Sideways'
    momentum: 'Oversold' | 'Overbought' | 'Neutral'
    macdSignal: 'Bullish' | 'Bearish' | 'Neutral'
    supportResistance: 'Near Support' | 'Near Resistance' | 'Middle Range'
    patterns: Array<{ name: string; signal: 'bullish' | 'bearish'; confidence: string }>
    hasGoodRiskReward: boolean
    riskReward: number
    hasVolumeConfirmation: boolean
    isChoppyMarket: boolean
    strength: string
  }
}

interface SummaryGeneratorParams {
  coinInfo: CoinInfo
  tradingRecommendation: TradingRecommendation
  currentPrice: number
  analysis: TechnicalAnalysisData
}

export const generateSummary = ({
  coinInfo,
  tradingRecommendation,
  currentPrice,
  analysis
}: SummaryGeneratorParams): string => {
  if (!coinInfo || !tradingRecommendation || !currentPrice) return ''

  const action = tradingRecommendation.action

  // Detect chart patterns for narrative
  const detectChartPatterns = (): string[] => {
    const patterns: string[] = []
    const prices = analysis.data.slice(-20).map((d: any) => d.price)
    
    if (prices.length < 15) return patterns

    // More sophisticated pattern detection
    const recent = prices.slice(-15)
    
    // Find local minima and maxima
    const findExtrema = (prices: number[]) => {
      const extrema: { type: 'min' | 'max', index: number, value: number }[] = []
      
      for (let i = 1; i < prices.length - 1; i++) {
        if (prices[i] < prices[i-1] && prices[i] < prices[i+1]) {
          extrema.push({ type: 'min', index: i, value: prices[i] })
        } else if (prices[i] > prices[i-1] && prices[i] > prices[i+1]) {
          extrema.push({ type: 'max', index: i, value: prices[i] })
        }
      }
      return extrema
    }
    
    const extrema = findExtrema(recent)
    const minima = extrema.filter(e => e.type === 'min').sort((a, b) => a.value - b.value)
    const maxima = extrema.filter(e => e.type === 'max').sort((a, b) => b.value - a.value)
    
    // Double Bottom Pattern - more strict criteria
    if (minima.length >= 2) {
      const lowest = minima[0]
      const secondLowest = minima[1]
      
      // Check if they're recent and have a significant peak between them
      const timeDiff = Math.abs(lowest.index - secondLowest.index)
      const priceDiff = Math.abs(lowest.value - secondLowest.value) / lowest.value
      const hasSignificantPeak = maxima.some(max => 
        max.index > Math.min(lowest.index, secondLowest.index) &&
        max.index < Math.max(lowest.index, secondLowest.index) &&
        max.value > Math.max(lowest.value, secondLowest.value) * 1.05
      )
      
      if (timeDiff >= 3 && timeDiff <= 8 && priceDiff < 0.02 && hasSignificantPeak) {
        patterns.push('Double Bottom')
      }
    }
    
    // Double Top Pattern - more strict criteria
    if (maxima.length >= 2) {
      const highest = maxima[0]
      const secondHighest = maxima[1]
      
      const timeDiff = Math.abs(highest.index - secondHighest.index)
      const priceDiff = Math.abs(highest.value - secondHighest.value) / highest.value
      const hasSignificantValley = minima.some(min => 
        min.index > Math.min(highest.index, secondHighest.index) &&
        min.index < Math.max(highest.index, secondHighest.index) &&
        min.value < Math.min(highest.value, secondHighest.value) * 0.95
      )
      
      if (timeDiff >= 3 && timeDiff <= 8 && priceDiff < 0.02 && hasSignificantValley) {
        patterns.push('Double Top')
      }
    }

    return patterns
  }

  // Generate narrative story based on actual analysis data
  const generateNarrative = (): string => {
    const swingAnalysis = tradingRecommendation.swingAnalysis
    const patterns = detectChartPatterns()
    
    let story = ``
    
    // Generate coherent narrative based on trend and momentum alignment
    const trend = swingAnalysis.trend
    const momentum = swingAnalysis.momentum
    const strength = swingAnalysis.strength
    
    if (trend === 'Bullish') {
      if (momentum === 'Oversold') {
        story += `The overall trend is bullish, and the RSI oversold conditions suggest a potential buying opportunity as selling pressure may be exhausted. `
      } else if (momentum === 'Overbought') {
        story += `While the trend remains bullish, the RSI overbought conditions suggest caution as a pullback may be due. `
      } else if (strength === 'Strong') {
        story += `The overall trend is clearly bullish with strong momentum indicators supporting upward price movement. `
      } else {
        story += `The trend is bullish but momentum is showing neutral conditions, suggesting a potential consolidation phase. `
      }
    } else if (trend === 'Bearish') {
      if (momentum === 'Overbought') {
        story += `The trend has turned bearish, and the RSI overbought conditions suggest a potential selling opportunity as buying pressure weakens. `
      } else if (momentum === 'Oversold') {
        story += `While the trend is bearish, the RSI oversold conditions suggest a potential bounce or reversal may be forming. `
      } else if (strength === 'Strong') {
        story += `The trend has turned bearish with strong momentum indicators supporting downward price movement. `
      } else {
        story += `The trend is bearish but momentum is showing neutral conditions, suggesting a potential consolidation phase. `
      }
    } else {
      // Sideways trend
      if (momentum === 'Oversold') {
        story += `The market is in a sideways phase, but RSI oversold conditions suggest a potential upward breakout. `
      } else if (momentum === 'Overbought') {
        story += `The market is in a sideways phase, but RSI overbought conditions suggest a potential downward breakout. `
      } else {
        story += `The market is currently in a sideways consolidation phase, with neutral momentum creating uncertainty about the next directional move. `
      }
    }

    // Use actual MACD data
    if (swingAnalysis.macdSignal === 'Bullish') {
      story += `The MACD shows a bullish crossover, confirming the positive momentum shift. `
    } else if (swingAnalysis.macdSignal === 'Bearish') {
      story += `The MACD indicates a bearish crossover, suggesting momentum is shifting to the downside. `
    }

    // Use actual support/resistance data
    if (swingAnalysis.supportResistance === 'Near Support') {
      story += `The price is currently testing a key support level, which could provide a springboard for higher prices if it holds. `
    } else if (swingAnalysis.supportResistance === 'Near Resistance') {
      story += `The price is approaching significant resistance, which could limit upside movement unless there's a strong breakout. `
    }


    // Use actual volume data
    if (swingAnalysis.hasVolumeConfirmation) {
      story += `Volume is confirming the current move, with increased trading activity supporting the direction. `
    }

    // Use actual pattern data
    if (patterns.length > 0) {
      if (patterns.includes('Double Bottom')) {
        story += `A Double Bottom pattern is forming, which typically signals a bullish reversal as selling pressure appears exhausted. `
      } else if (patterns.includes('Double Top')) {
        story += `A Double Top pattern has emerged, which often signals a bearish reversal as buying pressure weakens. `
      } else if (patterns.includes('Falling Wedge')) {
        story += `A Falling Wedge pattern is developing, which is actually a bullish reversal pattern despite its name. `
      } else if (patterns.includes('Rising Wedge')) {
        story += `A Rising Wedge pattern is forming, which typically signals a bearish reversal. `
      }
    }

    // Use actual market condition data
    if (swingAnalysis.isChoppyMarket) {
      story += `However, the market is currently choppy and unpredictable, which increases the risk of false signals. `
    }

    return story
  }

  const narrative = generateNarrative()
  const emoji = action === 'BUY' ? '🟢' : action === 'SELL' ? '🔴' : action === 'HOLD' ? '🟡' : '⏸️'

  return `${emoji} ${action}

${narrative}`
}
