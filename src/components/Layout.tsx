import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import { ThemeToggle } from './ui'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-neo-surface p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-neo-primary text-white p-6 mb-8 border-neo border-neo-border shadow-neo">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-neo font-black">NEO-BRUTALISM REACT APP</h1>
              <p className="text-xl mt-2">Vite + React + TypeScript + Tailwind + Jotai + Axios + React Router</p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Navigation */}
        <Navigation />

        {/* Page Content */}
        <Outlet />
      </div>
    </div>
  )
}

export default Layout 