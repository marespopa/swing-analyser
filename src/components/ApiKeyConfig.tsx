import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { apiKeyAtom } from '../store/apiKeyStore'
import Button from './ui/Button'
import Input from './ui/Input'

interface ApiKeyConfigProps {
  onClose?: () => void
}

const ApiKeyConfig = ({ onClose }: ApiKeyConfigProps) => {
  const [apiKey, setApiKey] = useAtom(apiKeyAtom)
  const [tempApiKey, setTempApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')

  useEffect(() => {
    // Load stored API key on mount
    if (apiKey) {
      setTempApiKey(apiKey)
    }
  }, [apiKey])

  const validateApiKey = async () => {
    if (!tempApiKey.trim()) {
      setValidationMessage('Please enter an API key')
      return
    }

    setIsValidating(true)
    setValidationMessage('')

    try {
      // Test the API key with a simple CoinGecko request
      const testResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&x_cg_demo_api_key=${tempApiKey}`)

      if (testResponse.ok) {
        // API key is valid
        setApiKey(tempApiKey)
        setValidationMessage('API key validated successfully!')
        setTimeout(() => {
          setValidationMessage('')
          onClose?.()
        }, 1500)
      } else {
        setValidationMessage('Invalid API key. Please check your key and try again.')
      }
    } catch {
      setValidationMessage('Failed to validate API key. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleSave = () => {
    if (tempApiKey.trim()) {
      setApiKey(tempApiKey)
      setValidationMessage('API key saved!')
      setTimeout(() => {
        setValidationMessage('')
        onClose?.()
      }, 1000)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Configure CoinGecko API Key
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        To use enhanced features, you can optionally add a CoinGecko API key for higher rate limits. 
        <a 
          href="https://www.coingecko.com/en/api" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary-600 dark:text-primary-400 hover:underline ml-1"
        >
          Get your API key here
        </a>
      </p>

      <div className="space-y-4">
        <div>
          <Input
            type="password"
            placeholder="Enter your CoinGecko API key"
            value={tempApiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempApiKey(e.target.value)}
            className="w-full"
          />
        </div>

        {validationMessage && (
          <div className={`text-sm p-3 rounded-md ${
            validationMessage.includes('success') || validationMessage.includes('saved')
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {validationMessage}
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={validateApiKey} 
            disabled={isValidating || !tempApiKey.trim()}
            className="flex-1"
          >
            {isValidating ? 'Validating...' : 'Validate & Save'}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!tempApiKey.trim()}
            variant="outline"
          >
            Save Only
          </Button>
        </div>

        {onClose && (
          <Button 
            onClick={onClose} 
            variant="ghost" 
            className="w-full"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

export default ApiKeyConfig
