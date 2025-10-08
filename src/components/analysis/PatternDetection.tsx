import React from 'react'
import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

interface PatternDetectionProps {
  analysis: TechnicalAnalysisData | null
}

const PatternDetection: React.FC<PatternDetectionProps> = ({ analysis }) => {
  if (!analysis?.patternDetection) {
    console.log('Pattern Detection: No patternDetection data available', { analysis })
    return null
  }

  // Check if any patterns exist
  const hasPatterns = analysis.patternDetection.triangles.length > 0 ||
    analysis.patternDetection.headAndShoulders.length > 0 ||
    analysis.patternDetection.doublePatterns.length > 0 ||
    analysis.patternDetection.cupAndHandle.length > 0 ||
    analysis.patternDetection.flags.length > 0 ||
    analysis.patternDetection.wedges.length > 0 ||
    analysis.patternDetection.highTrendlines.length > 0

  if (!hasPatterns) {
    console.log('Pattern Detection: No patterns found', { patternDetection: analysis.patternDetection })
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          Pattern Detection
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Patterns Detected</h4>
          <p className="text-gray-600 dark:text-gray-400">
            No significant chart patterns found in the recent price action. This could indicate:
          </p>
          <ul className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Price is in a consolidation phase</li>
            <li>• Market is showing random walk behavior</li>
            <li>• Patterns may be forming but not yet complete</li>
            <li>• Insufficient data for pattern recognition</li>
          </ul>
        </div>
      </div>
    )
  }

  // Calculate total patterns
  const totalPatterns = analysis.patternDetection.triangles.length +
    analysis.patternDetection.headAndShoulders.length +
    analysis.patternDetection.doublePatterns.length +
    analysis.patternDetection.cupAndHandle.length +
    analysis.patternDetection.flags.length +
    analysis.patternDetection.wedges.length +
    analysis.patternDetection.highTrendlines.length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Pattern Detection
        </h3>
        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded">
          {totalPatterns} PATTERNS
        </div>
      </div>
      {analysis.currentPrice && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="font-medium text-blue-700 dark:text-blue-300">💡 Live Analysis:</span> Pattern evaluations are based on the current live price of ${analysis.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}, ensuring you get the most up-to-date technical analysis.
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Triangle Patterns */}
        {analysis.patternDetection.triangles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              Triangle Patterns
              <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded">
                {analysis.patternDetection.triangles.length}
              </span>
            </h4>
            <div className="space-y-2">
              {analysis.patternDetection.triangles.slice(0, 3).map((pattern, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{pattern.pattern}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      pattern.signal === 'bullish' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : pattern.signal === 'bearish'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}>
                      {pattern.signal}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Confidence: {pattern.confidence}</div>
                    <div>Strength: {pattern.strength}</div>
                    {pattern.description && (
                      <div className="mt-1 text-xs">{pattern.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Head and Shoulders Patterns */}
        {analysis.patternDetection.headAndShoulders.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              Head and Shoulders
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                {analysis.patternDetection.headAndShoulders.length}
              </span>
            </h4>
            <div className="space-y-2">
              {analysis.patternDetection.headAndShoulders.slice(0, 2).map((pattern, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{pattern.pattern}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      pattern.signal === 'bullish' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : pattern.signal === 'bearish'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}>
                      {pattern.signal}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Confidence: {pattern.confidence}</div>
                    <div>Strength: {pattern.strength}</div>
                    {pattern.description && (
                      <div className="mt-1 text-xs">{pattern.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Double Patterns */}
        {analysis.patternDetection.doublePatterns.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              Double Patterns
              <span className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-medium rounded">
                {analysis.patternDetection.doublePatterns.length}
              </span>
            </h4>
            <div className="space-y-2">
              {analysis.patternDetection.doublePatterns.slice(0, 2).map((pattern, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{pattern.pattern}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      pattern.signal === 'bullish' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : pattern.signal === 'bearish'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}>
                      {pattern.signal}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Confidence: {pattern.confidence}</div>
                    <div>Strength: {pattern.strength}</div>
                    {pattern.description && (
                      <div className="mt-1 text-xs">{pattern.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cup and Handle Patterns */}
        {analysis.patternDetection.cupAndHandle.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              Cup and Handle
              <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded">
                {analysis.patternDetection.cupAndHandle.length}
              </span>
            </h4>
            <div className="space-y-2">
              {analysis.patternDetection.cupAndHandle.slice(0, 2).map((pattern, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{pattern.pattern}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      pattern.signal === 'bullish' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : pattern.signal === 'bearish'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}>
                      {pattern.signal}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Confidence: {pattern.confidence}</div>
                    <div>Strength: {pattern.strength}</div>
                    {pattern.description && (
                      <div className="mt-1 text-xs">{pattern.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flag Patterns */}
        {analysis.patternDetection.flags.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              Flag Patterns
              <span className="ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium rounded">
                {analysis.patternDetection.flags.length}
              </span>
            </h4>
            <div className="space-y-2">
              {analysis.patternDetection.flags.slice(0, 2).map((pattern, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{pattern.pattern}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      pattern.signal === 'bullish' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : pattern.signal === 'bearish'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}>
                      {pattern.signal}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Confidence: {pattern.confidence}</div>
                    <div>Strength: {pattern.strength}</div>
                    {pattern.description && (
                      <div className="mt-1 text-xs">{pattern.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wedge Patterns */}
        {analysis.patternDetection.wedges.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              Wedge Patterns
              <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded">
                {analysis.patternDetection.wedges.length}
              </span>
            </h4>
            <div className="space-y-2">
              {analysis.patternDetection.wedges.slice(0, 2).map((pattern, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{pattern.pattern}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      pattern.signal === 'bullish' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : pattern.signal === 'bearish'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}>
                      {pattern.signal}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Confidence: {pattern.confidence}</div>
                    <div>Strength: {pattern.strength}</div>
                    {pattern.description && (
                      <div className="mt-1 text-xs">{pattern.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatternDetection
