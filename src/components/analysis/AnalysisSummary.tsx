import React from 'react'
import Button from '../ui/Button'
import { useAnalysisContext } from '../../contexts/AnalysisContext'

interface AnalysisSummaryProps {
  summary: string
  onCopySummary: () => void
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({
  summary,
  onCopySummary
}) => {
  const { isAnalysisRefreshing } = useAnalysisContext()
  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          Summary
          {isAnalysisRefreshing && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          )}
        </h3>
        <Button
          onClick={onCopySummary}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          📋 Copy
        </Button>
      </div>
      <div className={`bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-600 relative ${isAnalysisRefreshing ? 'opacity-60' : ''}`}>
        {isAnalysisRefreshing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-md">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        )}
        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {summary ? (
            <p>{summary}</p>
          ) : (
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-4/5"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-2/3"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalysisSummary
