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
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  sortOrder, 
  toggleSortOrder
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>



        {/* Sort Controls */}
        <div className="flex gap-3">
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <div className="text-sm text-gray-600">
              Auto-sorted by {sortBy === 'market_cap' ? 'Market Cap' : 
                sortBy === 'change_1h' ? '1h Change' :
                sortBy === 'change_4h' ? '4h Change' :
                sortBy === 'change_1d' ? 'Daily Change' :
                sortBy === 'change_1w' ? 'Weekly Change' : sortBy}
            </div>
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