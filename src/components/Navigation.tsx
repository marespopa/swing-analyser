import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import ThemeToggle from './ui/ThemeToggle'
import { FaCheckCircle, FaBook, FaChartLine, FaBars, FaTimes } from 'react-icons/fa'

const Navigation = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/analysis/')
    }
    return location.pathname === path
  }
  
  // Helper function to get link classes
  const getLinkClasses = (path: string, isMobile = false) => {
    const baseClasses = isMobile 
      ? "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md transition-colors w-full"
      : "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors"
    const activeClasses = "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700"
    const inactiveClasses = "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">SwingAnalyser</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className={getLinkClasses('/')}
              >
                <FaChartLine className="w-4 h-4" />
                Analysis
              </Link>
              <Link
                to="/trade-log"
                className={getLinkClasses('/trade-log')}
              >
                <FaBook className="w-4 h-4" />
                Trade Log
              </Link>
            </div>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-5 h-5" />
              ) : (
                <FaBars className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={getLinkClasses('/', true)}
                onClick={closeMobileMenu}
              >
                <FaChartLine className="w-5 h-5" />
                Analysis
              </Link>
              <Link
                to="/trade-log"
                className={getLinkClasses('/trade-log', true)}
                onClick={closeMobileMenu}
              >
                <FaBook className="w-5 h-5" />
                Trade Log
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
