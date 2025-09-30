import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AnalysisFormPage from './pages/AnalysisFormPage'
import AnalysisResultsPage from './pages/AnalysisResultsPage'
import Navigation from './components/Navigation'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
          <Navigation />
          <Routes>
            <Route path="/" element={<AnalysisFormPage />} />
            <Route path="/analysis/:coinId" element={<AnalysisResultsPage />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
