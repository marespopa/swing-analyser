import React from 'react';

interface MarketSentiment {
  sentiment: string;
  upCount: number;
  downCount: number;
  neutralCount: number;
  total: number;
}

interface MarketSentimentWidgetProps {
  getMarketSentiment: () => MarketSentiment;
  getSentimentIcon: (sentiment: string) => string;
}

const MarketSentimentWidget: React.FC<MarketSentimentWidgetProps> = ({
  getMarketSentiment,
  getSentimentIcon
}) => {
  const sentiment = getMarketSentiment();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-w-[220px]">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          sentiment.sentiment === 'bullish' ? 'bg-emerald-100' : 
          sentiment.sentiment === 'bearish' ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          <span className="text-xl">{getSentimentIcon(sentiment.sentiment)}</span>
        </div>
        <div>
          <div className={`font-semibold text-lg capitalize ${
            sentiment.sentiment === 'bullish' ? 'text-emerald-700' : 
            sentiment.sentiment === 'bearish' ? 'text-red-700' : 'text-gray-700'
          }`}>
            {sentiment.sentiment} Market
          </div>
          <div className="text-sm text-gray-600">
            {sentiment.upCount} up • {sentiment.downCount} down • {sentiment.neutralCount} neutral
          </div>
          <div className="text-xs text-gray-500">
            Based on {sentiment.total} coins (excl. stablecoins & low-cap)
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSentimentWidget; 