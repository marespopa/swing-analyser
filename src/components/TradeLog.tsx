import React, { useState } from 'react'
import { useAtom } from 'jotai'
import { tradeLogAtom, addTradeLogEntry, updateEndingPortfolio } from '../store/tradeLog'
import Button from './ui/Button'
import Input from './ui/Input'
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaCheck } from 'react-icons/fa'

const TradeLog: React.FC = () => {
  const [tradeLog, setTradeLog] = useAtom(tradeLogAtom)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date
    text: '',
    startingPortfolio: '',
    endingPortfolio: ''
  })
  const [editEntry, setEditEntry] = useState({
    date: '',
    text: '',
    startingPortfolio: '',
    endingPortfolio: ''
  })
  const [addingEndingValue, setAddingEndingValue] = useState<string | null>(null)
  const [endingValue, setEndingValue] = useState('')

  const handleAddEntry = () => {
    const startingPortfolio = parseFloat(newEntry.startingPortfolio)
    const endingPortfolio = newEntry.endingPortfolio ? parseFloat(newEntry.endingPortfolio) : undefined

    if (!newEntry.text.trim() || isNaN(startingPortfolio) || startingPortfolio <= 0) {
      alert('Please fill in text and starting portfolio value')
      return
    }

    const entry = addTradeLogEntry({
      ...newEntry,
      startingPortfolio,
      endingPortfolio
    })
    setTradeLog(prev => ({
      ...prev,
      entries: [entry, ...prev.entries]
    }))
    
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      text: '',
      startingPortfolio: '',
      endingPortfolio: ''
    })
    setIsAdding(false)
  }

  const handleEditEntry = (entry: any) => {
    setEditEntry({
      date: entry.date,
      text: entry.text,
      startingPortfolio: entry.startingPortfolio.toString(),
      endingPortfolio: entry.endingPortfolio ? entry.endingPortfolio.toString() : ''
    })
    setEditingId(entry.id)
  }

  const handleSaveEdit = () => {
    const startingPortfolio = parseFloat(editEntry.startingPortfolio)
    const endingPortfolio = editEntry.endingPortfolio ? parseFloat(editEntry.endingPortfolio) : undefined

    if (!editEntry.text.trim() || isNaN(startingPortfolio) || startingPortfolio <= 0) {
      alert('Please fill in text and starting portfolio value')
      return
    }

    const profit = endingPortfolio ? endingPortfolio - startingPortfolio : undefined
    const profitPercentage = endingPortfolio && startingPortfolio !== 0
      ? ((endingPortfolio - startingPortfolio) / startingPortfolio) * 100
      : undefined

    setTradeLog(prev => ({
      ...prev,
      entries: prev.entries.map(entry => 
        entry.id === editingId 
          ? {
              ...entry,
              ...editEntry,
              startingPortfolio,
              endingPortfolio,
              profit,
              profitPercentage
            }
          : entry
      )
    }))
    
    setEditingId(null)
    setEditEntry({ date: '', text: '', startingPortfolio: '', endingPortfolio: '' })
  }

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this trade log entry?')) {
      setTradeLog(prev => ({
        ...prev,
        entries: prev.entries.filter(entry => entry.id !== id)
      }))
    }
  }

  const handleAddEndingValue = (id: string) => {
    setAddingEndingValue(id)
    setEndingValue('')
  }

  const handleSaveEndingValue = () => {
    if (!addingEndingValue || !endingValue || parseFloat(endingValue) <= 0) {
      alert('Please enter a valid ending portfolio value')
      return
    }

    const endingPortfolioValue = parseFloat(endingValue)
    setTradeLog(prev => ({
      ...prev,
      entries: prev.entries.map(entry => {
        if (entry.id === addingEndingValue) {
          return updateEndingPortfolio(entry, endingPortfolioValue)
        }
        return entry
      })
    }))

    setAddingEndingValue(null)
    setEndingValue('')
  }

  const handleCancelEndingValue = () => {
    setAddingEndingValue(null)
    setEndingValue('')
  }

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (percentage: number | undefined) => {
    if (percentage === undefined) return 'N/A'
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Trade Log
        </h3>
        <Button
          onClick={() => setIsAdding(true)}
          variant="primary"
          size="sm"
          className="flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>

      {/* Add New Entry Form */}
      {isAdding && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Trade Log Entry</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Starting Portfolio ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={newEntry.startingPortfolio}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, startingPortfolio: e.target.value }))}
                  className="w-full"
                  placeholder="1000.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ending Portfolio ($) <span className="text-gray-500 text-sm">(Optional - add later)</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={newEntry.endingPortfolio}
                onChange={(e) => setNewEntry(prev => ({ ...prev, endingPortfolio: e.target.value }))}
                className="w-full"
                placeholder="1200.00 (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trade Notes
              </label>
              <textarea
                value={newEntry.text}
                onChange={(e) => setNewEntry(prev => ({ ...prev, text: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={3}
                placeholder="Describe your trades, strategy, or observations..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddEntry} variant="primary" size="sm">
                <FaSave className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline" size="sm">
                <FaTimes className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Log Entries */}
      <div className="space-y-4">
        {tradeLog.entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No trade log entries yet. Add your first entry to start tracking your trades!</p>
          </div>
        ) : (
          tradeLog.entries.map(entry => (
            <div
              key={entry.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              {editingId === entry.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date
                      </label>
                      <Input
                        type="date"
                        value={editEntry.date}
                        onChange={(e) => setEditEntry(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Starting Portfolio ($)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editEntry.startingPortfolio}
                        onChange={(e) => setEditEntry(prev => ({ ...prev, startingPortfolio: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ending Portfolio ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editEntry.endingPortfolio}
                      onChange={(e) => setEditEntry(prev => ({ ...prev, endingPortfolio: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Trade Notes
                    </label>
                    <textarea
                      value={editEntry.text}
                      onChange={(e) => setEditEntry(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} variant="primary" size="sm">
                      <FaSave className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={() => setEditingId(null)} variant="outline" size="sm">
                      <FaTimes className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {entry.endingPortfolio ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.profit !== undefined && entry.profit >= 0 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {formatCurrency(entry.profit)} ({formatPercentage(entry.profitPercentage)})
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditEntry(entry)}
                        variant="outline"
                        size="sm"
                      >
                        <FaEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteEntry(entry.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Starting Portfolio:</span>
                      <span className="ml-2 font-medium">{formatCurrency(entry.startingPortfolio)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Ending Portfolio:</span>
                      {entry.endingPortfolio ? (
                        <span className="ml-2 font-medium">{formatCurrency(entry.endingPortfolio)}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 italic">Not set</span>
                          {addingEndingValue === entry.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={endingValue}
                                onChange={(e) => setEndingValue(e.target.value)}
                                placeholder="Enter ending value"
                                className="w-32"
                              />
                              <Button onClick={handleSaveEndingValue} size="sm" variant="primary">
                                <FaCheck className="w-3 h-3" />
                              </Button>
                              <Button onClick={handleCancelEndingValue} size="sm" variant="outline">
                                <FaTimes className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => handleAddEndingValue(entry.id)} 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                            >
                              Add Ending Value
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {entry.endingPortfolio && (
                    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Profit/Loss:</span>
                          <span className={`ml-2 font-bold ${entry.profit !== undefined && entry.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(entry.profit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Percentage:</span>
                          <span className={`ml-2 font-bold ${entry.profitPercentage !== undefined && entry.profitPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatPercentage(entry.profitPercentage)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {entry.text && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Notes:</span>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {entry.text}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TradeLog