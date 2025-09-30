import React, { useRef, useEffect, useState } from 'react'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  options: DropdownOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
}

const Dropdown: React.FC<DropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select an option', 
  label,
  disabled = false,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const selectedOption = options.find(option => option.value === value)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
  }
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block font-neo font-bold text-neo-text text-sm mb-2">
          {label}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full font-neo font-bold border-neo shadow-neo transition-all focus:outline-none focus:ring-2 focus:ring-offset-2
            ${disabled 
              ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
              : 'bg-neo-surface dark:bg-neo-surface-dark text-neo-text border-neo-border hover:bg-neo-background dark:hover:bg-neo-background-dark hover-lift focus:ring-neo-accent cursor-pointer'
            }
            px-4 py-3 text-left flex items-center justify-between
          `}
        >
          <span className={selectedOption ? 'text-neo-text' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="ml-2 text-neo-text">
            {isOpen ? '▲' : '▼'}
          </span>
        </button>
        
        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-lg">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full font-neo text-left px-4 py-3 border-b border-neo-border last:border-b-0
                  transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neo-accent cursor-pointer
                  ${option.value === value 
                    ? 'bg-neo-accent text-white' 
                    : 'bg-neo-surface dark:bg-neo-surface-dark text-neo-text hover:bg-neo-background dark:hover:bg-neo-background-dark'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dropdown 