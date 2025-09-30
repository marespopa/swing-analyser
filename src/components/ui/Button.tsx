import React from 'react'
import type { ButtonProps } from '../../types'

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'cursor-pointer font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white border border-transparent focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-gray-800',
    secondary: 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white border border-transparent focus:ring-gray-500 focus:ring-offset-white dark:focus:ring-offset-gray-800',
    outline: 'bg-transparent text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-white dark:focus:ring-offset-gray-800',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-300 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-white dark:focus:ring-offset-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white border border-transparent focus:ring-red-500 focus:ring-offset-white dark:focus:ring-offset-gray-800'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]', // Increased touch target
    md: 'px-4 py-3 text-base min-h-[48px]', // Increased touch target
    lg: 'px-6 py-4 text-lg min-h-[52px]' // Increased touch target
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button 