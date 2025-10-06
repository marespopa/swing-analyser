import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
            <div className="prose prose-sm max-w-none dark:prose-invert
              prose-headings:text-gray-900 dark:prose-headings:text-gray-100
              prose-p:text-gray-700 dark:prose-p:text-gray-300
              prose-strong:text-gray-900 dark:prose-strong:text-gray-100
              prose-table:text-gray-700 dark:prose-table:text-gray-300
              prose-th:text-gray-900 dark:prose-th:text-gray-100
              prose-td:text-gray-700 dark:prose-td:text-gray-300
              prose-hr:border-gray-300 dark:prose-hr:border-gray-600
              prose-em:text-gray-600 dark:prose-em:text-gray-400">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-left font-semibold" {...props}>
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2" {...props}>
                    {children}
                  </td>
                ),
                h1: ({ children, ...props }) => (
                  <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100" {...props}>
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 className="text-lg font-semibold mb-3 mt-6 text-gray-900 dark:text-gray-100" {...props}>
                    {children}
                  </h2>
                ),
                p: ({ children, ...props }) => (
                  <p className="mb-3 text-gray-700 dark:text-gray-300" {...props}>
                    {children}
                  </p>
                ),
                strong: ({ children, ...props }) => (
                  <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props}>
                    {children}
                  </strong>
                ),
                hr: ({ ...props }) => (
                  <hr className="my-6 border-gray-300 dark:border-gray-600" {...props} />
                ),
                em: ({ children, ...props }) => (
                  <em className="italic text-gray-600 dark:text-gray-400" {...props}>
                    {children}
                  </em>
                )
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>
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
