import React, { useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { 
  filteredTradesAtom, 
  tradeStatsAtom, 
  tradeFiltersAtom,
  closeTradeAtom,
  cancelTradeAtom,
  deleteTradeAtom,
  clearAllTradesAtom,
  addTradeAtom,
  TradeEntry
} from '../stores/tradeLogStore';
import Button from './Button';

const TradeLog: React.FC = () => {
  const [filters, setFilters] = useAtom(tradeFiltersAtom);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeEntry | null>(null);
  const [closePrice, setClosePrice] = useState('');
  
  // Manual trade form state
  const [manualTrade, setManualTrade] = useState({
    coinName: '',
    coinSymbol: '',
    action: 'BUY' as 'BUY' | 'SELL' | 'HOLD',
    entryPrice: '',
    targetPrice: '',
    stopLoss: '',
    investmentAmount: '100'
  });

  const trades = useAtomValue(filteredTradesAtom);
  const stats = useAtomValue(tradeStatsAtom);
  
  const [, addTrade] = useAtom(addTradeAtom);
  const [, closeTrade] = useAtom(closeTradeAtom);
  const [, cancelTrade] = useAtom(cancelTradeAtom);
  const [, deleteTrade] = useAtom(deleteTradeAtom);
  const [, clearAllTrades] = useAtom(clearAllTradesAtom);



  const handleAddManualTrade = () => {
    const entryPrice = parseFloat(manualTrade.entryPrice);
    const targetPrice = parseFloat(manualTrade.targetPrice);
    const stopLoss = parseFloat(manualTrade.stopLoss);
    const investmentAmount = parseFloat(manualTrade.investmentAmount);
    
    if (!manualTrade.coinName || !manualTrade.coinSymbol || isNaN(entryPrice) || isNaN(investmentAmount)) {
      alert('Please fill in all required fields with valid values.');
      return;
    }
    
    // Calculate quantity based on investment amount and entry price
    const quantity = investmentAmount / entryPrice;
    
    addTrade({
      coinId: `manual_${Date.now()}`,
      coinName: manualTrade.coinName,
      coinSymbol: manualTrade.coinSymbol,
      coinImage: '',

      action: manualTrade.action,
      price: entryPrice,
      quantity,
      totalValue: investmentAmount,
      stopLoss: isNaN(stopLoss) ? undefined : stopLoss,
      takeProfit: isNaN(targetPrice) ? undefined : targetPrice,
      status: 'OPEN'
    });
    
    // Reset form
    setManualTrade({
      coinName: '',
      coinSymbol: '',
      action: 'BUY',
      entryPrice: '',
      targetPrice: '',
      stopLoss: '',
      investmentAmount: '100'
    });
    setShowAddTrade(false);
  };

  const handleCloseTrade = (tradeId: string) => {
    const price = parseFloat(closePrice);
    if (isNaN(price) || price <= 0) return;
    
    closeTrade(tradeId, price);
    setClosePrice('');
    setSelectedTrade(null);
  };

  const handleCancelTrade = (tradeId: string) => {
    cancelTrade(tradeId);
    setSelectedTrade(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Trading Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-800">{stats.totalTrades}</div>
            <div className="text-xs text-blue-600">Total Trades</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-800">{stats.openTrades}</div>
            <div className="text-xs text-green-600">Open</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-800">{stats.closedTrades}</div>
            <div className="text-xs text-purple-600">Closed</div>
          </div>
          <div className={`text-center p-3 rounded-lg border ${
            stats.totalProfitLoss >= 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`text-lg font-bold ${
              stats.totalProfitLoss >= 0 ? 'text-green-800' : 'text-red-800'
            }`}>
              {formatCurrency(stats.totalProfitLoss)}
            </div>
            <div className={`text-xs ${
              stats.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              P&L
            </div>
          </div>
          <div className={`text-center p-3 rounded-lg border ${
            stats.totalProfitLossPercentage >= 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`text-lg font-bold ${
              stats.totalProfitLossPercentage >= 0 ? 'text-green-800' : 'text-red-800'
            }`}>
              {stats.totalProfitLossPercentage.toFixed(2)}%
            </div>
            <div className={`text-xs ${
              stats.totalProfitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              P&L %
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-lg font-bold text-orange-800">{stats.winRate.toFixed(1)}%</div>
            <div className="text-xs text-orange-600">Win Rate</div>
          </div>
        </div>
        
        {stats.bestTrade && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-800">Best Trade</div>
            <div className="text-xs text-green-600">
              {stats.bestTrade.coinSymbol} - {formatCurrency(stats.bestTrade.profitLoss || 0)} 
              ({stats.bestTrade.profitLossPercentage?.toFixed(2)}%)
            </div>
          </div>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Trade History</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={() => setShowAddTrade(!showAddTrade)}
            >
              {showAddTrade ? 'Cancel' : 'Add Trade'}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Are you sure you want to clear all trades? This cannot be undone.')) {
                  clearAllTrades();
                }
              }}
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Manual Trade Form */}
        {showAddTrade && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Add Manual Trade</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coin Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Bitcoin"
                  value={manualTrade.coinName}
                  onChange={(e) => setManualTrade({ ...manualTrade, coinName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol *</label>
                <input
                  type="text"
                  placeholder="e.g., BTC"
                  value={manualTrade.coinSymbol}
                  onChange={(e) => setManualTrade({ ...manualTrade, coinSymbol: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action *</label>
                <select
                  value={manualTrade.action}
                  onChange={(e) => setManualTrade({ ...manualTrade, action: e.target.value as 'BUY' | 'SELL' | 'HOLD' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                  <option value="HOLD">Hold</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Price *</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 45000.00"
                  value={manualTrade.entryPrice}
                  onChange={(e) => setManualTrade({ ...manualTrade, entryPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Price</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 50000.00"
                  value={manualTrade.targetPrice}
                  onChange={(e) => setManualTrade({ ...manualTrade, targetPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stop Loss</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 40000.00"
                  value={manualTrade.stopLoss}
                  onChange={(e) => setManualTrade({ ...manualTrade, stopLoss: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (USDT) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 100"
                  value={manualTrade.investmentAmount}
                  onChange={(e) => setManualTrade({ ...manualTrade, investmentAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            

            
            <div className="mt-4 flex gap-2">
              <Button
                variant="success"
                onClick={handleAddManualTrade}
              >
                Add Trade
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowAddTrade(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
              <option value="HOLD">Hold</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search coins..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Trade List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        {trades.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 text-lg mb-2">No trades found</div>
            <p className="text-gray-400">Add your first trade to start tracking your swing trading performance</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{trade.coinName}</div>
                        <div className="text-sm text-gray-500">{trade.coinSymbol.toUpperCase()}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.action === 'BUY' 
                          ? 'bg-green-100 text-green-800' 
                          : trade.action === 'SELL'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(trade.price)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trade.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(trade.totalValue)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.status === 'OPEN' 
                          ? 'bg-blue-100 text-blue-800' 
                          : trade.status === 'CLOSED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {trade.profitLoss !== undefined ? (
                        <span className={`text-sm font-medium ${
                          trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(trade.profitLoss)}
                          {trade.profitLossPercentage && (
                            <span className="ml-1">
                              ({trade.profitLossPercentage >= 0 ? '+' : ''}{trade.profitLossPercentage.toFixed(2)}%)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(trade.timestamp)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        {trade.status === 'OPEN' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setSelectedTrade(trade)}
                            >
                              Close
                            </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => setSelectedTrade(trade)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this trade?')) {
                              deleteTrade(trade.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedTrade.status === 'OPEN' ? 'Close Trade' : 'Trade Details'}
            </h3>
            
            {selectedTrade.status === 'OPEN' && (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Close Price</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Enter close price"
                    value={closePrice}
                    onChange={(e) => setClosePrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-2 mt-6">
              {selectedTrade.status === 'OPEN' && (
                <>
                  <Button
                    variant="success"
                    onClick={() => handleCloseTrade(selectedTrade.id)}
                    disabled={!closePrice || parseFloat(closePrice) <= 0}
                    className="flex-1"
                  >
                    Close Trade
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleCancelTrade(selectedTrade.id)}
                    className="flex-1"
                  >
                    Cancel Trade
                  </Button>
                </>
              )}

              <Button
                variant="secondary"
                onClick={() => setSelectedTrade(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeLog; 