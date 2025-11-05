import React from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  outline?: boolean
  className?: string
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  outline = false,
  className
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  }

  // Variant classes for filled badges
  const filledVariantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-200 text-gray-900',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-indigo-100 text-indigo-800'
  }

  // Variant classes for outline badges
  const outlineVariantClasses = {
    default: 'border border-gray-300 text-gray-700 bg-transparent',
    primary: 'border border-blue-300 text-blue-700 bg-transparent',
    secondary: 'border border-gray-400 text-gray-800 bg-transparent',
    success: 'border border-green-300 text-green-700 bg-transparent',
    warning: 'border border-yellow-300 text-yellow-700 bg-transparent',
    danger: 'border border-red-300 text-red-700 bg-transparent',
    info: 'border border-indigo-300 text-indigo-700 bg-transparent'
  }

  return (
    <span
      className={clsx(
        // Base classes
        'inline-flex items-center font-medium',
        'transition-colors duration-200',
        
        // Size classes
        sizeClasses[size],
        
        // Variant classes
        outline ? outlineVariantClasses[variant] : filledVariantClasses[variant],
        
        // Rounded classes
        rounded ? 'rounded-full' : 'rounded-md',
        
        // Custom className
        className
      )}
    >
      {children}
    </span>
  )
}

export default Badge

// Export types for external use
export type { BadgeProps }

// Predefined status badges for common use cases
export const StatusBadge: React.FC<{
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'paid' | 'overdue'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  outline?: boolean
  className?: string
}> = ({ status, size = 'md', rounded = true, outline = false, className }) => {
  const statusConfig = {
    active: { label: 'Active', variant: 'success' as const },
    inactive: { label: 'Inactive', variant: 'default' as const },
    pending: { label: 'Pending', variant: 'warning' as const },
    approved: { label: 'Approved', variant: 'success' as const },
    rejected: { label: 'Rejected', variant: 'danger' as const },
    completed: { label: 'Completed', variant: 'info' as const },
    cancelled: { label: 'Cancelled', variant: 'danger' as const },
    paid: { label: 'Paid', variant: 'success' as const },
    overdue: { label: 'Overdue', variant: 'danger' as const }
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      size={size}
      rounded={rounded}
      outline={outline}
      className={className}
    >
      {config.label}
    </Badge>
  )
}

export const PriorityBadge: React.FC<{
  priority: 'low' | 'medium' | 'high' | 'urgent'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  outline?: boolean
  className?: string
}> = ({ priority, size = 'md', rounded = true, outline = false, className }) => {
  const priorityConfig = {
    low: { label: 'Low', variant: 'default' as const },
    medium: { label: 'Medium', variant: 'warning' as const },
    high: { label: 'High', variant: 'danger' as const },
    urgent: { label: 'Urgent', variant: 'danger' as const }
  }

  const config = priorityConfig[priority]

  return (
    <Badge
      variant={config.variant}
      size={size}
      rounded={rounded}
      outline={outline}
      className={className}
    >
      {config.label}
    </Badge>
  )
}

export const TypeBadge: React.FC<{
  type: 'info' | 'success' | 'warning' | 'error' | 'note'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  outline?: boolean
  className?: string
}> = ({ type, size = 'md', rounded = true, outline = false, className }) => {
  const typeConfig = {
    info: { label: 'Info', variant: 'info' as const },
    success: { label: 'Success', variant: 'success' as const },
    warning: { label: 'Warning', variant: 'warning' as const },
    error: { label: 'Error', variant: 'danger' as const },
    note: { label: 'Note', variant: 'default' as const }
  }

  const config = typeConfig[type]

  return (
    <Badge
      variant={config.variant}
      size={size}
      rounded={rounded}
      outline={outline}
      className={className}
    >
      {config.label}
    </Badge>
  )
}