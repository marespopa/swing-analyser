import React, { useEffect, useState } from 'react'
import Button from './Button'

interface ThemeToggleProps {
  className?: string
}

const ThemeToggle: React.FC<ThemeToggleProps> = () => {
  const [isDark, setIsDark] = useState(() => {
    // Initialize theme state immediately to prevent flash
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark')
        return true
      } else {
        document.documentElement.classList.remove('dark')
        return false
      }
    }
    return false
  })

  useEffect(() => {
    // Ensure theme is applied on mount
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="accent"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? 'DARK' : 'LIGHT'}
    </Button>
  )
}

export default ThemeToggle 