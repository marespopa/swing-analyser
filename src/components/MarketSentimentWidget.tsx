import React from 'react';

interface MarketSentiment {
  sentiment: string;
  upCount: number;
  downCount: number;
  neutralCount: number;
}

interface MarketSentimentWidgetProps {
  getMarketSentiment: () => MarketSentiment;
  getSentimentColor: (sentiment: string) => string;
  getSentimentIcon: (sentiment: string) => string;
}

const MarketSentimentWidget: React.FC<MarketSentimentWidgetProps> = ({
  getMarketSentiment,
  getSentimentColor,
  getSentimentIcon
}) => {
  const sentiment = getMarketSentiment();
  
  return (
    <div className={`rounded-xl border-2 p-4 ${getSentimentColor(sentiment.sentiment)}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getSentimentIcon(sentiment.sentiment)}</span>
        <div>
          <div className="font-bold text-lg capitalize">
            {sentiment.sentiment} Market
          </div>
          <div className="text-sm opacity-80">
            {sentiment.upCount} up • {sentiment.downCount} down • {sentiment.neutralCount} neutral
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSentimentWidget; 