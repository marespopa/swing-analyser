import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  variant?: 'default' | 'filled' | 'outline'
  inputSize?: 'sm' | 'md' | 'lg'
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  variant = 'default', 
  inputSize = 'md', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'font-neo border-neo shadow-neo focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all'
  
  const variantClasses = {
    default: 'bg-neo-surface dark:bg-neo-surface-dark border-neo-border focus:border-neo-accent focus:ring-neo-accent',
    filled: 'bg-neo-surface dark:bg-neo-surface-dark border-neo-border focus:border-neo-accent focus:ring-neo-accent',
    outline: 'bg-transparent border-neo-border focus:border-neo-accent focus:ring-neo-accent'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }
  
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-400' : ''
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[inputSize]} ${errorClasses} ${className}`
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block font-neo font-bold text-neo-text text-sm">
          {label}
        </label>
      )}
      <input className={classes} {...props} />
      {error && (
        <p className="font-neo text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input 