import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

interface AnalysisFibonacciLevelsProps {
  analysis: TechnicalAnalysisData | null
}

const AnalysisFibonacciLevels = ({ analysis }: AnalysisFibonacciLevelsProps) => {
  if (!analysis?.fibonacciLevels) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Fibonacci Levels
        </h3>
        <p className="text-gray-500 dark:text-gray-400">Fibonacci levels not available</p>
      </div>
    )
  }

  const fib = analysis.fibonacciLevels
  const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0

  // Determine which is the actual swing high and low for proper labeling
  const actualSwingHigh = Math.max(fib.swingHigh, fib.swingLow)
  const actualSwingLow = Math.min(fib.swingHigh, fib.swingLow)
  const isSwingHighAtZero = fib.level0 === actualSwingHigh

  // Define Fibonacci levels with their trading significance
  const levels = [
    { 
      name: isSwingHighAtZero ? '0% (Swing High)' : '0% (Swing Low)', 
      value: fib.level0, 
      significance: isSwingHighAtZero ? 'Strong resistance in uptrend' : 'Strong support in downtrend' 
    },
    { name: '23.6%', value: fib.level236, significance: 'Shallow retracement - strong momentum' },
    { name: '38.2%', value: fib.level382, significance: 'Common buy-the-dip zone' },
    { name: '50%', value: fib.level500, significance: 'Key psychological level' },
    { name: '61.8%', value: fib.level618, significance: 'Golden ratio - critical decision point' },
    { name: '76.4%', value: fib.level764, significance: 'Deep retracement zone' },
    { name: '78.6%', value: fib.level786, significance: 'Last chance for trend continuation' },
    { 
      name: isSwingHighAtZero ? '100% (Swing Low)' : '100% (Swing High)', 
      value: fib.level1000, 
      significance: isSwingHighAtZero ? 'Strong support in uptrend' : 'Strong resistance in downtrend' 
    }
  ]

  // Find which level the current price is closest to
  const closestLevel = levels.reduce((closest, level) => {
    const currentDiff = Math.abs(currentPrice - level.value)
    const closestDiff = Math.abs(currentPrice - closest.value)
    return currentDiff < closestDiff ? level : closest
  })

  const distance = ((currentPrice - closestLevel.value) / closestLevel.value * 100).toFixed(1)
  const direction = currentPrice > closestLevel.value ? 'above' : 'below'

  // Generate trading insight with confirmation signals from other indicators
  const generateTradingInsight = () => {
    if (!analysis) return 'Analysis data not available'
    
    const rsi = analysis.rsi?.[analysis.rsi.length - 1] || 50
    const macd = analysis.macd
    const bollingerBands = analysis.bollingerBands
    const sma20 = analysis.sma20?.[analysis.sma20.length - 1] || currentPrice
    const sma50 = analysis.sma50?.[analysis.sma50.length - 1] || currentPrice
    
    // Check for confirmation signals
    const isRSIBullish = rsi > 30 && rsi < 70
    const isRSIBearish = rsi < 70 && rsi > 30
    const isRSIOversold = rsi < 30
    const isRSIOverbought = rsi > 70
    
    const isMACDBullish = macd && macd.macd[macd.macd.length - 1] > macd.signal[macd.signal.length - 1]
    const isMACDBearish = macd && macd.macd[macd.macd.length - 1] < macd.signal[macd.signal.length - 1]
    
    const isPriceAboveSMA20 = currentPrice > sma20
    const isPriceBelowSMA20 = currentPrice < sma20
    const isSMA20AboveSMA50 = sma20 > sma50
    
    const isNearBollingerUpper = bollingerBands && currentPrice >= bollingerBands.upper[bollingerBands.upper.length - 1] * 0.98
    const isNearBollingerLower = bollingerBands && currentPrice <= bollingerBands.lower[bollingerBands.lower.length - 1] * 1.02
    
    let baseInsight = ''
    let confirmations: string[] = []
    let warnings: string[] = []
    
    if (fib.trend === 'uptrend') {
      if (currentPrice >= fib.level0) {
        baseInsight = 'Price at swing high - watch for reversal signals'
        if (isRSIOverbought) warnings.push('RSI overbought - reversal likely')
        if (isMACDBearish) warnings.push('MACD bearish divergence')
        if (isNearBollingerUpper) warnings.push('Near Bollinger upper band resistance')
      } else if (currentPrice <= fib.level618) {
        baseInsight = 'Deep retracement - potential buying opportunity if trend continues'
        if (isRSIOversold) confirmations.push('RSI oversold - good entry zone')
        if (isMACDBullish) confirmations.push('MACD bullish signal')
        if (isNearBollingerLower) confirmations.push('Near Bollinger lower band support')
        if (isPriceAboveSMA20 && isSMA20AboveSMA50) confirmations.push('Price above SMA20, uptrend intact')
      } else if (currentPrice <= fib.level382) {
        baseInsight = 'Good retracement level - consider buying the dip'
        if (isRSIBullish) confirmations.push('RSI in healthy range')
        if (isMACDBullish) confirmations.push('MACD bullish')
        if (isPriceAboveSMA20) confirmations.push('Price above SMA20')
      } else {
        baseInsight = 'Shallow retracement - strong uptrend momentum'
        if (isRSIOverbought) warnings.push('RSI overbought - may need correction')
        if (isPriceAboveSMA20 && isSMA20AboveSMA50) confirmations.push('Strong uptrend confirmed')
      }
    } else if (fib.trend === 'downtrend') {
      if (currentPrice <= fib.level1000) {
        baseInsight = 'Price at swing low - watch for reversal signals'
        if (isRSIOversold) warnings.push('RSI oversold - reversal possible')
        if (isMACDBullish) warnings.push('MACD bullish divergence')
        if (isNearBollingerLower) warnings.push('Near Bollinger lower band support')
      } else if (currentPrice >= fib.level382) {
        baseInsight = 'Shallow retracement - strong downtrend momentum'
        if (isRSIOverbought) confirmations.push('RSI overbought - good short entry')
        if (isMACDBearish) confirmations.push('MACD bearish')
        if (isPriceBelowSMA20) confirmations.push('Price below SMA20')
      } else {
        baseInsight = 'Good retracement level - consider selling the bounce'
        if (isRSIBearish) confirmations.push('RSI in healthy range for shorts')
        if (isMACDBearish) confirmations.push('MACD bearish')
        if (isPriceBelowSMA20) confirmations.push('Price below SMA20')
      }
    } else {
      baseInsight = 'Sideways market - Fibonacci levels may act as support/resistance'
      if (isNearBollingerUpper) warnings.push('Near resistance - watch for rejection')
      if (isNearBollingerLower) warnings.push('Near support - watch for bounce')
    }
    
    // Build final insight with confirmations and warnings
    let finalInsight = baseInsight
    
    if (confirmations.length > 0) {
      finalInsight += `\n\n✅ Confirmations: ${confirmations.join(', ')}`
    }
    
    if (warnings.length > 0) {
      finalInsight += `\n\n⚠️ Warnings: ${warnings.join(', ')}`
    }
    
    return finalInsight
  }
  
  const tradingInsight = generateTradingInsight()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📊 Fibonacci Analysis
      </h3>
      
      {/* Trend and Swing Info */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Trend:</span>
            <span className={`ml-1 font-semibold ${
              fib.trend === 'uptrend' ? 'text-green-600 dark:text-green-400' :
              fib.trend === 'downtrend' ? 'text-red-600 dark:text-red-400' :
              'text-yellow-600 dark:text-yellow-400'
            }`}>
              {fib.trend.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Swing High:</span>
            <span className="ml-1 font-mono">${actualSwingHigh.toFixed(4)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Swing Low:</span>
            <span className="ml-1 font-mono">${actualSwingLow.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Current Price Position */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm">
          <span className="font-medium text-gray-600 dark:text-gray-400">Current Price:</span>
          <span className="ml-1 font-mono font-semibold text-lg">${currentPrice.toFixed(4)}</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {direction} <strong>{closestLevel.name}</strong> by <strong>{Math.abs(parseFloat(distance))}%</strong>
        </div>
      </div>

      {/* Trading Insight */}
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="text-sm font-medium text-amber-800 dark:text-amber-200 whitespace-pre-line">
          💡 Trading Insight: {tradingInsight}
        </div>
      </div>

      {/* Fibonacci Levels */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Key Fibonacci Levels:
        </h4>
        <div className="space-y-2">
          {levels.map((level, index) => {
            const isCurrent = level.name === closestLevel.name
            const isAbove = currentPrice > level.value
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                  isCurrent
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                    : isAbove
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-center">
                  {isCurrent && <span className="text-blue-600 dark:text-blue-400 mr-2">→</span>}
                  <span className={`font-medium ${
                    isCurrent ? 'text-blue-800 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {level.name}
                  </span>
                  {isCurrent && <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Current)</span>}
                </div>
                <div className="font-mono font-semibold">
                  ${level.value.toFixed(4)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AnalysisFibonacciLevels
