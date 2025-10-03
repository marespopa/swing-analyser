import type { SummaryGeneratorParams } from './types'
import type { TechnicalAnalysisData } from '../../services/coingeckoApi'
import { generateExecutiveSummary } from './executiveSummary'
import { generateRiskAssessment, formatRiskAssessment } from './riskAssessment'
import { generateActionableRecommendations, formatActionableRecommendations } from './actionableRecommendations'
import { generateTechnicalAnalysis } from './technicalAnalysis'
import { calculateVolatilityScore, formatVolatilityAnalysis } from './volatilityAnalysis'
import { getDetectedPatterns, formatChartPatterns, generateRSITrendlineAnalysis } from './patternAnalysis'

export const generateSummary = ({
  coinInfo,
  tradingRecommendation,
  currentPrice,
  analysis
}: SummaryGeneratorParams): string => {
  if (!coinInfo || !tradingRecommendation || !currentPrice) return ''

  const action = tradingRecommendation.action

  // Extract detected patterns
  const patterns = getDetectedPatterns(analysis)

  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(tradingRecommendation, patterns)

  // Generate risk assessment
  const riskAssessmentData = generateRiskAssessment(tradingRecommendation, action)
  const riskAssessment = formatRiskAssessment(riskAssessmentData)

  // Generate actionable recommendations
  const actionableData = generateActionableRecommendations(tradingRecommendation, analysis)
  const actionableRecommendations = formatActionableRecommendations(actionableData, action)

  // Generate technical analysis
  const technicalAnalysis = generateTechnicalAnalysis(tradingRecommendation)

  // Generate volatility analysis
  const volatilityScore = calculateVolatilityScore(tradingRecommendation, currentPrice)
  const volatilityAnalysis = formatVolatilityAnalysis(volatilityScore)

  // Generate pattern analysis
  const chartPatterns = formatChartPatterns(patterns)
  const rsiTrendlineAnalysis = generateRSITrendlineAnalysis(analysis)

  // Generate market summary
  const marketSummary = generateMarketSummary(analysis, currentPrice)

  // Combine all sections
  const actionEmoji = action === 'BUY' ? '🟢' : action === 'SELL' ? '🔴' : action === 'HOLD' ? '🟡' : '⏸️'
  const actionText = action === 'BUY' ? 'BUY SIGNAL' : action === 'SELL' ? 'SELL SIGNAL' : action === 'HOLD' ? 'HOLD POSITION' : 'WAIT'

  return `# ${actionEmoji} ${actionText}

${executiveSummary}${riskAssessment}${actionableRecommendations}${technicalAnalysis}${volatilityAnalysis}${chartPatterns}${rsiTrendlineAnalysis}${marketSummary}`
}

// Generate market summary with key levels and status
const generateMarketSummary = (analysis: TechnicalAnalysisData, currentPrice: number): string => {
  const latestPrice = analysis.data[analysis.data.length - 1]?.price || currentPrice
  const sma20 = analysis.sma20[analysis.sma20.length - 1] || 0
  const sma50 = analysis.sma50[analysis.sma50.length - 1] || 0
  const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
  const currentVolume = analysis.data[analysis.data.length - 1]?.volume || 0
  const avgVolume = analysis.volumeAnalysis?.volumeSMA[analysis.volumeAnalysis.volumeSMA.length - 1] || 0
  
  // Calculate resistance and support levels
  const recentHighs = analysis.data.slice(-20).map(d => d.price)
  const recentLows = analysis.data.slice(-20).map(d => d.price)
  const resistance = Math.max(...recentHighs)
  const support = Math.min(...recentLows)
  
  // MACD analysis
  let macdSignal = 'Neutral'
  if (analysis.macd && analysis.macd.macd.length >= 2 && analysis.macd.signal.length >= 2) {
    const currentMACD = analysis.macd.macd[analysis.macd.macd.length - 1]
    const previousMACD = analysis.macd.macd[analysis.macd.macd.length - 2]
    const currentSignal = analysis.macd.signal[analysis.macd.signal.length - 1]
    const previousSignal = analysis.macd.signal[analysis.macd.signal.length - 2]
    
    if (previousMACD <= previousSignal && currentMACD > currentSignal) {
      macdSignal = 'Bullish'
    } else if (previousMACD >= previousSignal && currentMACD < currentSignal) {
      macdSignal = 'Bearish'
    } else if (currentMACD > currentSignal) {
      macdSignal = 'Bullish'
    } else if (currentMACD < currentSignal) {
      macdSignal = 'Bearish'
    }
  }
  
  // Volume analysis
  const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1
  const isHighVolume = volumeRatio > 1.2
  const isLowVolume = volumeRatio < 0.8
  
  // Calculate price distances to key levels
  const distanceToResistance = ((resistance - latestPrice) / latestPrice) * 100
  const distanceToSupport = ((latestPrice - support) / latestPrice) * 100
  const distanceToSMA20 = ((sma20 - latestPrice) / latestPrice) * 100
  const distanceToSMA50 = ((sma50 - latestPrice) / latestPrice) * 100
  
  // Generate enhanced bullish scenario
  let bullishScenario = ''
  let bullishProbability = 'Medium'
  let bullishTimeframe = '1-3 days'
  
  if (resistance > latestPrice) {
    const resistanceLevel = resistance.toFixed(2)
    if (isHighVolume && macdSignal === 'Bullish') {
      bullishScenario = `🚀 **High Probability**: Break above $${resistanceLevel} with strong volume (${(volumeRatio * 100).toFixed(0)}% above average) and MACD confirmation`
      bullishProbability = 'High'
      bullishTimeframe = '1-2 days'
    } else if (isHighVolume) {
      bullishScenario = `📈 **Medium Probability**: Break above $${resistanceLevel} with strong volume (${(volumeRatio * 100).toFixed(0)}% above average)`
      bullishProbability = 'Medium'
    } else if (macdSignal === 'Bullish') {
      bullishScenario = `📊 **Medium Probability**: Break above $${resistanceLevel} with MACD bullish crossover`
      bullishProbability = 'Medium'
    } else {
      bullishScenario = `📈 **Lower Probability**: Break above $${resistanceLevel} with volume confirmation needed`
      bullishProbability = 'Low'
    }
  } else if (sma20 > latestPrice) {
    const smaLevel = sma20.toFixed(2)
    bullishScenario = `📊 **Medium Probability**: Break above $${smaLevel} (SMA 20) with strong volume`
    bullishProbability = 'Medium'
  } else {
    bullishScenario = `📈 **Continue Momentum**: Upward trend continuation with volume confirmation`
    bullishProbability = 'Medium'
  }
  
  // Generate enhanced bearish scenario
  let bearishScenario = ''
  let bearishProbability = 'Medium'
  let bearishTimeframe = '1-3 days'
  
  if (support < latestPrice) {
    const supportLevel = support.toFixed(2)
    const nextSupport = (support * 0.95).toFixed(2)
    const nextSupport2 = (support * 0.90).toFixed(2)
    
    if (rsi > 70 && macdSignal === 'Bearish') {
      bearishScenario = `🔴 **High Probability**: Drop below $${supportLevel} support with overbought RSI and MACD bearish signal could trigger pullback to $${nextSupport} (or deeper to $${nextSupport2})`
      bearishProbability = 'High'
      bearishTimeframe = '1-2 days'
    } else if (rsi > 70) {
      bearishScenario = `📉 **Medium Probability**: Drop below $${supportLevel} support with overbought RSI could trigger pullback to $${nextSupport} (or deeper to $${nextSupport2})`
      bearishProbability = 'Medium'
    } else if (isLowVolume) {
      bearishScenario = `📉 **Medium Probability**: Drop below $${supportLevel} support with low volume weakness could trigger pullback to $${nextSupport}`
      bearishProbability = 'Medium'
    } else {
      bearishScenario = `📉 **Lower Probability**: Drop below $${supportLevel} support could trigger pullback to $${nextSupport}`
      bearishProbability = 'Low'
    }
  } else if (sma50 < latestPrice) {
    const smaLevel = sma50.toFixed(2)
    bearishScenario = `📊 **Medium Probability**: Break below $${smaLevel} (SMA 50) could signal trend reversal`
    bearishProbability = 'Medium'
  } else {
    bearishScenario = `📉 **Lower Probability**: Break below current support levels could trigger selling pressure`
    bearishProbability = 'Low'
  }
  
  let summary = `## 📌 Next Moves\n\n`
  
  // Enhanced scenario analysis
  summary += `### 🟢 Bullish Scenario (${bullishProbability} Probability)\n`
  summary += `${bullishScenario}\n`
  summary += `- **Timeframe**: ${bullishTimeframe}\n`
  summary += `- **Key Level**: $${resistance.toFixed(2)} (${distanceToResistance.toFixed(1)}% away)\n`
  summary += `- **Confirmation**: ${isHighVolume ? 'Strong volume' : 'Volume needed'}, ${macdSignal === 'Bullish' ? 'MACD bullish' : 'MACD neutral'}\n\n`
  
  summary += `### 🔴 Bearish Scenario (${bearishProbability} Probability)\n`
  summary += `${bearishScenario}\n`
  summary += `- **Timeframe**: ${bearishTimeframe}\n`
  summary += `- **Key Level**: $${support.toFixed(2)} (${distanceToSupport.toFixed(1)}% away)\n`
  summary += `- **Confirmation**: ${isLowVolume ? 'Low volume weakness' : 'Volume normal'}, RSI ${rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral'}\n\n`
  
  // Enhanced key levels with distances
  summary += `### 📊 Key Levels & Distances\n`
  summary += `- **Resistance**: $${resistance.toFixed(2)} (${distanceToResistance.toFixed(1)}% above current price)\n`
  summary += `- **Support**: $${support.toFixed(2)} (${distanceToSupport.toFixed(1)}% below current price)\n`
  summary += `- **SMA 20**: $${sma20.toFixed(2)} (${distanceToSMA20 > 0 ? '+' : ''}${distanceToSMA20.toFixed(1)}%)\n`
  summary += `- **SMA 50**: $${sma50.toFixed(2)} (${distanceToSMA50 > 0 ? '+' : ''}${distanceToSMA50.toFixed(1)}%)\n\n`
  
  // Enhanced technical indicators status
  summary += `### 📈 Technical Indicators Status\n`
  summary += `- **Volume**: ${isHighVolume ? 'High' : isLowVolume ? 'Low' : 'Normal'} (${(volumeRatio * 100).toFixed(0)}% of average)\n`
  summary += `- **MACD**: ${macdSignal} ${macdSignal === 'Bullish' ? '🟢' : macdSignal === 'Bearish' ? '🔴' : '⚪'}\n`
  summary += `- **RSI**: ${rsi.toFixed(1)} ${rsi > 70 ? '(Overbought) 🔴' : rsi < 30 ? '(Oversold) 🟢' : '(Neutral) ⚪'}\n\n`
  
  // Market sentiment and watch levels
  summary += `### 👀 Watch Levels\n`
  if (rsi > 70) {
    summary += `- **Overbought Alert**: RSI at ${rsi.toFixed(1)} - watch for reversal signals\n`
  }
  if (rsi < 30) {
    summary += `- **Oversold Opportunity**: RSI at ${rsi.toFixed(1)} - potential bounce zone\n`
  }
  if (isHighVolume) {
    summary += `- **Volume Spike**: ${(volumeRatio * 100).toFixed(0)}% above average - strong momentum\n`
  }
  if (isLowVolume) {
    summary += `- **Low Volume**: ${(volumeRatio * 100).toFixed(0)}% of average - weak momentum\n`
  }
  summary += `- **Current Price**: $${latestPrice.toFixed(2)}\n\n`

  return summary
}

// Re-export types for convenience
export * from './types'
