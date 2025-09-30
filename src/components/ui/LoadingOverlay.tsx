import React from 'react'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  variant?: 'default' | 'minimal' | 'fullscreen'
  className?: string
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = 'Loading...', 
  variant = 'default',
  className = '' 
}) => {
  if (!isLoading) return null

  const baseClasses = 'fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm'
  const variantClasses = {
    default: 'bg-black/20',
    minimal: 'bg-black/10',
    fullscreen: 'bg-neo-background/80 dark:bg-neo-background-dark/80'
  }

  const contentClasses = {
    default: 'bg-neo-surface/95 dark:bg-neo-surface-dark/95 border-neo border-neo-border shadow-neo-lg p-8 rounded-neo-lg backdrop-blur-sm',
    minimal: 'bg-neo-surface/90 dark:bg-neo-surface-dark/90 border-neo border-neo-border shadow-neo p-6 rounded-neo backdrop-blur-sm',
    fullscreen: 'bg-transparent border-none shadow-none p-0'
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className={`${contentClasses[variant]} text-center max-w-sm mx-auto`}>
        {/* Animated Loading Spinner */}
        <div className="mb-6">
          <div className="relative w-16 h-16 mx-auto">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-neo-lavender dark:border-neo-lavender-dark rounded-full animate-pulse"></div>
            {/* Inner spinning ring */}
            <div className="absolute inset-2 border-4 border-transparent border-t-neo-primary dark:border-t-neo-primary-dark rounded-full animate-spin"></div>
            {/* Center dot */}
            <div className="absolute inset-6 bg-neo-secondary dark:bg-neo-secondary-dark rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <h3 className="font-neo font-bold text-neo-text text-lg">
            {message}
          </h3>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-neo-primary dark:bg-neo-primary-dark rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-neo-secondary dark:bg-neo-secondary-dark rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-neo-accent dark:bg-neo-accent-dark rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Progress bar for fullscreen variant */}
        {variant === 'fullscreen' && (
          <div className="mt-6 w-64 mx-auto">
            <div className="w-full bg-neo-surface/80 dark:bg-neo-surface-dark/80 border-neo border-neo-border rounded-neo overflow-hidden backdrop-blur-sm">
              <div className="h-2 bg-gradient-to-r from-neo-primary via-neo-secondary to-neo-accent animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingOverlay 