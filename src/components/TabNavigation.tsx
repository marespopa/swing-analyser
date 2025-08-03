import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TabNavigation: React.FC = () => {
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'market'; // Remove leading slash

  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1">
          <Link
            to="/recommended"
            className={`py-4 px-6 rounded-t-lg font-medium text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'recommended'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">🎯</span>
            Recommended Buys
          </Link>

          <Link
            to="/market"
            className={`py-4 px-6 rounded-t-lg font-medium text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'market'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">📊</span>
            Market Overview
          </Link>

          <Link
            to="/trades"
            className={`py-4 px-6 rounded-t-lg font-medium text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'trades'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">📋</span>
            Trade Log
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation; 