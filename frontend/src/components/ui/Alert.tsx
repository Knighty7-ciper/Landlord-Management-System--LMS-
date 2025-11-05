import React from 'react'
import { clsx } from 'clsx'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface AlertProps {
  children: React.ReactNode
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
  className?: string
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  icon,
  className
}) => {
  // Variant configurations
  const variantConfig = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-400',
      title: 'text-green-900',
      dismissButton: 'text-green-400 hover:text-green-600'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-400',
      title: 'text-red-900',
      dismissButton: 'text-red-400 hover:text-red-600'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-400',
      title: 'text-yellow-900',
      dismissButton: 'text-yellow-400 hover:text-yellow-600'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-400',
      title: 'text-blue-900',
      dismissButton: 'text-blue-400 hover:text-blue-600'
    }
  }

  // Default icons for each variant
  const defaultIcons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  }

  const config = variantConfig[variant]
  const defaultIcon = defaultIcons[variant]
  const displayIcon = icon || defaultIcon

  return (
    <div
      className={clsx(
        'border rounded-lg p-4',
        config.container,
        className
      )}
    >
      <div className="flex">
        {/* Icon */}
        <div className={clsx('flex-shrink-0 mr-3', config.icon)}>
          {displayIcon}
        </div>

        {/* Content */}
        <div className="flex-1">
          {title && (
            <h3 className={clsx('font-medium mb-1', config.title)}>
              {title}
            </h3>
          )}
          <div className={clsx(
            variant === 'success' ? 'text-green-700' :
            variant === 'error' ? 'text-red-700' :
            variant === 'warning' ? 'text-yellow-700' :
            'text-blue-700'
          )}>
            {children}
          </div>
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <div className="flex-shrink-0 ml-3">
            <button
              type="button"
              onClick={onDismiss}
              className={clsx(
                'inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                config.dismissButton
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert

// Export types for external use
export type { AlertProps }

// Toast notification component
interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose
}) => {
  // Auto-dismiss after duration
  React.useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  // Variant configurations for toast
  const toastVariantConfig = {
    success: {
      container: 'bg-green-50 border border-green-200 text-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />
    },
    error: {
      container: 'bg-red-50 border border-red-200 text-red-800',
      icon: <AlertCircle className="h-5 w-5 text-red-400" />
    },
    warning: {
      container: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />
    },
    info: {
      container: 'bg-blue-50 border border-blue-200 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const config = toastVariantConfig[type]

  return (
    <div className={clsx(
      'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5',
      config.container
    )}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              onClick={onClose}
              className={clsx(
                'rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2',
                type === 'success' && 'text-green-400 hover:text-green-600 focus:ring-green-600',
                type === 'error' && 'text-red-400 hover:text-red-600 focus:ring-red-600',
                type === 'warning' && 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-600',
                type === 'info' && 'text-blue-400 hover:text-blue-600 focus:ring-blue-600'
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { ToastProps }