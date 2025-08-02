import React from 'react';
import Button from './Button';

interface SearchAndSortProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  sortBy: string;
  sortOrder: string;
  handleSort: (field: string) => void;
  filteredCoins: any[];
  coins: any[];
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  timeframe, 
  setTimeframe, 
  sortBy, 
  sortOrder, 
  handleSort, 
  filteredCoins, 
  coins 
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Cryptocurrencies
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by name or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Timeframe Selector */}
        <div>
          <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-2">
            Timeframe
          </label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="24h">24 Hours</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2">
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="market_cap">Market Cap</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="volume">Volume (24h)</option>
              <option value="change_1h">1h Change</option>
              <option value="change_4h">4h Change</option>
              <option value="change_24h">24h Change</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <Button
              onClick={() => handleSort(sortBy)}
              variant="ghost"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredCoins.length} of {coins.length} cryptocurrencies
      </div>
    </div>
  );
};

export default SearchAndSort; 