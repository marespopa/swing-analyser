import React from 'react'
import { Button, Input } from './ui'

interface Trade {
  id: number
  asset: string
  buyPrice: number
  stopLoss: number | null
}

interface CloseTradeFormProps {
  openTrades: Trade[]
  selectedTradeId: number | null
  closeTradeData: { closePrice: string }
  onTradeSelect: (tradeId: number) => void
  onCloseTradeInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCloseTrade: (tradeId: number) => void
}

const CloseTradeForm: React.FC<CloseTradeFormProps> = ({
  openTrades,
  selectedTradeId,
  closeTradeData,
  onTradeSelect,
  onCloseTradeInputChange,
  onCloseTrade
}) => {
  if (openTrades.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Close Trade</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Trade
          </label>
          <select
            value={selectedTradeId || ''}
            onChange={(e) => onTradeSelect(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
          >
            <option value="">Choose a trade to close...</option>
            {openTrades.map(trade => (
              <option key={trade.id} value={trade.id}>
                {trade.asset || 'N/A'} - ${trade.buyPrice.toFixed(6)}
              </option>
            ))}
          </select>
        </div>
        {selectedTradeId && (
          <>
            <Input
              label="Close Price *"
              name="closePrice"
              type="number"
              value={closeTradeData.closePrice}
              onChange={onCloseTradeInputChange}
              step="0.000001"
              required
              placeholder="0.00"
              variant="default"
              inputSize="md"
            />
            <Button 
              onClick={() => onCloseTrade(selectedTradeId)} 
              variant="secondary" 
              size="lg" 
              className="w-full"
            >
              Close Trade
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default CloseTradeForm
