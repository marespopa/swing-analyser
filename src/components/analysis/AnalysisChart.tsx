import React from 'react'
import TechnicalAnalysisChart from '../TechnicalAnalysisChart'
import type { TechnicalAnalysisData } from '../../services/coingeckoApi'
import { FaExclamationTriangle, FaChartBar } from 'react-icons/fa'

interface AnalysisChartProps {
  analysis: TechnicalAnalysisData | null
  error: string | null
}

const AnalysisChart: React.FC<AnalysisChartProps> = ({
  analysis,
  error
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Price Chart & Technical Indicators
        </h3>
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-500 dark:text-red-400 mb-4">
              <FaExclamationTriangle className="mx-auto h-12 w-12" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Analysis Failed
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This could be due to insufficient data or API limitations.
            </p>
          </div>
        ) : analysis ? (
          <div className="max-h-[800px] md:max-h-[1000px] overflow-y-auto">
            {/* Data Quality Warning */}
            {analysis.dataQuality && !analysis.dataQuality.hasFullAnalysis && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Limited Analysis Available
                    </h3>
                    <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>
                        Only {analysis.dataQuality.totalDataPoints} data points available. 
                        {analysis.dataQuality.limitations && ` ${analysis.dataQuality.limitations}`}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center space-x-4 text-xs">
                          <span className={analysis.dataQuality.hasBasicIndicators ? "text-green-600" : "text-gray-400"}>
                            ✓ Basic Indicators
                          </span>
                          <span className={analysis.dataQuality.hasAdvancedIndicators ? "text-green-600" : "text-gray-400"}>
                            ✓ Advanced Indicators
                          </span>
                          <span className={analysis.dataQuality.hasPatternDetection ? "text-green-600" : "text-gray-400"}>
                            ✓ Pattern Detection
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <TechnicalAnalysisChart
              data={analysis}
              height={300}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <FaChartBar className="mx-auto h-12 w-12" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Data Available
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load analysis data.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalysisChart
