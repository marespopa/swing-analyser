import React, { useState, useEffect } from 'react';
import Button from './Button';
import { storeApiKey, getApiKeyInfo } from '../utils/apiKeyManager';

interface SetupWizardProps {
  onComplete: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [existingApiKey, setExistingApiKey] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const apiKeyInfo = getApiKeyInfo();
    if (apiKeyInfo.isConfigured) {
      setExistingApiKey(apiKeyInfo.key);
      setApiKey(apiKeyInfo.key);
    }
  }, []);

  const handleSave = () => {
    if (apiKey) {
      storeApiKey(apiKey);
    }
    localStorage.setItem('swingAnalyserSetupComplete', 'true');
    onComplete();
  };

  const handleCancel = () => {
    onComplete();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">API Configuration</h2>
          <p className="text-gray-600">
            {existingApiKey ? 'Update your CoinGecko API key' : 'Configure your CoinGecko API key for enhanced data access'}
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-lg">ℹ️</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About API Keys</h3>
                <p className="text-sm text-blue-800">
                  A CoinGecko API key provides higher rate limits and access to premium features. 
                  Your API key is stored locally in your browser and is never shared.
                </p>
              </div>
            </div>
          </div>

          {existingApiKey && !isEditing ? (
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-start gap-3">
                <div className="text-emerald-600 text-lg">✅</div>
                <div>
                  <h3 className="font-semibold text-emerald-900 mb-1">API Key Configured</h3>
                  <p className="text-sm text-emerald-800 mb-3">
                    Your CoinGecko API key is already configured and working.
                  </p>
                  <Button
                    onClick={handleEdit}
                    variant="secondary"
                    size="sm"
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                  >
                    Edit API Key
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CoinGecko API Key (Optional)
              </label>
              <input
                type="password"
                placeholder="Enter your CoinGecko API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Leave empty to use the free tier. Get your API key at{' '}
                <a 
                  href="https://www.coingecko.com/en/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 underline"
                >
                  coingecko.com/api
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3">
          {existingApiKey && (
            <Button
              onClick={handleCancel}
              variant="secondary"
              className="px-6 py-2"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            variant="primary"
            className="px-6 py-2"
          >
            {existingApiKey ? 'Save Changes' : 'Get Started'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard; 