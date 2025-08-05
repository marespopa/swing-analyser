import React, { useState } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { userPreferencesAtom, apiKeyAtom } from '../store'
import type { RiskProfile } from '../types'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { CacheService } from '../services/cache'

const SetupPage: React.FC = () => {
  const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom)
  const [apiKey, setApiKey] = useAtom(apiKeyAtom)
  const navigate = useNavigate()
  const [startingAmount, setStartingAmount] = useState(userPreferences.startingAmount.toString())
  const [riskProfile, setRiskProfile] = useState<RiskProfile>(userPreferences.riskProfile)
  const [showApiKey, setShowApiKey] = useState<boolean>(false)
  const [cacheInfo, setCacheInfo] = useState(CacheService.getCacheInfo())
  const [cacheEnabled, setCacheEnabled] = useState(CacheService.isEnabled())

  const riskProfiles = [
    {
      id: 'conservative' as RiskProfile,
      name: 'CONSERVATIVE',
      description: 'Lower risk, stable growth',
      details: 'Focus on established coins with lower volatility',
      color: 'bg-neo-primary dark:bg-neo-primary-dark',
      icon: '🛡️'
    },
    {
      id: 'balanced' as RiskProfile,
      name: 'BALANCED',
      description: 'Moderate risk, balanced growth',
      details: 'Mix of established and trending cryptocurrencies',
      color: 'bg-neo-secondary dark:bg-neo-secondary-dark',
      icon: '⚖️'
    },
    {
      id: 'aggressive' as RiskProfile,
      name: 'AGGRESSIVE',
      description: 'Higher risk, higher potential',
      details: 'Includes volatile coins and trending assets',
      color: 'bg-neo-accent dark:bg-neo-accent-dark',
      icon: '🚀'
    }
  ]

  const handleContinue = () => {
    const amount = parseFloat(startingAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid starting amount')
      return
    }

    // API key is automatically saved by Jotai atomWithStorage

    setUserPreferences({
      ...userPreferences,
      riskProfile,
      startingAmount: amount
    })

    navigate('/portfolio')
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleCacheToggle = () => {
    const newEnabled = !cacheEnabled
    setCacheEnabled(newEnabled)
    CacheService.setEnabled(newEnabled)
    setCacheInfo(CacheService.getCacheInfo())
  }

  const handleClearCache = () => {
    CacheService.clearCache()
    setCacheInfo(CacheService.getCacheInfo())
  }

  return (
    <div className="min-h-screen bg-neo-background dark:bg-neo-background-dark flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-xl p-8 rounded-neo-xl text-center mb-8">
          <h1 className="text-4xl font-neo font-black text-neo-text mb-4">
            SETUP YOUR PORTFOLIO
          </h1>
          <p className="text-lg font-neo text-neo-text/80">
            Choose your risk profile and starting amount to generate your optimal crypto portfolio
          </p>
        </div>

        {/* Risk Profile Selection */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
          <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
            SELECT RISK PROFILE
          </h2>
          <div className="space-y-4">
            {riskProfiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => setRiskProfile(profile.id)}
                className={`p-6 border-neo border-neo-border rounded-neo-lg cursor-pointer transition-all hover:shadow-neo-lg ${
                  riskProfile === profile.id
                    ? 'bg-neo-primary/10 dark:bg-neo-primary-dark/10 border-neo-primary dark:border-neo-primary-dark'
                    : 'bg-neo-surface/50 dark:bg-neo-surface-dark/50 hover:bg-neo-surface dark:hover:bg-neo-surface-dark'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${profile.color} rounded-neo-lg flex items-center justify-center`}>
                    <span className="text-2xl">{profile.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-neo font-black text-neo-text">
                      {profile.name}
                    </h3>
                    <p className="font-neo font-bold text-neo-text/80 mb-1">
                      {profile.description}
                    </p>
                    <p className="text-sm font-neo text-neo-text/60">
                      {profile.details}
                    </p>
                  </div>
                  {riskProfile === profile.id && (
                    <div className="w-6 h-6 bg-neo-primary dark:bg-neo-primary-dark rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Starting Amount */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
          <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
            ENTER STARTING AMOUNT
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-neo font-bold text-neo-text mb-2">
                INVESTMENT AMOUNT (USD)
              </label>
              <Input
                type="number"
                value={startingAmount}
                onChange={(e) => setStartingAmount(e.target.value)}
                placeholder="1000"
                min="1"
                step="0.01"
                className="text-2xl font-neo font-bold text-center"
              />
            </div>
            <p className="text-sm font-neo text-neo-text/60">
              This amount will be distributed across your selected cryptocurrencies based on your risk profile
            </p>
          </div>
        </div>

        {/* API Key (Optional) */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
          <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
            COINGECKO API KEY (OPTIONAL)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-neo font-bold text-neo-text mb-2">
                API KEY
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API key for premium features"
                  className="font-mono w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {apiKey && (
                <Button
                  onClick={() => setApiKey('')}
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                >
                  CLEAR API KEY
                </Button>
              )}
            </div>
            <div className="bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border p-4 rounded-neo">
              <h4 className="font-neo font-bold text-neo-text mb-2">API Key Benefits:</h4>
              <ul className="text-sm font-neo text-neo-text/80 space-y-1">
                <li>• Higher rate limits (up to 50 calls/minute vs 10-50 calls/minute)</li>
                <li>• Priority support</li>
                <li>• Access to additional endpoints</li>
                <li>• No rate limiting delays</li>
              </ul>
              <p className="text-xs font-neo text-neo-text/60 mt-3">
                Get your API key at: <a href="https://www.coingecko.com/en/api/pricing" target="_blank" rel="noopener noreferrer" className="underline">CoinGecko API Pricing</a>
              </p>
              <p className="text-xs font-neo text-neo-text/60 mt-2">
                💡 If you get rate limit errors, try clearing the API key to use the free tier via proxy
              </p>
            </div>
          </div>
        </div>

        {/* Cache Management */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-8 rounded-neo-lg mb-8">
          <h2 className="text-2xl font-neo font-black text-neo-text mb-6">
            CACHE SETTINGS
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-neo font-bold text-neo-text">Enable Cache</h4>
                <p className="text-sm font-neo text-neo-text/60">Store coin data locally to reduce API calls</p>
              </div>
              <Button
                onClick={handleCacheToggle}
                variant={cacheEnabled ? "primary" : "secondary"}
                size="sm"
              >
                {cacheEnabled ? "ENABLED" : "DISABLED"}
              </Button>
            </div>
            
            {cacheEnabled && (
              <div className="bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border p-4 rounded-neo">
                <h4 className="font-neo font-bold text-neo-text mb-2">Cache Status:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm font-neo text-neo-text/80">
                  <div>Top Coins: {cacheInfo.topCoinsCount}</div>
                  <div>Trending: {cacheInfo.trendingCoinsCount}</div>
                  <div>Volatile: {cacheInfo.volatileCoinsCount}</div>
                  <div>Individual: {cacheInfo.individualCoinsCount}</div>
                </div>
                <div className="mt-3">
                  <Button
                    onClick={handleClearCache}
                    variant="secondary"
                    size="sm"
                  >
                    CLEAR CACHE
                  </Button>
                </div>
              </div>
            )}
            
            <div className="bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border p-4 rounded-neo">
              <h4 className="font-neo font-bold text-neo-text mb-2">Cache Benefits:</h4>
              <ul className="text-sm font-neo text-neo-text/80 space-y-1">
                <li>• Faster loading times</li>
                <li>• Reduced API calls</li>
                <li>• Works offline for cached data</li>
                <li>• Automatic expiration (5 minutes)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleBack}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            BACK
          </Button>
          <Button
            onClick={handleContinue}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            GENERATE PORTFOLIO
          </Button>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-neo-surface/50 dark:bg-neo-surface-dark/50 border-neo border-neo-border shadow-neo p-6 rounded-neo-lg">
          <h3 className="font-neo font-black text-neo-text mb-3">
            PORTFOLIO SUMMARY
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-neo text-neo-text/60">Risk Profile</p>
              <p className="font-neo font-bold text-neo-text">
                {riskProfiles.find(p => p.id === riskProfile)?.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-neo text-neo-text/60">Starting Amount</p>
              <p className="font-neo font-bold text-neo-text">
                ${parseFloat(startingAmount) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupPage 