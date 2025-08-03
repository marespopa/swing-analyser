// API Key Management Utility
// Handles secure storage and retrieval of CoinGecko API key

const API_KEY_STORAGE_KEY = 'swingAnalyser_coingeckoApiKey';

export interface ApiKeyInfo {
  key: string;
  lastUpdated: string;
  isConfigured: boolean;
}

/**
 * Store the CoinGecko API key in localStorage
 * @param apiKey - The API key to store
 */
export const storeApiKey = (apiKey: string): void => {
  try {
    const apiKeyInfo: ApiKeyInfo = {
      key: apiKey,
      lastUpdated: new Date().toISOString(),
      isConfigured: apiKey.length > 0
    };
    
    localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(apiKeyInfo));
  } catch (error) {
    console.error('Failed to store API key:', error);
  }
};

/**
 * Retrieve the CoinGecko API key from localStorage
 * @returns The API key or null if not found
 */
export const getApiKey = (): string | null => {
  try {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!stored) return null;
    
    const apiKeyInfo: ApiKeyInfo = JSON.parse(stored);
    return apiKeyInfo.key || null;
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
    return null;
  }
};

/**
 * Get API key information including configuration status
 * @returns API key info object
 */
export const getApiKeyInfo = (): ApiKeyInfo => {
  try {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!stored) {
      return {
        key: '',
        lastUpdated: new Date().toISOString(),
        isConfigured: false
      };
    }
    
    const apiKeyInfo: ApiKeyInfo = JSON.parse(stored);
    return {
      ...apiKeyInfo,
      isConfigured: apiKeyInfo.key && apiKeyInfo.key.length > 0
    };
  } catch (error) {
    console.error('Failed to retrieve API key info:', error);
    return {
      key: '',
      lastUpdated: new Date().toISOString(),
      isConfigured: false
    };
  }
};

/**
 * Remove the API key from localStorage
 */
export const removeApiKey = (): void => {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to remove API key:', error);
  }
};

/**
 * Check if API key is configured
 * @returns true if API key exists and is not empty
 */
export const isApiKeyConfigured = (): boolean => {
  const apiKey = getApiKey();
  return apiKey !== null && apiKey.length > 0;
};

/**
 * Get API key for use in API calls
 * @returns The API key or empty string if not configured
 */
export const getApiKeyForUse = (): string => {
  return getApiKey() || '';
}; 