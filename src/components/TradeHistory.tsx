import React from 'react'
import { Button } from './ui'

interface Trade {
  id: number
  asset: string
  buyPrice: number
  stopLoss: number | null
  closePrice: number | null
  profitAmount: number | null
  profitPercentage: number | null
  status: 'open' | 'closed'
  openDate: Date
  closeDate: Date | null
}

interface TradeHistoryProps {
  trades: Trade[]
  onClearHistory: () => void
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades, onClearHistory }) => {
  if (trades.length === 0) return null

  const openTrades = trades.filter(trade => trade.status === 'open')
  const closedTrades = trades.filter(trade => trade.status === 'closed')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/20 p-6 mt-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Trade History</h3>
        <Button onClick={onClearHistory} variant="danger" size="sm">
          Clear History
        </Button>
      </div>
      
      {/* Open Trades */}
      {openTrades.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Open Trades</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Asset</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Buy</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">SL</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Open Date</th>
                </tr>
              </thead>
              <tbody>
                {openTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="py-2 px-2 font-medium text-gray-900 dark:text-white">{trade.asset || 'N/A'}</td>
                    <td className="py-2 px-2 text-gray-700 dark:text-gray-300">${trade.buyPrice.toFixed(6)}</td>
                    <td className="py-2 px-2 text-gray-700 dark:text-gray-300">{trade.stopLoss ? `$${trade.stopLoss.toFixed(6)}` : '-'}</td>
                    <td className="py-2 px-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Open
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-700 dark:text-gray-300">{trade.openDate.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Closed Trades */}
      {closedTrades.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Closed Trades</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Asset</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Buy</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">SL</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Close</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Profit $</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Profit %</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Close Date</th>
                </tr>
              </thead>
              <tbody>
                {closedTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="py-2 px-2 font-medium text-gray-900 dark:text-white">{trade.asset || 'N/A'}</td>
                    <td className="py-2 px-2 text-gray-700 dark:text-gray-300">${trade.buyPrice.toFixed(6)}</td>
                    <td className="py-2 px-2 text-gray-700 dark:text-gray-300">{trade.stopLoss ? `$${trade.stopLoss.toFixed(6)}` : '-'}</td>
                    <td className="py-2 px-2 text-gray-700 dark:text-gray-300">${trade.closePrice!.toFixed(6)}</td>
                    <td className={`py-2 px-2 font-medium ${trade.profitAmount! >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ${trade.profitAmount!.toFixed(2)}
                    </td>
                    <td className={`py-2 px-2 font-medium ${trade.profitPercentage! >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {trade.profitPercentage!.toFixed(2)}%
                    </td>
                    <td className="py-2 px-2 text-gray-700 dark:text-gray-300">{trade.closeDate!.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradeHistory
