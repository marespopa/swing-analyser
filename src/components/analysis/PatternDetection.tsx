import React from 'react'
import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

interface PatternDetectionProps {
  analysis: TechnicalAnalysisData | null
}

const PatternDetection: React.FC<PatternDetectionProps> = ({ analysis }) => {
  if (!analysis?.patternDetection) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Pattern Detection
      </h3>
      
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
