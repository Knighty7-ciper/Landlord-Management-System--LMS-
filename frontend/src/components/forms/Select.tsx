import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { ChevronDown, Check, X, Search } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  icon?: React.ReactNode
  description?: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string | number
  defaultValue?: string | number
  onChange?: (value: string | number, option: SelectOption) => void
  placeholder?: string
  label?: string
  error?: string
  success?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outline'
  searchable?: boolean
  clearable?: boolean
  multiple?: boolean
  className?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select an option...',
  label,
  error,
  success,
  hint,
  required,
  disabled,
  size = 'md',
  variant = 'default',
  searchable = false,
  clearable = false,
  multiple = false,
  className,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Size classes
  const sizeClasses = {
    sm: {
      trigger: 'px-3 py-2 text-sm',
      content: 'p-2',
      item: 'px-2 py-1.5 text-sm',
      label: 'text-sm',
      hint: 'text-xs',
      icon: 'h-4 w-4'
    },
    md: {
      trigger: 'px-4 py-3 text-base',
      content: 'p-3',
      item: 'px-3 py-2 text-base',
      label: 'text-base',
      hint: 'text-sm',
      icon: 'h-5 w-5'
    },
    lg: {
      trigger: 'px-5 py-4 text-lg',
      content: 'p-4',
      item: 'px-4 py-3 text-lg',
      label: 'text-lg',
      hint: 'text-base',
      icon: 'h-6 w-6'
    }
  }

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  // Selected option
  const selectedOption = options.find(option => option.value === selectedValue)

  // Handle selection
  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return
    
    setSelectedValue(option.value)
    onChange?.(option.value, option)
    setIsOpen(false)
    setSearchTerm('')
  }

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedValue('')
    onChange?.('', { value: '', label: '' } as SelectOption)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (searchable && isOpen && e.key === 'ArrowDown') {
      e.preventDefault()
      const firstOption = filteredOptions[0]
      if (firstOption) {
        handleSelect(firstOption)
      }
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update selected value when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className={clsx(
          'block font-medium text-gray-700 mb-2',
          sizeClasses[size].label,
          { 'text-red-600': error, 'text-green-600': success }
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div className="relative" ref={dropdownRef}>
        {/* Trigger */}
        <div
          className={clsx(
            'relative w-full text-left cursor-pointer transition-all duration-200',
            'border rounded-lg font-medium',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            
            // Size classes
            sizeClasses[size].trigger,
            
            // Variant classes
            variant === 'default' && 'border-gray-300 bg-white hover:border-gray-400',
            variant === 'filled' && 'border-0 bg-gray-50 hover:bg-gray-100',
            variant === 'outline' && 'border-2 border-gray-300 bg-transparent hover:border-gray-400',
            
            // State classes
            error && 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500',
            success && 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500',
            
            // Disabled state
            disabled && 'bg-gray-100 cursor-not-allowed opacity-50',
            
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {/* Selected Value */}
          <span className={clsx(
            'block truncate',
            !selectedOption && 'text-gray-500'
          )}>
            {selectedOption?.label || placeholder}
          </span>

          {/* Icons Container */}
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {/* Clear Button */}
            {clearable && selectedOption && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="mr-1 p-0.5 rounded hover:bg-gray-200 transition-colors"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            )}
            
            {/* Dropdown Arrow */}
            <ChevronDown className={clsx(
              'h-4 w-4 text-gray-400 transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )} />
          </span>
        </div>

        {/* Dropdown Content */}
        {isOpen && (
          <div className={clsx(
            'absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg',
            'max-h-60 overflow-auto',
            sizeClasses[size].content
          )}>
            {/* Search Input */}
            {searchable && (
              <div className="sticky top-0 bg-white border-b border-gray-200 pb-2 mb-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div role="listbox">
              {filteredOptions.length === 0 ? (
                <div className={clsx(
                  'text-center text-gray-500',
                  sizeClasses[size].item
                )}>
                  {searchTerm ? 'No results found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={option.value === selectedValue}
                    className={clsx(
                      'relative cursor-pointer select-none rounded transition-colors',
                      'flex items-center justify-between',
                      sizeClasses[size].item,
                      {
                        'bg-blue-50 text-blue-900': option.value === selectedValue,
                        'hover:bg-gray-50 text-gray-900': option.value !== selectedValue,
                        'opacity-50 cursor-not-allowed': option.disabled
                      }
                    )}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      {option.icon && (
                        <span className={sizeClasses[size].icon}>
                          {option.icon}
                        </span>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Check Mark */}
                    {option.value === selectedValue && (
                      <Check className={clsx(
                        'h-4 w-4 text-blue-600',
                        sizeClasses[size].icon
                      )} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error/Success/Hint Messages */}
      {error && (
        <p className={clsx(
          'mt-2 text-sm font-medium text-red-600',
          sizeClasses[size].hint
        )}>
          {error}
        </p>
      )}

      {success && !error && (
        <p className={clsx(
          'mt-2 text-sm font-medium text-green-600',
          sizeClasses[size].hint
        )}>
          {success}
        </p>
      )}

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

Select.displayName = 'Select'

export default Select

// Export types for external use
export type { SelectProps, SelectOption }