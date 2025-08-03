import React, { useState, useEffect } from 'react';
import Button from './Button';
import { storeApiKey, getApiKeyInfo, removeApiKey, ApiKeyInfo } from '../utils/apiKeyManager';

interface ApiKeyConfigProps {
  onSave?: () => void;
  showInfo?: boolean;
}

const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ onSave, showInfo = true }) => {
  const [apiKey, setApiKey] = useState('');
  const [actualApiKey, setActualApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [apiKeyInfo, setApiKeyInfo] = useState<ApiKeyInfo | null>(null);

  useEffect(() => {
    const info = getApiKeyInfo();
    setApiKeyInfo(info);
    setActualApiKey(info.key || '');
    if (info.isConfigured) {
      setApiKey('••••••••••••••••'); // Show masked key
    }
  }, []);



  const handleSave = () => {
    storeApiKey(apiKey);
    const updatedInfo = getApiKeyInfo();
    setApiKeyInfo(updatedInfo);
    setActualApiKey(apiKey);
    setIsEditing(false);
    if (updatedInfo.isConfigured) {
      setApiKey('••••••••••••••••');
    } else {
      setApiKey('');
    }
    onSave?.();
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Use the stored actual API key when editing
    setApiKey(actualApiKey);
  };

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove the API key?')) {
      removeApiKey();
      const updatedInfo = getApiKeyInfo();
      setApiKeyInfo(updatedInfo);
      setActualApiKey('');
      setApiKey('');
      setIsEditing(false);
      onSave?.();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    const currentInfo = getApiKeyInfo();
    setApiKeyInfo(currentInfo);
    if (currentInfo.isConfigured) {
      setApiKey('••••••••••••••••');
    } else {
      setApiKey('');
    }
  };

  return (
    <div className="space-y-4">
      {showInfo && (
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
      )}

      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            CoinGecko API Key
          </label>
          <span className={`text-xs px-2 py-1 rounded-full ${
            apiKeyInfo?.isConfigured 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {apiKeyInfo?.isConfigured ? 'Configured' : 'Not configured'}
          </span>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Enter your CoinGecko API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500">
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
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={apiKey}
                disabled
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <Button
                onClick={handleEdit}
                variant="secondary"
                size="sm"
              >
                Edit
              </Button>
              {apiKeyInfo?.isConfigured && (
                <Button
                  onClick={handleRemove}
                  variant="danger"
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>
            {apiKeyInfo?.lastUpdated && (
              <p className="text-xs text-gray-500">
                Last updated: {new Date(apiKeyInfo.lastUpdated).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">API Key Benefits:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Higher rate limits (up to 50 calls/minute)</li>
          <li>• Access to historical data</li>
          <li>• Priority support</li>
          <li>• More detailed market data</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiKeyConfig; 