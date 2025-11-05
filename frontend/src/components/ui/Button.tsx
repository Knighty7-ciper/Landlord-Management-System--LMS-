import React, { forwardRef, ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  rounded?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = false,
  disabled,
  className,
  children,
  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    xs: {
      button: 'px-2.5 py-1.5 text-xs',
      icon: 'h-3 w-3',
      gap: 'gap-1'
    },
    sm: {
      button: 'px-3 py-2 text-sm',
      icon: 'h-4 w-4',
      gap: 'gap-1.5'
    },
    md: {
      button: 'px-4 py-2.5 text-base',
      icon: 'h-4 w-4',
      gap: 'gap-2'
    },
    lg: {
      button: 'px-6 py-3 text-lg',
      icon: 'h-5 w-5',
      gap: 'gap-2.5'
    },
    xl: {
      button: 'px-8 py-4 text-xl',
      icon: 'h-6 w-6',
      gap: 'gap-3'
    }
  }

  // Variant classes
  const variantClasses = {
    primary: {
      base: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      disabled: 'bg-blue-300 cursor-not-allowed',
      icon: 'text-white'
    },
    secondary: {
      base: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      disabled: 'bg-gray-300 cursor-not-allowed',
      icon: 'text-white'
    },
    outline: {
      base: 'border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      disabled: 'border-gray-200 text-gray-400 cursor-not-allowed',
      icon: 'text-gray-500'
    },
    ghost: {
      base: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      disabled: 'text-gray-400 cursor-not-allowed',
      icon: 'text-gray-500'
    },
    danger: {
      base: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      disabled: 'bg-red-300 cursor-not-allowed',
      icon: 'text-white'
    },
    success: {
      base: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      disabled: 'bg-green-300 cursor-not-allowed',
      icon: 'text-white'
    }
  }

  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={clsx(
        // Base classes
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95 transform',
        
        // Size classes
        sizeClasses[size].button,
        sizeClasses[size].gap,
        
        // Variant classes
        variantClasses[variant].base,
        isDisabled && variantClasses[variant].disabled,
        
        // Width classes
        fullWidth && 'w-full',
        
        // Rounded classes
        rounded ? 'rounded-full' : 'rounded-lg',
        
        // Custom className
        className
      )}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <Loader2 className={clsx(
          'animate-spin',
          sizeClasses[size].icon,
          variantClasses[variant].icon,
          children ? sizeClasses[size].gap : 'mr-0'
        )} />
      )}

      {/* Left Icon */}
      {!loading && leftIcon && (
        <span className={clsx(
          sizeClasses[size].icon,
          variantClasses[variant].icon,
          children ? sizeClasses[size].gap : 'mr-0'
        )}>
          {leftIcon}
        </span>
      )}

      {/* Button Text */}
      {children && (
        <span className="font-medium">
          {children}
        </span>
      )}

      {/* Right Icon */}
      {!loading && rightIcon && (
        <span className={clsx(
          sizeClasses[size].icon,
          variantClasses[variant].icon,
          children ? sizeClasses[size].gap : 'ml-0'
        )}>
          {rightIcon}
        </span>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button

// Export types for external use
export type { ButtonProps }