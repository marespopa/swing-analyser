import React from 'react';
import Button from './Button';
import Dropdown from './Dropdown';

interface SearchAndSortProps {
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
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  timeframe, 
  setTimeframe, 
  sortBy, 
  sortOrder, 
  handleSort, 
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

        {/* Timeframe Selector */}
        <div>
          <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-2">
            Timeframe
          </label>
          <Dropdown
            value={timeframe}
            onChange={setTimeframe}
            options={[
              { value: '1h', label: '1 Hour' },
              { value: '4h', label: '4 Hours' },
              { value: '24h', label: '24 Hours' }
            ]}
            placeholder="Select timeframe"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex gap-3">
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <Dropdown
              value={sortBy}
              onChange={handleSort}
              options={[
                { value: 'market_cap', label: 'Market Cap' },
                { value: 'name', label: 'Name' },
                { value: 'price', label: 'Price' },
                { value: 'volume', label: 'Volume (24h)' },
                { value: 'change_1h', label: '1h Change' },
                { value: 'change_4h', label: '4h Change' },
                { value: 'change_24h', label: '24h Change' }
              ]}
              placeholder="Select sort field"
            />
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
    </div>
  );
};

export default SearchAndSort; 