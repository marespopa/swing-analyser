export interface ErrorMessage {
  title: string;
  message: string;
  action: string;
  severity: 'error' | 'warning' | 'info';
}

export const getErrorMessage = (errorType: string): ErrorMessage => {
  switch (errorType) {
    case 'rate_limit':
      return {
        title: 'API Rate Limit Reached',
        message: 'CoinGecko API rate limit has been exceeded. Please wait a few minutes and try again.',
        action: 'Retry in 60 seconds',
        severity: 'warning'
      };
    case 'partial_rate_limit':
      return {
        title: 'Limited Data Available',
        message: 'Some coins were skipped due to API rate limits or insufficient historical data.',
        action: 'Continue with available data',
        severity: 'info'
      };
    case 'network':
      return {
        title: 'Network Error',
        message: 'Unable to connect to CoinGecko API. Please check your internet connection.',
        action: 'Retry',
        severity: 'error'
      };
    case 'calculation_failed':
      return {
        title: 'Calculation Failed',
        message: 'Failed to calculate technical indicators for some coins. Only coins with sufficient historical data are shown.',
        action: 'Continue with available data',
        severity: 'warning'
      };
    case 'partial_data':
      return {
        title: 'Partial Data Available',
        message: 'Some coins were skipped due to insufficient historical data. Results may be limited.',
        action: 'Continue with available data',
        severity: 'info'
      };
    case 'fallback_data':
      return {
        title: 'Using Basic Market Data',
        message: 'Advanced technical analysis unavailable due to API limitations. Using basic market metrics for swing signals.',
        action: 'Continue with basic data',
        severity: 'info'
      };
    default:
      return {
        title: 'Unknown Error',
        message: 'An unexpected error occurred. Please try again.',
        action: 'Retry',
        severity: 'error'
      };
  }
}; 