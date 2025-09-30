import React from 'react'
import ReactMarkdown from 'react-markdown'
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
      <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-600">
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-gray-200 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300">
          <ReactMarkdown>
            {summary}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export default AnalysisSummary
