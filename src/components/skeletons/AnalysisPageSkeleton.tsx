import React from 'react'
import AnalysisHeaderSkeleton from './AnalysisHeaderSkeleton'
import AnalysisTechnicalDetailsSkeleton from './AnalysisTechnicalDetailsSkeleton'
import AnalysisChartSkeleton from './AnalysisChartSkeleton'
import PatternDetectionSkeleton from './PatternDetectionSkeleton'

const AnalysisPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 p-3 sm:p-4 min-h-screen relative">
      {/* Header Skeleton */}
      <AnalysisHeaderSkeleton />

      {/* Technical Details Skeleton */}
      <AnalysisTechnicalDetailsSkeleton />

      {/* Chart Skeleton */}
      <AnalysisChartSkeleton />

      {/* Pattern Detection Skeleton */}
      <PatternDetectionSkeleton />
    </div>
  )
}

export default AnalysisPageSkeleton
