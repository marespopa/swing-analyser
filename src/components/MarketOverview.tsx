import React, { useState } from 'react';
import SearchAndSort from './SearchAndSort';
import CoinCard from './CoinCard';
import CoinAnalysisModal from './CoinAnalysisModal';
import MarketSentimentWidget from './MarketSentimentWidget';

// Use the same Coin interface as CoinCard
interface CoinCardCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_4h_in_currency: number | null;
  price_change_percentage_24h: number;
  market_cap_change_percentage_24h: number;
  ath: number;
  ath_change_percentage: number;
}

interface MarketOverviewProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  sortBy: string;
  sortOrder: string;
  handleSort: (field: string) => void;
  toggleSortOrder: () => void;
  filteredCoins: any[];
  coins: any[];
  loading: boolean;
  // Market sentiment functions
  getMarketSentiment: () => {
    sentiment: string;
    upCount: number;
    downCount: number;
    neutralCount: number;
    total: number;
  };
  getSentimentIcon: (sentiment: string) => string;
  // Add analysis functions
  analyzeIndividualCoin?: (coin: any) => Promise<any>;
  individualAnalysisLoading?: boolean;
  individualAnalysisResult?: any;
  setIndividualAnalysisResult?: (result: any) => void;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({
  searchTerm,
  setSearchTerm,
  timeframe,
  setTimeframe,
  sortBy,
  sortOrder,
  handleSort,
  toggleSortOrder,
  filteredCoins,
  coins,
  loading,
  getMarketSentiment,
  getSentimentIcon,
  analyzeIndividualCoin,
  individualAnalysisLoading = false,
  individualAnalysisResult = null,
  setIndividualAnalysisResult
}) => {
  const [selectedCoin, setSelectedCoin] = useState<CoinCardCoin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCoinClick = (coin: CoinCardCoin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
    // Clear previous analysis result when selecting a new coin
    if (setIndividualAnalysisResult) {
      setIndividualAnalysisResult(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCoin(null);
  };

  const handleAnalyzeCoin = async (coin: CoinCardCoin) => {
    if (analyzeIndividualCoin) {
      await analyzeIndividualCoin(coin);
    }
  };



  return (
    <>
      {/* Search and Sort Controls */}
      <SearchAndSort
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
        toggleSortOrder={toggleSortOrder}
        filteredCoins={filteredCoins}
        coins={coins}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />

      {/* Market Sentiment Widget */}
      {!loading && coins.length > 0 && (
        <div className="mb-6">
          <MarketSentimentWidget
            getMarketSentiment={getMarketSentiment}
            getSentimentIcon={getSentimentIcon}
          />
        </div>
      )}

      {/* Coins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCoins.map((coin, index) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            index={index}
            timeframe={timeframe}
            onClick={handleCoinClick}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredCoins.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No cryptocurrencies found</div>
          <p className="text-gray-400">Try adjusting your search terms</p>
        </div>
      )}

      {/* Coin Analysis Modal */}
      <CoinAnalysisModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        coin={selectedCoin}
        analysisResult={individualAnalysisResult}
        isLoading={individualAnalysisLoading}
        onAnalyze={handleAnalyzeCoin}
      />
    </>
  );
};

export default MarketOverview; 