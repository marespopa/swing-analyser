import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navigation from './components/Navigation'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load pages to reduce initial bundle size
const AnalysisFormPage = lazy(() => import('./pages/AnalysisFormPage'))
const AnalysisResultsPage = lazy(() => import('./pages/AnalysisResultsPage'))

function App() {
  console.log('App component rendering')
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
          <Navigation />
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<AnalysisFormPage />} />
              <Route path="/analysis/:coinId" element={<AnalysisResultsPage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
