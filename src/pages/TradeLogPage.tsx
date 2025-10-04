import React from 'react'
import TradeLog from '../components/TradeLog'

const TradeLogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-3 sm:p-4">
        <TradeLog />
      </div>
    </div>
  )
}

export default TradeLogPage
