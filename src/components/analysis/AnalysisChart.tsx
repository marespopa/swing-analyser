import React from 'react'
import TechnicalAnalysisChart from '../TechnicalAnalysisChart'
import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

interface AnalysisChartProps {
  analysis: TechnicalAnalysisData | null
  error: string | null
}

const AnalysisChart: React.FC<AnalysisChartProps> = ({
  analysis,
  error
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hidden md:block relative z-20">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Price Chart & Technical Indicators
        </h3>
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-500 dark:text-red-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
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
            <TechnicalAnalysisChart
              data={analysis}
              height={300}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
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
