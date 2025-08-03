import React, { useState } from 'react';
import Button from './Button';
import Dropdown from './Dropdown';

interface SetupWizardProps {
  onComplete: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    defaultTimeframe: '24h',
    showNewsSentiment: true,
    riskTolerance: 'moderate'
  });

  const steps = [
    {
      id: 1,
      title: 'Welcome to Swing Analyser',
      description: 'Let\'s set up your trading analysis preferences',
      icon: '🚀'
    },
    {
      id: 2,
      title: 'Auto Refresh Settings',
      description: 'Configure how often data should refresh',
      icon: '⏰'
    },
    {
      id: 3,
      title: 'Default Timeframe',
      description: 'Choose your preferred analysis timeframe',
      icon: '📊'
    },
    {
      id: 4,
      title: 'Risk Tolerance',
      description: 'Set your risk management preferences',
      icon: '🛡️'
    },
    {
      id: 5,
      title: 'Ready to Start',
      description: 'Your Swing Analyser is configured and ready',
      icon: '✅'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save preferences to localStorage
      localStorage.setItem('swingAnalyserPreferences', JSON.stringify(preferences));
      localStorage.setItem('swingAnalyserSetupComplete', 'true');
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto text-3xl">
              📊
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Swing Analyser</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Your professional crypto swing trading companion. Get real-time market analysis, 
                entry signals, and risk management tools to make informed trading decisions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">📈</div>
                <h3 className="font-semibold text-gray-900">Real-time Analysis</h3>
                <p className="text-sm text-gray-600">Live market data and technical indicators</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900">Entry Signals</h3>
                <p className="text-sm text-gray-600">Precise buy/sell recommendations</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">🛡️</div>
                <h3 className="font-semibold text-gray-900">Risk Management</h3>
                <p className="text-sm text-gray-600">Stop-loss and take-profit guidance</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Auto Refresh Settings</h2>
              <p className="text-gray-600">Keep your data fresh with automatic updates</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Auto Refresh</h3>
                  <p className="text-sm text-gray-600">Automatically update market data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.autoRefresh}
                    onChange={(e) => updatePreference('autoRefresh', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {preferences.autoRefresh && (
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refresh Interval (seconds)
                  </label>
                  <Dropdown
                    value={preferences.refreshInterval.toString()}
                    onChange={(value) => updatePreference('refreshInterval', parseInt(value))}
                    options={[
                      { value: '15', label: '15 seconds' },
                      { value: '30', label: '30 seconds' },
                      { value: '60', label: '1 minute' },
                      { value: '120', label: '2 minutes' },
                      { value: '300', label: '5 minutes' }
                    ]}
                    placeholder="Select interval"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Default Timeframe</h2>
              <p className="text-gray-600">Choose your preferred analysis timeframe</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: '1h', label: '1 Hour', description: 'Short-term' },
                { value: '4h', label: '4 Hours', description: 'Medium-term' },
                { value: '24h', label: '24 Hours', description: 'Daily' },
                { value: '7d', label: '7 Days', description: 'Weekly' }
              ].map((timeframe) => (
                <button
                  key={timeframe.value}
                  onClick={() => updatePreference('defaultTimeframe', timeframe.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.defaultTimeframe === timeframe.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{timeframe.label}</div>
                  <div className="text-sm text-gray-600">{timeframe.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Risk Tolerance</h2>
              <p className="text-gray-600">Set your risk management preferences</p>
            </div>
            
            <div className="space-y-4">
              {[
                { value: 'conservative', label: 'Conservative', description: 'Lower risk, smaller gains', icon: '🛡️' },
                { value: 'moderate', label: 'Moderate', description: 'Balanced risk and reward', icon: '⚖️' },
                { value: 'aggressive', label: 'Aggressive', description: 'Higher risk, larger gains', icon: '🚀' }
              ].map((risk) => (
                <button
                  key={risk.value}
                  onClick={() => updatePreference('riskTolerance', risk.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    preferences.riskTolerance === risk.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{risk.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{risk.label}</div>
                      <div className="text-sm text-gray-600">{risk.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✅
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">You're All Set!</h2>
              <p className="text-gray-600 text-lg">
                Your Swing Analyser is configured and ready to help you make informed trading decisions.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-3">Your Settings:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• Auto Refresh: {preferences.autoRefresh ? `${preferences.refreshInterval}s` : 'Disabled'}</div>
                <div>• Default Timeframe: {preferences.defaultTimeframe}</div>
                <div>• Risk Tolerance: {preferences.riskTolerance}</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={handleBack}
            variant="secondary"
            disabled={currentStep === 1}
            className="px-6 py-2"
          >
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            variant="primary"
            className="px-6 py-2"
          >
            {currentStep === steps.length ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard; 