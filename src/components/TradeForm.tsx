import React from 'react'
import { Button, Input } from './ui'

interface TradeFormProps {
  formData: {
    asset: string
    buyPrice: string
    stopLoss: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

const TradeForm: React.FC<TradeFormProps> = ({ formData, onInputChange, onSubmit }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Open New Trade</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Coin/Asset Name"
          name="asset"
          value={formData.asset}
          onChange={onInputChange}
          placeholder="BTC, ETH, etc."
          variant="default"
          inputSize="md"
        />
        <Input
          label="Buy Price *"
          name="buyPrice"
          type="number"
          value={formData.buyPrice}
          onChange={onInputChange}
          step="0.000001"
          required
          placeholder="0.00"
          variant="default"
          inputSize="md"
        />
        <Input
          label="Stop Loss (Optional)"
          name="stopLoss"
          type="number"
          value={formData.stopLoss}
          onChange={onInputChange}
          step="0.000001"
          placeholder="0.00"
          variant="default"
          inputSize="md"
        />
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Open Trade
        </Button>
      </form>
    </div>
  )
}

export default TradeForm
