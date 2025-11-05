import React, { forwardRef, InputHTMLAttributes, useState } from 'react'
import { clsx } from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  success?: string
  hint?: string
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outline'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  hint,
  required,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  className,
  type,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  
  // Input size classes
  const sizeClasses = {
    sm: {
      input: 'px-3 py-2 text-sm',
      label: 'text-sm',
      hint: 'text-xs',
      icon: 'h-4 w-4'
    },
    md: {
      input: 'px-4 py-3 text-base',
      label: 'text-base',
      hint: 'text-sm',
      icon: 'h-5 w-5'
    },
    lg: {
      input: 'px-5 py-4 text-lg',
      label: 'text-lg',
      hint: 'text-base',
      icon: 'h-6 w-6'
    }
  }

  // Variant classes
  const variantClasses = {
    default: 'border border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    filled: 'border-0 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    outline: 'border-2 border-gray-300 bg-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
  }

  // State classes
  const stateClasses = clsx({
    // Error state
    'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500': error,
    // Success state
    'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500': success && !error,
    // Focus state
    'ring-2 ring-blue-500 ring-opacity-50': isFocused && !error && !success,
    // Default state
    'hover:border-gray-400': !error && !success && !isFocused
  })

  // Icon classes
  const iconClasses = sizeClasses[size].icon

  const actualType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : type

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={clsx(
            'block font-medium text-gray-700 mb-2',
            sizeClasses[size].label,
            { 'text-red-600': error, 'text-green-600': success }
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className={clsx(
            'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
            iconClasses
          )}>
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          type={actualType}
          className={clsx(
            'w-full rounded-lg font-medium transition-all duration-200',
            'placeholder-gray-400 text-gray-900',
            sizeClasses[size].input,
            variantClasses[variant],
            stateClasses,
            {
              'pl-12': leftIcon,
              'pr-12': rightIcon || showPasswordToggle,
              'pl-4': !leftIcon,
              'pr-4': !rightIcon && !showPasswordToggle
            },
            className
          )}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {showPasswordToggle && type === 'password' ? (
          <button
            type="button"
            className={clsx(
              'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors',
              iconClasses
            )}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        ) : rightIcon && (
          <div className={clsx(
            'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400',
            iconClasses
          )}>
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className={clsx(
          'mt-2 text-sm font-medium',
          sizeClasses[size].hint,
          'text-red-600'
        )}>
          {error}
        </p>
      )}

      {/* Success Message */}
      {success && !error && (
        <p className={clsx(
          'mt-2 text-sm font-medium',
          sizeClasses[size].hint,
          'text-green-600'
        )}>
          {success}
        </p>
      )}

      {/* Hint Text */}
      {hint && !error && !success && (
        <p className={clsx(
          'mt-2 text-sm text-gray-500',
          sizeClasses[size].hint
        )}>
          {hint}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input

// Export types for external use
export type { InputProps }