import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import MarketSentimentWidget from './MarketSentimentWidget';
import { tradeStatsAtom } from '../stores/tradeLogStore';

interface HeaderProps {
  loading: boolean;
  coins: any[];
  getMarketSentiment: () => {
    sentiment: string;
    upCount: number;
    downCount: number;
    neutralCount: number;
    total: number;
  };
  getSentimentIcon: (sentiment: string) => string;
}

const Header: React.FC<HeaderProps> = ({ 
  loading, 
  coins, 
  getMarketSentiment, 
  getSentimentIcon 
}) => {
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'market'; // Remove leading slash
  const tradeStats = useAtomValue(tradeStatsAtom);

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                Swing Analyser
              </h1>
            </div>
            <p className="text-gray-600">Real-time cryptocurrency analysis & trading insights</p>
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



          {/* Trade Stats for Trades Tab */}
          {!loading && activeTab === 'trades' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-800">
                    {tradeStats.totalTrades}
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">
                    Total Trades
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">
                    {tradeStats.winningTrades}
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    Winning Trades
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-800">
                    {tradeStats.losingTrades}
                  </div>
                  <div className="text-sm text-red-700 font-medium">
                    Losing Trades
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 min-w-[140px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-800">
                    {tradeStats.winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    Win Rate
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