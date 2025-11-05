import React, { forwardRef, HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  clickable?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  className,
  children,
  ...props
}, ref) => {
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  // Variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg border-0',
    outlined: 'bg-transparent border-2 border-gray-200',
    filled: 'bg-gray-50 border-0'
  }

  // Hover effects
  const hoverClasses = {
    true: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
    false: ''
  }

  // Clickable effects
  const clickableClasses = {
    true: 'cursor-pointer active:scale-98',
    false: ''
  }

  return (
    <div
      ref={ref}
      className={clsx(
        // Base classes
        'rounded-lg overflow-hidden',
        
        // Variant classes
        variantClasses[variant],
        
        // Padding classes
        paddingClasses[padding],
        
        // Interactive classes
        hoverClasses[hover],
        clickableClasses[clickable],
        
        // Custom className
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card

// Card Header Component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  title,
  subtitle,
  actions,
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'flex items-center justify-between border-b border-gray-200 pb-4 mb-4',
        className
      )}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  )
})

CardHeader.displayName = 'CardHeader'

// Card Content Component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({
  padding = 'md',
  className,
  children,
  ...props
}, ref) => {
  const contentPaddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  return (
    <div
      ref={ref}
      className={clsx(contentPaddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardContent.displayName = 'CardContent'

// Card Footer Component
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between'
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
  align = 'left',
  className,
  children,
  ...props
}, ref) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  }

  return (
    <div
      ref={ref}
      className={clsx(
        'flex items-center pt-4 border-t border-gray-200 mt-4',
        alignmentClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

CardFooter.displayName = 'CardFooter'

// Export types for external use
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps }