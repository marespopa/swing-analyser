import React, { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { atom, useAtom } from 'jotai'
import { LoadingOverlay } from '../components/ui'
import CoinAnalysisForm from '../components/CoinAnalysisForm'

// State atoms for technical analysis
const isLoadingAtom = atom(false)
const errorAtom = atom<string | null>(null)

const AnalysisFormPage: React.FC = () => {
  const location = useLocation()
  const [isLoading] = useAtom(isLoadingAtom)
  const [error, setError] = useAtom(errorAtom)
  const formRef = useRef<HTMLDivElement>(null)

  // Check for messages and pre-selected coin from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message)
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state, setError])

  // No need for handleAnalysisComplete since the form doesn't trigger analysis

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16">

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setError(null)}
                    className="bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Main Content */}
        <div ref={formRef}>
          <div className="max-w-2xl mx-auto w-full">
            <CoinAnalysisForm
              onError={handleError}
              preSelectedCoin={location.state?.selectedCoin}
              autoAnalyze={location.state?.autoAnalyze}
            />
          </div>
        </div>

        {/* Loading Overlay - only show if there's a loading state from form */}
        {isLoading && (
          <LoadingOverlay 
            isLoading={isLoading}
            message="Processing form..."
          />
        )}

      </div>
    </div>
  )
}

export default AnalysisFormPage
