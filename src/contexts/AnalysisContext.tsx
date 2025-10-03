import React, { createContext, useContext, type ReactNode } from 'react'

interface AnalysisContextType {
  isAnalysisRefreshing: boolean
  onAnalysisRefresh: () => void
  lastRefreshTime: Date | null
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

interface AnalysisProviderProps {
  children: ReactNode
  isAnalysisRefreshing: boolean
  onAnalysisRefresh: () => void
  lastRefreshTime: Date | null
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({
  children,
  isAnalysisRefreshing,
  onAnalysisRefresh,
  lastRefreshTime
}) => {
  return (
    <AnalysisContext.Provider
      value={{
        isAnalysisRefreshing,
        onAnalysisRefresh,
        lastRefreshTime
      }}
    >
      {children}
    </AnalysisContext.Provider>
  )
}

export const useAnalysisContext = (): AnalysisContextType => {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider')
  }
  return context
}
