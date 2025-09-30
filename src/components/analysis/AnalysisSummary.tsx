import React from 'react'
import Button from '../ui/Button'

interface AnalysisSummaryProps {
  summary: string
  onCopySummary: () => void
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({
  summary,
  onCopySummary
}) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          Summary
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
      <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
        <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
          {summary}
        </pre>
      </div>
    </div>
  )
}

export default AnalysisSummary
