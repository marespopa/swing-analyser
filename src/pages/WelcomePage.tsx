import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtom } from 'jotai'
import { portfolioAtom } from '../store'
import Button from '../components/ui/Button'

const WelcomePage: React.FC = () => {
  const navigate = useNavigate()
  const [portfolio] = useAtom(portfolioAtom)
  const [hasExistingPortfolio, setHasExistingPortfolio] = useState(false)

  // Check if portfolio exists in localStorage
  useEffect(() => {
    const checkPortfolio = () => {
      try {
        const stored = localStorage.getItem('crypto-portfolio')
        return stored ? JSON.parse(stored) : null
      } catch {
        return null
      }
    }
    
    const existingPortfolio = checkPortfolio()
    setHasExistingPortfolio(!!existingPortfolio)
    
    // Auto-redirect to dashboard if portfolio exists
    if (existingPortfolio && !portfolio) {
      // Small delay to ensure Jotai atom is ready
      setTimeout(() => {
        navigate('/dashboard')
      }, 100)
    }
  }, [portfolio, navigate])

  const handleGetStarted = () => {
    navigate('/setup')
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-neo-background dark:bg-neo-background-dark flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-xl p-12 rounded-neo-xl text-center mb-8">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-neo font-black text-neo-text mb-4">
              SWING ANALYSER
            </h1>
            <div className="w-32 h-2 bg-gradient-to-r from-neo-primary via-neo-secondary to-neo-accent mx-auto rounded-neo"></div>
          </div>
          
          <p className="text-2xl md:text-3xl font-neo font-bold text-neo-text mb-8 leading-relaxed">
            TURN YOUR STARTING AMOUNT INTO A SMART, ADAPTIVE CRYPTO PORTFOLIO
          </p>
          
          <p className="text-lg md:text-xl font-neo text-neo-text/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Get automated swing-trade suggestions powered by live market data. 
            Our AI analyzes market momentum, volatility, and trends to help you 
            build and optimize your crypto portfolio with confidence.
          </p>

          {hasExistingPortfolio ? (
            <div className="space-y-4">
              <p className="text-lg font-neo text-neo-text/80 mb-4">
                Welcome back! You have an existing portfolio ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGoToDashboard}
                  variant="primary"
                  size="lg"
                  className="text-xl px-12 py-6"
                >
                  GO TO DASHBOARD
                </Button>
                <Button
                  onClick={handleGetStarted}
                  variant="secondary"
                  size="lg"
                  className="text-xl px-12 py-6"
                >
                  CREATE NEW PORTFOLIO
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleGetStarted}
              variant="primary"
              size="lg"
              className="text-xl px-12 py-6"
            >
              START BUILDING YOUR PORTFOLIO
            </Button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg text-center">
            <div className="w-16 h-16 bg-neo-primary dark:bg-neo-primary-dark rounded-neo-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-neo font-black text-white">⚡</span>
            </div>
            <h3 className="text-xl font-neo font-black text-neo-text mb-3">
              AUTOMATED ANALYSIS
            </h3>
            <p className="font-neo text-neo-text/80">
              Real-time market scanning for swing trade opportunities
            </p>
          </div>

          <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg text-center">
            <div className="w-16 h-16 bg-neo-secondary dark:bg-neo-secondary-dark rounded-neo-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-neo font-black text-white">🎯</span>
            </div>
            <h3 className="text-xl font-neo font-black text-neo-text mb-3">
              RISK-ADAPTIVE
            </h3>
            <p className="font-neo text-neo-text/80">
              Portfolio tailored to your risk tolerance level
            </p>
          </div>

          <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg text-center">
            <div className="w-16 h-16 bg-neo-accent dark:bg-neo-accent-dark rounded-neo-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-neo font-black text-white">📊</span>
            </div>
            <h3 className="text-xl font-neo font-black text-neo-text mb-3">
              LIVE DATA
            </h3>
            <p className="font-neo text-neo-text/80">
              Powered by CoinGecko's comprehensive market data
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg">
          <h2 className="text-3xl font-neo font-black text-neo-text mb-6 text-center">
            HOW IT WORKS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-neo-primary dark:bg-neo-primary-dark rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-neo font-black text-white">1</span>
              </div>
              <h4 className="font-neo font-bold text-neo-text mb-2">SETUP</h4>
              <p className="text-sm font-neo text-neo-text/80">Choose risk level & starting amount</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-neo-secondary dark:bg-neo-secondary-dark rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-neo font-black text-white">2</span>
              </div>
              <h4 className="font-neo font-bold text-neo-text mb-2">ANALYZE</h4>
              <p className="text-sm font-neo text-neo-text/80">AI generates optimal portfolio</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-neo-accent dark:bg-neo-accent-dark rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-neo font-black text-white">3</span>
              </div>
              <h4 className="font-neo font-bold text-neo-text mb-2">MONITOR</h4>
              <p className="text-sm font-neo text-neo-text/80">Track performance & opportunities</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-neo-lavender dark:bg-neo-lavender-dark rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-neo font-black text-white">4</span>
              </div>
              <h4 className="font-neo font-bold text-neo-text mb-2">ACT</h4>
              <p className="text-sm font-neo text-neo-text/80">Execute swing trade suggestions</p>
            </div>
          </div>
        </div>

        {/* API Notice */}
        <div className="mt-8 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border shadow-neo p-6 rounded-neo-lg text-center">
          <p className="font-neo text-neo-text/70">
            <strong>Note:</strong> This app uses CoinGecko's free API. No API key required for basic functionality.
          </p>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow-neo p-4 rounded-neo-lg text-center">
          <p className="font-neo text-red-700 dark:text-red-300 text-sm">
            <strong>DISCLAIMER:</strong> This application is for educational purposes only. 
            Not financial advice. Cryptocurrency investments carry high risk. 
            <a href="/disclaimer" className="underline ml-1 hover:text-red-800 dark:hover:text-red-200">
              Read full terms
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage 