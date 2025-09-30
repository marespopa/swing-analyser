import React from 'react'
import { useAtom } from 'jotai'
import { tradesAtom, type Trade } from '../store/trades'

// Main TradeLog component
const TradeLog: React.FC = () => {
  // Use Jotai hook to access and modify trades state
  const [trades, setTrades] = useAtom(tradesAtom)
  
  // Form state for new trade entry
  const [formData, setFormData] = React.useState({
    asset: '',
    buyPrice: '',
    stopLoss: '',
    closePrice: '',
    notes: ''
  })

  // State for closing trades
  const [closingTrade, setClosingTrade] = React.useState<{
    tradeId: number | null
    closePrice: string
  }>({
    tradeId: null,
    closePrice: ''
  })

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Parse numeric values
    const buyPrice = parseFloat(formData.buyPrice)
    const closePrice = formData.closePrice ? parseFloat(formData.closePrice) : null
    const stopLoss = formData.stopLoss ? parseFloat(formData.stopLoss) : null
    
    // Validate required fields - only buyPrice is required
    if (!buyPrice) return
    
    // Calculate profit/loss only if close price is provided
    const profitLoss = closePrice ? closePrice - buyPrice : null
    const profitLossPercent = closePrice ? ((closePrice - buyPrice) / buyPrice) * 100 : null
    
    // Create new trade object
    const newTrade: Trade = {
      id: Date.now(), // Unique ID using timestamp
      asset: formData.asset,
      buyPrice,
      stopLoss,
      closePrice: closePrice || null, // null if no close price (open trade)
      isClosed: !!closePrice, // true if close price provided, false if open
      dateOpened: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      dateClosed: closePrice ? new Date().toISOString().split('T')[0] : null, // null if open
      profitLoss: closePrice ? profitLoss : null, // null if trade is open
      profitLossPercent: closePrice ? profitLossPercent : null, // null if trade is open
      notes: formData.notes // trade motivation and notes
    }
    
    // Add new trade to the beginning of the array
    setTrades(prev => [newTrade, ...prev])
    
    // Reset form
    setFormData({
      asset: '',
      buyPrice: '',
      stopLoss: '',
      closePrice: '',
      notes: ''
    })
  }

  // Clear all trade history
  const clearHistory = () => {
    setTrades([])
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Trade Log</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your trading performance</p>
        </header>

        {/* Trade Entry Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Enter New Trade</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Asset Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  name="asset"
                  value={formData.asset}
                  onChange={handleInputChange}
                  placeholder="BTC, ETH, AAPL, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Buy Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Buy Price *
                </label>
                <input
                  type="number"
                  name="buyPrice"
                  value={formData.buyPrice}
                  onChange={handleInputChange}
                  step="0.000001"
                  required
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Stop Loss */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stop Loss (Optional)
                </label>
                <input
                  type="number"
                  name="stopLoss"
                  value={formData.stopLoss}
                  onChange={handleInputChange}
                  step="0.000001"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Close Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Close Price (Optional)
                </label>
                <input
                  type="number"
                  name="closePrice"
                  value={formData.closePrice}
                  onChange={handleInputChange}
                  step="0.000001"
                  placeholder="Leave empty for open trade"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty to create an open trade. You can close it later.
                </p>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trade Notes & Motivation
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Why did you take this trade? What's your thesis? Any key levels to watch?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Document your trading rationale and key insights.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Add Trade
            </button>
          </form>
        </div>

        {/* Trade History Table */}
        {trades.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Trade History</h3>
              <button
                onClick={clearHistory}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors duration-200"
              >
                Clear History
              </button>
            </div>
            
            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Asset</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Buy</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">SL</th>
                                         <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Close</th>
                     <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">P/L %</th>
                     <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Notes</th>
                     <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                   </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                             <td className="py-2 px-2 text-gray-700 dark:text-gray-300">{trade.dateOpened}</td>
                       <td className="py-2 px-2 font-medium text-gray-900 dark:text-white">{trade.asset || 'N/A'}</td>
                       <td className="py-2 px-2 text-gray-700 dark:text-gray-300">${trade.buyPrice.toFixed(6)}</td>
                       <td className="py-2 px-2 text-gray-700 dark:text-gray-300">
                         {trade.stopLoss ? `$${trade.stopLoss.toFixed(6)}` : '-'}
                       </td>
                       <td className="py-2 px-2 text-gray-700 dark:text-gray-300">
                         {trade.closePrice ? (
                           `$${trade.closePrice.toFixed(6)}`
                         ) : (
                           <span className="italic text-gray-500">Open</span>
                         )}
                       </td>
                                              <td className="py-2 px-2 font-medium">
                         {trade.profitLossPercent !== null ? (
                           <span className={trade.profitLossPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                             {trade.profitLossPercent.toFixed(2)}%
                           </span>
                         ) : (
                           <span className="text-sm text-gray-400">*</span>
                         )}
                       </td>
                       <td className="py-2 px-2 text-gray-700 dark:text-gray-300 max-w-xs">
                         <div className="truncate" title={trade.notes}>
                           {trade.notes || '-'}
                         </div>
                       </td>
                       <td className="py-2 px-2">
                         {!trade.isClosed && (
                           <button
                             onClick={() => setClosingTrade({ tradeId: trade.id, closePrice: '' })}
                             className="px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded transition-colors duration-200"
                           >
                             Close Trade
                           </button>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
         )}

         {/* Close Trade Modal */}
         {closingTrade.tradeId && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
               <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Close Trade</h3>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Close Price *
                   </label>
                   <input
                     type="number"
                     value={closingTrade.closePrice}
                     onChange={(e) => setClosingTrade(prev => ({ ...prev, closePrice: e.target.value }))}
                     step="0.000001"
                     required
                     placeholder="0.00"
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                   />
                 </div>
                 
                 <div className="flex space-x-3">
                   <button
                     onClick={() => {
                       const closePrice = parseFloat(closingTrade.closePrice)
                       if (!closePrice) return
                       
                       setTrades(prev => prev.map(trade => {
                         if (trade.id === closingTrade.tradeId) {
                           const profitLoss = closePrice - trade.buyPrice
                           const profitLossPercent = (profitLoss / trade.buyPrice) * 100
                           
                           return {
                             ...trade,
                             closePrice,
                             isClosed: true,
                             dateClosed: new Date().toISOString().split('T')[0],
                             profitLoss,
                             profitLossPercent
                           }
                         }
                         return trade
                       }))
                       
                       setClosingTrade({ tradeId: null, closePrice: '' })
                     }}
                     className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                   >
                     Close Trade
                   </button>
                   
                   <button
                     onClick={() => setClosingTrade({ tradeId: null, closePrice: '' })}
                     className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                   >
                     Cancel
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   )
 }

export default TradeLog
