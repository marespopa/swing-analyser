import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navigation: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="mb-8 flex gap-4">
      <Link
        to="/"
        className={`
          px-6 py-3 font-neo font-bold border-neo shadow-neo hover-press focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all
          ${isActive('/') 
            ? 'bg-neo-accent text-white border-neo-border focus:ring-neo-accent' 
            : 'bg-neo-secondary text-white border-neo-border hover:bg-teal-400 hover:border-teal-500 focus:ring-neo-secondary'
          }
        `}
      >
        MAIN APP
      </Link>
      <Link
        to="/components"
        className={`
          px-6 py-3 font-neo font-bold border-neo shadow-neo hover-press focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all
          ${isActive('/components') 
            ? 'bg-neo-accent text-white border-neo-border focus:ring-neo-accent' 
            : 'bg-neo-secondary text-white border-neo-border hover:bg-teal-400 hover:border-teal-500 focus:ring-neo-secondary'
          }
        `}
      >
        UI COMPONENTS
      </Link>
    </nav>
  )
}

export default Navigation 