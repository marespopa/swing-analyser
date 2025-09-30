import React from 'react'

interface ProgressBarProps {
  progress: number // 0-100
  message: string
  title?: string // Optional title prop with default value
  showRateLimit?: boolean
  rateLimitInfo?: {
    current: number
    remaining: number
    resetTime: number
  }
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  message,
  title = "GENERATING PORTFOLIO", // Default value for backward compatibility
  showRateLimit = false,
  rateLimitInfo
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neo-background dark:bg-neo-background-dark">
      <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-xl rounded-neo-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-neo font-black text-neo-text mb-2">
            {title}
          </h2>
          <p className="text-neo-text/80 font-neo">
            {message}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-neo-text/60 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-neo-border dark:bg-neo-border-dark rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neo-primary to-neo-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Rate Limit Info */}
        {showRateLimit && rateLimitInfo && (
          <div className="bg-neo-background dark:bg-neo-background-dark rounded-neo-lg p-4 mb-4">
            <div className="text-sm text-neo-text/80 mb-2">
              API Rate Limit Status
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-neo-text/60">Used:</span>
                <span className="ml-1 text-neo-text">{rateLimitInfo.current}/30</span>
              </div>
              <div>
                <span className="text-neo-text/60">Remaining:</span>
                <span className="ml-1 text-neo-text">{rateLimitInfo.remaining}</span>
              </div>
              <div className="col-span-2">
                <span className="text-neo-text/60">Resets at:</span>
                <span className="ml-1 text-neo-text">{formatTime(rateLimitInfo.resetTime)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading Animation */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neo-primary"></div>
        </div>
      </div>
    </div>
  )
}

export default ProgressBar 