import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load pages to reduce initial bundle size
const AnalysisFormPage = lazy(() => import('./pages/AnalysisFormPage'))
const AnalysisResultsPage = lazy(() => import('./pages/AnalysisResultsPage'))
const TradeLogPage = lazy(() => import('./pages/TradeLogPage'))
const LegalTermsPage = lazy(() => import('./pages/LegalTermsPage'))

function App() {
  console.log('App component rendering')
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200 flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<AnalysisFormPage />} />
                <Route path="/analysis/:coinId" element={<AnalysisResultsPage />} />
                <Route path="/trade-log" element={<TradeLogPage />} />
                <Route path="/legal-terms" element={<LegalTermsPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
