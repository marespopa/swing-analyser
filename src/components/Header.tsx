import React from 'react';
import MarketSentimentWidget from './MarketSentimentWidget';

interface HeaderProps {
  loading: boolean;
  coins: any[];
  activeTab: string;
  swingSignals: any[];
  allAnalyzedCoins?: any[];
  getMarketSentiment: () => {
    sentiment: string;
    upCount: number;
    downCount: number;
    neutralCount: number;
  };
  getSentimentColor: (sentiment: string) => string;
  getSentimentIcon: (sentiment: string) => string;
}

const Header: React.FC<HeaderProps> = ({ 
  loading, 
  coins, 
  activeTab, 
  swingSignals, 
  allAnalyzedCoins, 
  getMarketSentiment, 
  getSentimentColor, 
  getSentimentIcon 
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
              <span className="text-4xl">🚀</span>
              Swing Analyser
            </h1>
            <p className="text-blue-700 mt-2">Real-time data from CoinGecko API</p>
          </div>

          {/* Market Sentiment Widget */}
          {!loading && coins.length > 0 && activeTab === 'market' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <MarketSentimentWidget
                getMarketSentiment={getMarketSentiment}
                getSentimentColor={getSentimentColor}
                getSentimentIcon={getSentimentIcon}
              />
            </div>
          )}

          {/* Swing Strategy Stats */}
          {!loading && coins.length > 0 && activeTab === 'swing' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">
                    {swingSignals.length}
                  </div>
                  <div className="text-sm text-green-700">
                    Bullish Signals
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {allAnalyzedCoins?.length || 0}
                  </div>
                  <div className="text-sm text-blue-700">
                    Analyzed Coins
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