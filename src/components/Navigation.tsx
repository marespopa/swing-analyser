import { Link } from 'react-router-dom'
import ThemeToggle from './ui/ThemeToggle'
import { FaCheckCircle, FaBook, FaChartLine } from 'react-icons/fa'

const Navigation = () => {
  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">SwingAnalyser</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <FaChartLine className="w-4 h-4" />
              Analysis
            </Link>
            <Link
              to="/trade-log"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <FaBook className="w-4 h-4" />
              Trade Log
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
