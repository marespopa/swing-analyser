import React from 'react'
import { IoClose } from 'react-icons/io5'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md'
      case 'md':
        return 'max-w-lg'
      case 'lg':
        return 'max-w-2xl'
      case 'xl':
        return 'max-w-4xl'
      default:
        return 'max-w-lg'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-xl rounded-neo-xl w-full ${getSizeClasses()}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neo-border">
          <h2 className="text-xl font-neo font-black text-neo-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-neo-text/60 hover:text-neo-text transition-colors cursor-pointer"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal 