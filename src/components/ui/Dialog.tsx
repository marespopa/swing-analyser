import React from 'react'
import Button from './Button'
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  children?: React.ReactNode
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  children
}) => {
  if (!isOpen) return null

  const getIconColor = () => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-neo-primary dark:text-neo-primary-dark'
    }
  }

  const iconColor = getIconColor()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-xl rounded-neo-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}>
            {variant === 'danger' && (
              <FaExclamationTriangle className="w-5 h-5" />
            )}
            {variant === 'warning' && (
              <FaExclamationTriangle className="w-5 h-5" />
            )}
            {variant === 'info' && (
              <FaInfoCircle className="w-5 h-5" />
            )}
          </div>
          <h2 className="text-xl font-neo font-black text-neo-text">
            {title}
          </h2>
        </div>

        {/* Message */}
        <p className="text-neo-text/80 mb-6 leading-relaxed">
          {message}
        </p>
        
        {/* Children content */}
        {children && (
          <div className="mb-6">
            {children}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            variant="primary"
            size="sm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Dialog 