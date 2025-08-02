import React from 'react';
import { useLocation } from 'react-router-dom';
import MarketSentimentWidget from './MarketSentimentWidget';

interface HeaderProps {
  loading: boolean;
  coins: any[];
  swingSignals: any[];
  allAnalyzedCoins?: any[];
  getMarketSentiment: () => {
    sentiment: string;
    upCount: number;
    downCount: number;
    neutralCount: number;
  };
  getSentimentIcon: (sentiment: string) => string;
}

const Header: React.FC<HeaderProps> = ({ 
  loading, 
  coins, 
  swingSignals, 
  allAnalyzedCoins, 
  getMarketSentiment, 
  getSentimentIcon 
}) => {
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'market'; // Remove leading slash

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              Swing Analyser
            </h1>
            <p className="text-gray-600 mt-2">Real-time cryptocurrency analysis & trading insights</p>
          </div>

          {/* Market Sentiment Widget */}
          {!loading && coins.length > 0 && activeTab === 'market' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <MarketSentimentWidget
                getMarketSentiment={getMarketSentiment}
                getSentimentIcon={getSentimentIcon}
              />
            </div>
          )}

          {/* Swing Strategy Stats */}
          {!loading && coins.length > 0 && activeTab === 'swing' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-800">
                    {swingSignals.length}
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">
                    Bullish Signals
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-800">
                    {allAnalyzedCoins?.length || 0}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    Analyzed Coins
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trade Stats for Trades Tab */}
          {!loading && activeTab === 'trades' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-800">
                    {coins.length}
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">
                    Total Coins
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-800">
                    {swingSignals.length}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">
                    Active Signals
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 