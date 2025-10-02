import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { InputProps } from '../../types'

interface SearchResult {
  id: string
  name: string
  symbol: string
  marketCapRank: number | null
}

interface AutocompleteInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  onSelect: (item: SearchResult) => void
  searchResults: SearchResult[]
  isLoading?: boolean
  onSearch: (query: string) => void
  placeholder?: string
  minSearchLength?: number
  maxResults?: number
  className?: string
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSelect,
  searchResults,
  isLoading = false,
  onSearch,
  placeholder = "Start typing to search...",
  minSearchLength = 2,
  maxResults = 8,
  className = '',
  label,
  error,
  variant = 'default',
  inputSize = 'md',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [searchQuery, setSearchQuery] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<number | null>(null)

  // Sync external value with internal state
  useEffect(() => {
    setSearchQuery(value)
  }, [value])

  // Handle input changes with debounced search
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    onChange(newValue)
    setHighlightedIndex(-1)

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Show dropdown if we have enough characters
    if (newValue.trim().length >= minSearchLength) {
      setIsOpen(true)
      
      // Debounce search
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(newValue.trim())
      }, 300)
    } else {
      setIsOpen(false)
    }
  }, [onChange, onSearch, minSearchLength])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || searchResults.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim().length >= minSearchLength) {
        onSearch(searchQuery.trim())
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
          handleSelect(searchResults[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }, [isOpen, searchResults, highlightedIndex, searchQuery, minSearchLength, onSearch])

  // Handle item selection
  const handleSelect = useCallback((item: SearchResult) => {
    onSelect(item)
    setSearchQuery(`${item.name} (${item.symbol})`)
    onChange(`${item.name} (${item.symbol})`)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }, [onSelect, onChange])

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (searchQuery.trim().length >= minSearchLength && searchResults.length > 0) {
      setIsOpen(true)
    }
  }, [searchQuery, minSearchLength, searchResults.length])

  // Handle input blur
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't close if clicking on dropdown
    if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
      return
    }
    setIsOpen(false)
    setHighlightedIndex(-1)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Highlight search terms in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  // Base classes
  const baseClasses = 'w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200'
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary-500 focus:border-transparent dark:focus:ring-offset-gray-800',
    filled: 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary-500 focus:border-transparent dark:focus:ring-offset-gray-800',
    outline: 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary-500 focus:border-transparent dark:focus:ring-offset-gray-800'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-3 text-sm min-h-[44px]',
    md: 'px-3 py-3 text-base min-h-[48px]',
    lg: 'px-4 py-4 text-lg min-h-[52px]'
  }
  
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-400' : ''
  
  const inputClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[inputSize]} ${errorClasses} ${className}`

  return (
    <div className="space-y-2 relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          className={inputClasses}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          {...props}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          </div>
        )}
        
        {/* Clear button */}
        {searchQuery && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              onChange('')
              setIsOpen(false)
              setHighlightedIndex(-1)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-lg max-h-64 overflow-y-auto"
        >
          {searchResults.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </div>
              {searchResults.slice(0, maxResults).map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors cursor-pointer ${
                    index === highlightedIndex ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white truncate">
                        {highlightText(item.name, searchQuery)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {highlightText(item.symbol, searchQuery)}
                      </p>
                    </div>
                    {item.marketCapRank && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded ml-2 flex-shrink-0">
                        #{item.marketCapRank}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </>
          ) : searchQuery.trim().length >= minSearchLength && !isLoading ? (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No results found for "{searchQuery}"
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Try a different search term
              </p>
            </div>
          ) : null}
        </div>
      )}

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

export default AutocompleteInput
