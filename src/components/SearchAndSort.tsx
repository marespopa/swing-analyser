import React from 'react';
import Button from './Button';

interface SearchAndSortProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  sortOrder: string;
  handleSort: (field: string) => void;
  toggleSortOrder: () => void;
  filteredCoins: any[];
  coins: any[];
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  sortOrder, 
  handleSort,
  toggleSortOrder,
  timeframe,
  setTimeframe
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Cryptocurrencies
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              placeholder="Search by name or symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-700">
            Timeframe
          </label>
          <div className="flex gap-1">
            {[
              { value: '1h', label: '1h' },
              { value: '1d', label: '1d' },
              { value: '1w', label: '1w' }
            ].map((tf) => (
              <Button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                variant={timeframe === tf.value ? 'primary' : 'ghost'}
                size="sm"
                className={`px-3 py-2 text-xs font-medium ${
                  timeframe === tf.value 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-3">
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
            >
              <option value="market_cap">Market Cap</option>
              <option value="price">Price</option>
              <option value="volume">Volume (24h)</option>
              <option value="change_1h">1h Change</option>
              <option value="change_1d">24h Change</option>
              <option value="change_1w">7d Change</option>
              <option value="name">Name (A-Z)</option>
              <option value="market_cap_rank">Rank</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <Button
              onClick={toggleSortOrder}
              variant="ghost"
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Helpful tip for swing trading */}
      {sortBy === 'market_cap' && sortOrder === 'desc' && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-emerald-800">
                <strong>Perfect for Swing Trading:</strong> Higher market cap coins typically have better liquidity, 
                tighter spreads, and more predictable price movements - ideal for swing trading strategies.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndSort; 