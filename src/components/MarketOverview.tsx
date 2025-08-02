import React from 'react';
import SearchAndSort from './SearchAndSort';
import RefreshControls from './RefreshControls';
import CoinCard from './CoinCard';

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
  emaLoading: boolean;
  handleManualRefresh: () => void;
  autoRefreshEnabled: boolean;
  toggleAutoRefresh: () => void;
  getTimeSinceRefresh: () => string;
  rateLimitInfo: {
    requestsThisMinute: number;
    lastReset: number;
  };
  MAX_REQUESTS_PER_MINUTE: number;
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
  emaLoading,
  handleManualRefresh,
  autoRefreshEnabled,
  toggleAutoRefresh,
  getTimeSinceRefresh,
  rateLimitInfo,
  MAX_REQUESTS_PER_MINUTE
}) => {
  return (
    <>
      {/* Search and Sort Controls */}
      <SearchAndSort
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
        toggleSortOrder={toggleSortOrder}
        filteredCoins={filteredCoins}
        coins={coins}
      />

      {/* Refresh Controls */}
      <RefreshControls
        loading={loading}
        emaLoading={emaLoading}
        handleManualRefresh={handleManualRefresh}
        autoRefreshEnabled={autoRefreshEnabled}
        toggleAutoRefresh={toggleAutoRefresh}
        getTimeSinceRefresh={getTimeSinceRefresh}
        rateLimitInfo={rateLimitInfo}
        MAX_REQUESTS_PER_MINUTE={MAX_REQUESTS_PER_MINUTE}
      />

      {/* Coins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCoins.map((coin, index) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            index={index}
            timeframe={timeframe}
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
    </>
  );
};

export default MarketOverview; 