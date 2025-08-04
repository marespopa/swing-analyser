import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAtom } from 'jotai'
import { portfolioAtom } from './store'
import Layout from './components/Layout'
import WelcomePage from './pages/WelcomePage'
import SetupPage from './pages/SetupPage'
import PortfolioPage from './pages/PortfolioPage'
import DashboardPage from './pages/DashboardPage'
import ComponentsPage from './pages/ComponentsPage'

function App() {
  const [portfolio] = useAtom(portfolioAtom)

  // Check if portfolio exists in localStorage for dashboard route
  const checkPortfolioExists = () => {
    try {
      const stored = localStorage.getItem('crypto-portfolio')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<WelcomePage />} />
          <Route path="setup" element={<SetupPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="dashboard" element={
            (portfolio || checkPortfolioExists()) ? <DashboardPage /> : <Navigate to="/setup" replace />
          } />
          <Route path="components" element={<ComponentsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
