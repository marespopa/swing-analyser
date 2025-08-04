import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navigation from './Navigation'
import { ThemeToggle } from './ui'

const Layout: React.FC = () => {
  const location = useLocation()

  // Show header and navigation only for welcome page or components page
  const showHeader = location.pathname === '/' || location.pathname === '/components'

  return (
    <div className="min-h-screen bg-neo-surface p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header - only show for welcome page or components page */}
        {showHeader && (
          <header className="bg-neo-primary text-white p-6 mb-8 border-neo border-neo-border shadow-neo">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="text-5xl">📈</div>
                  <div>
                    <h1 className="text-4xl font-neo font-black">SWING ANALYSER</h1>
                    <p className="text-xl mt-2">Automated Crypto Portfolio & Swing Trading</p>
                  </div>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </header>
        )}

        {/* Navigation - only show for components page */}
        {window.location.pathname === '/components' && <Navigation />}

        {/* Page Content */}
        <Outlet />

        {/* Floating Theme Toggle - show on all pages except welcome */}
        {!showHeader && (
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
        )}
      </div>
    </div>
  )
}

export default Layout 