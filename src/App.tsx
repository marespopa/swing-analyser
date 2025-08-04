import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ComponentsPage from './pages/ComponentsPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="components" element={<ComponentsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
