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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hidden md:block relative z-20">
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
