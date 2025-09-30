import React from 'react'
import type { InputProps } from '../../types'

interface ExtendedInputProps extends InputProps {
  variant?: 'default' | 'filled' | 'outline'
  inputSize?: 'sm' | 'md' | 'lg'
}

const Input: React.FC<ExtendedInputProps> = ({ 
  label, 
  error, 
  variant = 'default', 
  inputSize = 'md', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200'
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary-500 focus:border-transparent dark:focus:ring-offset-gray-800',
    filled: 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary-500 focus:border-transparent dark:focus:ring-offset-gray-800',
    outline: 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary-500 focus:border-transparent dark:focus:ring-offset-gray-800'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  }
  
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-400' : ''
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[inputSize]} ${errorClasses} ${className}`
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input className={classes} {...props} />
      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input 