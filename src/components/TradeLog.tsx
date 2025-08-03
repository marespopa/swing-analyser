import React, { useState, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { 
  filteredTradesAtom, 
  tradeStatsAtom, 
  tradeFiltersAtom,
  closeTradeAtom,
  deleteTradeAtom,
  clearAllTradesAtom,
  addTradeAtom,
  tradeLogAtom,
  TradeEntry
} from '../stores/tradeLogStore';
import Button from './Button';
import Dropdown from './Dropdown';

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
  const [, deleteTrade] = useAtom(deleteTradeAtom);
  const [, clearAllTrades] = useAtom(clearAllTradesAtom);
  const [allTrades, setAllTrades] = useAtom(tradeLogAtom);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid close price');
      return;
    }
    
    closeTrade(tradeId, price);
    setClosePrice('');
    setSelectedTrade(null);
  };

  const handleExportTrades = () => {    
    console.log('Export clicked, allTrades:', allTrades);
    if (allTrades.length === 0) {
      alert('No trades to export');
      return;
    }

    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        trades: allTrades.map(trade => ({
          ...trade,
          timestamp: trade.timestamp instanceof Date ? trade.timestamp.toISOString() : trade.timestamp,
          closeTimestamp: trade.closeTimestamp instanceof Date ? trade.closeTimestamp.toISOString() : trade.closeTimestamp
        }))
      };
      console.log('Export data prepared:', exportData);

      // Create and download file using web APIs
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swing-analyser-trades-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`Trade log exported successfully! File downloaded as: swing-analyser-trades-${new Date().toISOString().split('T')[0]}.json`);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImportTrades = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);
        
        if (!importData.trades || !Array.isArray(importData.trades)) {
          throw new Error('Invalid file format: trades array not found');
        }

        const importedTrades: TradeEntry[] = importData.trades.map((trade: any) => ({
          ...trade,
          timestamp: new Date(trade.timestamp),
          closeTimestamp: trade.closeTimestamp ? new Date(trade.closeTimestamp) : undefined
        }));

        // Validate trade structure
        const validTrades = importedTrades.filter(trade => 
          trade.id && 
          trade.coinId && 
          trade.coinName && 
          trade.coinSymbol && 
          trade.action && 
          typeof trade.price === 'number' &&
          typeof trade.quantity === 'number' &&
          typeof trade.totalValue === 'number' &&
          trade.timestamp instanceof Date &&
          trade.status
        );

        if (validTrades.length === 0) {
          throw new Error('No valid trades found in the file');
        }

        if (validTrades.length !== importedTrades.length) {
          alert(`Warning: ${importedTrades.length - validTrades.length} trades were skipped due to invalid data.`);
        }

        setAllTrades(validTrades);
        alert(`Successfully imported ${validTrades.length} trades!`);
        
      } catch (error) {
        console.error('Import error:', error);
        alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  // Calculate total portfolio value
  const totalPortfolioValue = trades.reduce((sum, trade) => sum + trade.totalValue, 0);
  const averageTradeValue = trades.length > 0 ? totalPortfolioValue / trades.length : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Overview - Card-based design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Statistics Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Total Trades</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.totalTrades}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Open Trades</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.openTrades}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Closed Trades</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.closedTrades}</span>
            </div>
          </div>
        </div>

        {/* P&L Overview Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="bg-emerald-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-emerald-700">Total P&L</p>
                <p className={`text-2xl font-bold ${stats.totalProfitLoss >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                  {formatCurrency(stats.totalProfitLoss)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${stats.totalProfitLossPercentage >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {stats.totalProfitLossPercentage >= 0 ? '+' : ''}{stats.totalProfitLossPercentage.toFixed(2)}%
                </p>
                <div className={`text-xs ${stats.totalProfitLossPercentage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.totalProfitLossPercentage >= 0 ? '↗' : '↘'} {stats.totalProfitLossPercentage >= 0 ? 'Gain' : 'Loss'}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Win Rate</span>
              <span className="font-medium text-gray-900">{stats.winRate.toFixed(1)}%</span>
            </div>
            {stats.bestTrade && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Best Trade</span>
                <span className="font-medium text-emerald-700">
                  {stats.bestTrade.coinSymbol} +{formatCurrency(stats.bestTrade.profitLoss || 0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600">Portfolio</p>
              <p className="text-xs text-gray-500">Trading Summary</p>
            </div>
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            </div>
          </div>
          <div className="bg-emerald-600 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90">Total Value</p>
            <p className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Trade</span>
              <span className="font-medium text-gray-900">{formatCurrency(averageTradeValue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Trades</span>
              <span className="font-medium text-emerald-700">{stats.openTrades}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Trade Management</h3>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() => setShowAddTrade(!showAddTrade)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              {showAddTrade ? 'Cancel' : 'Add Trade'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportTrades}
              disabled={allTrades.length === 0}
            >
              Export ({allTrades.length})
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportTrades}
              className="hidden"
            />
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
          <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Add Manual Trade</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coin Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Bitcoin"
                  value={manualTrade.coinName}
                  onChange={(e) => setManualTrade({ ...manualTrade, coinName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symbol *</label>
                <input
                  type="text"
                  placeholder="e.g., BTC"
                  value={manualTrade.coinSymbol}
                  onChange={(e) => setManualTrade({ ...manualTrade, coinSymbol: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action *</label>
                <Dropdown
                  value={manualTrade.action}
                  onChange={(value) => setManualTrade({ ...manualTrade, action: value as 'BUY' | 'SELL' | 'HOLD' })}
                  options={[
                    { value: 'BUY', label: 'Buy' },
                    { value: 'SELL', label: 'Sell' },
                    { value: 'HOLD', label: 'Hold' }
                  ]}
                  placeholder="Select action"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entry Price *</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 45000.00"
                  value={manualTrade.entryPrice}
                  onChange={(e) => setManualTrade({ ...manualTrade, entryPrice: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Price</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 50000.00"
                  value={manualTrade.targetPrice}
                  onChange={(e) => setManualTrade({ ...manualTrade, targetPrice: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stop Loss</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 40000.00"
                  value={manualTrade.stopLoss}
                  onChange={(e) => setManualTrade({ ...manualTrade, stopLoss: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Amount (USDT) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 100"
                  value={manualTrade.investmentAmount}
                  onChange={(e) => setManualTrade({ ...manualTrade, investmentAmount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button
                variant="success"
                onClick={handleAddManualTrade}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Add Trade
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowAddTrade(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Dropdown
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value as any })}
              options={[
                { value: 'ALL', label: 'All' },
                { value: 'OPEN', label: 'Open' },
                { value: 'CLOSED', label: 'Closed' },
                { value: 'CANCELLED', label: 'Cancelled' }
              ]}
              placeholder="Select status"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <Dropdown
              value={filters.action}
              onChange={(value) => setFilters({ ...filters, action: value as any })}
              options={[
                { value: 'ALL', label: 'All' },
                { value: 'BUY', label: 'Buy' },
                { value: 'SELL', label: 'Sell' },
                { value: 'HOLD', label: 'Hold' }
              ]}
              placeholder="Select action"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <Dropdown
              value={filters.dateRange}
              onChange={(value) => setFilters({ ...filters, dateRange: value as any })}
              options={[
                { value: 'ALL', label: 'All Time' },
                { value: 'TODAY', label: 'Today' },
                { value: 'WEEK', label: 'This Week' },
                { value: 'MONTH', label: 'This Month' }
              ]}
              placeholder="Select date range"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search coins..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Trade List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {trades.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-500 text-lg mb-2">No trades found</div>
            <p className="text-gray-400">Add your first trade to start tracking your swing trading performance</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade Info</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry/Exit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk/Reward</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & P&L</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-50">
                    {/* Trade Info Column */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">{trade.coinName}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            trade.action === 'BUY' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : trade.action === 'SELL'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {trade.action}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{trade.coinSymbol.toUpperCase()}</div>
                        <div className="text-xs text-gray-400">{formatDate(trade.timestamp)}</div>
                      </div>
                    </td>

                    {/* Entry/Exit Column */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-500">Entry: </span>
                          <span className="font-medium text-gray-900">{formatCurrency(trade.price)}</span>
                        </div>
                        {trade.closePrice && (
                          <div className="text-sm">
                            <span className="text-gray-500">Exit: </span>
                            <span className="font-medium text-gray-900">{formatCurrency(trade.closePrice)}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Risk/Reward Column */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {trade.stopLoss && (
                          <div className="text-sm">
                            <span className="text-gray-500">SL: </span>
                            <span className="text-red-600 font-medium">{formatCurrency(trade.stopLoss)}</span>
                          </div>
                        )}
                        {trade.takeProfit && (
                          <div className="text-sm">
                            <span className="text-gray-500">TP: </span>
                            <span className="text-emerald-600 font-medium">{formatCurrency(trade.takeProfit)}</span>
                          </div>
                        )}
                        {trade.stopLoss && trade.takeProfit && (
                          <div className="text-xs">
                            <span className="text-gray-500">R/R: </span>
                            <span className={`font-medium ${
                              (() => {
                                const risk = Math.abs(trade.price - trade.stopLoss);
                                const reward = Math.abs(trade.takeProfit - trade.price);
                                const ratio = reward / risk;
                                return ratio >= 3 ? 'text-emerald-600' : 
                                       ratio >= 2 ? 'text-blue-600' : 
                                       ratio >= 1.5 ? 'text-yellow-600' : 'text-red-600';
                              })()
                            }`}>
                              {(() => {
                                const risk = Math.abs(trade.price - trade.stopLoss);
                                const reward = Math.abs(trade.takeProfit - trade.price);
                                const ratio = reward / risk;
                                return ratio.toFixed(1) + ':1';
                              })()}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Position Column */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-500">Qty: </span>
                          <span className="font-medium text-gray-900">{trade.quantity.toFixed(4)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Total: </span>
                          <span className="font-medium text-gray-900">{formatCurrency(trade.totalValue)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status & P&L Column */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          trade.status === 'OPEN' 
                            ? 'bg-blue-100 text-blue-800' 
                            : trade.status === 'CLOSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {trade.status}
                        </span>
                        {trade.profitLoss !== undefined && (
                          <div className="text-sm">
                            <span className={`font-medium ${
                              trade.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(trade.profitLoss)}
                            </span>
                            {trade.profitLossPercentage && (
                              <div className="text-xs text-gray-500">
                                {trade.profitLossPercentage >= 0 ? '+' : ''}{trade.profitLossPercentage.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {trade.status === 'OPEN' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedTrade(trade)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs w-full"
                          >
                            Close
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this trade?')) {
                              deleteTrade(trade.id);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs w-full"
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
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedTrade.status === 'OPEN' ? 'Close Trade' : 'Trade Details'}
            </h3>
            
            {selectedTrade.status === 'OPEN' && (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Close Price</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Enter close price"
                    value={closePrice}
                    onChange={(e) => setClosePrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              {selectedTrade.status === 'OPEN' && (
                <Button
                  variant="success"
                  onClick={() => handleCloseTrade(selectedTrade.id)}
                  disabled={!closePrice || parseFloat(closePrice) <= 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Close Trade
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() => setSelectedTrade(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeLog; 