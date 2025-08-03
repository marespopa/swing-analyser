import React, { useState, useEffect } from 'react';
import { NewsSentimentAPI, NewsSentimentData } from '../utils/newsSentiment';
import LoadingSpinner from './LoadingSpinner';

interface NewsSentimentWidgetProps {
  coinSymbol: string;
}

const NewsSentimentWidget: React.FC<NewsSentimentWidgetProps> = ({ coinSymbol }) => {
  const [newsData, setNewsData] = useState<NewsSentimentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coinSymbol) {
      loadNewsSentiment();
    }
  }, [coinSymbol]);

  const loadNewsSentiment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const api = NewsSentimentAPI.getInstance();
      const data = await api.getCoinNewsSentiment(coinSymbol);
      setNewsData(data);
    } catch (err) {
      setError('Failed to load news sentiment data');
      console.error('Error loading news sentiment:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentIcon = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '➡️';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner message="Loading news sentiment..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={loadNewsSentiment}
            className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">📰</div>
          <div className="text-gray-600">No news data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">News Sentiment</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>📰</span>
          <span>{newsData.totalArticles} articles</span>
        </div>
      </div>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{newsData.positiveArticles}</div>
          <div className="text-sm text-gray-600">Positive</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{newsData.neutralArticles}</div>
          <div className="text-sm text-gray-600">Neutral</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{newsData.negativeArticles}</div>
          <div className="text-sm text-gray-600">Negative</div>
        </div>
      </div>

      {/* Average Sentiment */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Average Sentiment</div>
            <div className="text-lg font-bold text-gray-900">
              {((newsData.averageSentiment + 1) * 50).toFixed(1)}%
            </div>
          </div>
          <div className={`text-2xl ${getSentimentColor(
            newsData.averageSentiment > 0.2 ? 'positive' : 
            newsData.averageSentiment < -0.2 ? 'negative' : 'neutral'
          )}`}>
            {getSentimentIcon(
              newsData.averageSentiment > 0.2 ? 'positive' : 
              newsData.averageSentiment < -0.2 ? 'negative' : 'neutral'
            )}
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Recent Articles</h4>
        <div className="space-y-3">
          {newsData.recentArticles.map((article, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                    {article.title}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {article.source} • {formatDate(article.publishedAt)}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {article.description}
                  </div>
                </div>
                <div className="ml-3 flex flex-col items-end">
                  <div className={`text-sm font-medium ${getSentimentColor(article.sentiment)}`}>
                    {getSentimentIcon(article.sentiment)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((article.sentimentScore + 1) * 50).toFixed(0)}%
                  </div>
                </div>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Read More →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {newsData.lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default NewsSentimentWidget; 