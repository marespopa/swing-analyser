import React from 'react';
import Button from './Button';

interface ErrorBannerProps {
  errorType: string | null;
  getErrorMessage: (errorType: string) => {
    title: string;
    message: string;
    action: string;
    severity: string;
  };
  handleRetry: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ errorType, getErrorMessage, handleRetry }) => {
  if (!errorType) return null;

  const errorInfo = getErrorMessage(errorType);
  const bgColor = errorInfo.severity === 'error' ? 'bg-red-50 border-red-200' :
    errorInfo.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
      'bg-emerald-50 border-emerald-200';
  const textColor = errorInfo.severity === 'error' ? 'text-red-800' :
    errorInfo.severity === 'warning' ? 'text-yellow-800' :
      'text-emerald-800';

  return (
    <div className={`${bgColor} border rounded-xl p-6 mb-6 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor} mb-2`}>{errorInfo.title}</h3>
          <p className={`text-sm ${textColor} opacity-80`}>{errorInfo.message}</p>
        </div>
        <Button
          onClick={handleRetry}
          variant={errorInfo.severity === 'error' ? 'danger' : errorInfo.severity === 'warning' ? 'warning' : 'primary'}
          className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          {errorInfo.action}
        </Button>
      </div>
    </div>
  );
};

export default ErrorBanner; 