import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'yellow' | 'purple' | 'lavender' | 'teal'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'cursor-pointer font-neo font-bold border-neo shadow-neo hover-press focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-neo-primary text-white border-neo-border hover:bg-purple-600 hover:border-purple-700 focus:ring-purple-400',
    secondary: 'bg-neo-secondary text-white border-neo-border hover:bg-lime-500 hover:border-lime-600 focus:ring-lime-300',
    accent: 'bg-neo-accent text-white border-neo-border hover:bg-purple-500 hover:border-purple-600 focus:ring-purple-300',
    outline: 'bg-transparent text-neo-text border-neo-border hover:bg-neo-accent hover:text-white hover:border-neo-accent focus:ring-neo-accent',
    ghost: 'bg-transparent text-neo-text border-transparent hover:bg-neo-surface hover:border-neo-border hover:text-neo-text focus:ring-neo-border',
    yellow: 'bg-neo-yellow text-neo-text border-neo-border hover:bg-yellow-500 hover:border-yellow-600 focus:ring-yellow-300',
    purple: 'bg-neo-purple text-white border-neo-border hover:bg-purple-700 hover:border-purple-800 focus:ring-purple-400',
    lavender: 'bg-neo-lavender text-neo-text border-neo-border hover:bg-purple-200 hover:border-purple-300 focus:ring-purple-300',
    teal: 'bg-neo-teal text-white border-neo-border hover:bg-teal-600 hover:border-teal-700 focus:ring-teal-300'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button 