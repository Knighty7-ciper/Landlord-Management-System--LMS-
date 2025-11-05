import React, { useState, useRef, useEffect, ReactNode, KeyboardEvent } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

// Dropdown Position Types
export type DropdownPosition = 'top' | 'bottom' | 'left' | 'right';

// Dropdown Variant Types
export type DropdownVariant = 'user' | 'settings' | 'action' | 'custom';

// Dropdown Size Types
export type DropdownSize = 'sm' | 'md' | 'lg';

// Dropdown Item Interface
export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
  shortcut?: string;
}

// Dropdown Props
export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  position?: DropdownPosition;
  variant?: DropdownVariant;
  size?: DropdownSize;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  disabled?: boolean;
  className?: string;
  maxHeight?: string;
  showArrows?: boolean;
}

// Base Dropdown Component
export const BaseDropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  position = 'bottom',
  variant = 'custom',
  size = 'md',
  isOpen: controlledIsOpen,
  onToggle,
  disabled = false,
  className = '',
  maxHeight = 'max-h-64',
  showArrows = true,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isOpen = controlledIsOpen ?? internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (onToggle) {
      onToggle(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) return;

    const focusableElements = dropdownRef.current?.querySelectorAll(
      '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]'
    );
    
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        (document.activeElement === lastElement ? firstElement : focusableElements[Array.from(focusableElements).indexOf(document.activeElement as Element) + 1])?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        (document.activeElement === firstElement ? lastElement : focusableElements[Array.from(focusableElements).indexOf(document.activeElement as Element) - 1])?.focus();
        break;
      case 'Escape':
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  // Position classes
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  // Variant classes
  const variantClasses = {
    user: 'bg-white shadow-xl rounded-xl border border-gray-200',
    settings: 'bg-white shadow-xl rounded-lg border border-gray-200',
    action: 'bg-white shadow-lg rounded-md border border-gray-100',
    custom: 'bg-white shadow-lg rounded-lg border border-gray-200'
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Trigger click handler
  const handleTriggerClick = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // Handle menu item clicks
  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        disabled={disabled}
        className={`
          flex items-center gap-2 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          rounded-md
        `}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open dropdown menu"
      >
        {trigger}
        {showArrows && (
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute z-50 ${positionClasses[position]} min-w-56
            ${variantClasses[variant]} ${sizeClasses[size]}
            focus:outline-none
          `}
          role="menu"
          onKeyDown={handleKeyDown}
        >
          <div className={maxHeight}>
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                {item.divider && index > 0 && (
                  <div className="border-t border-gray-100 my-1" />
                )}
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`
                    w-full flex items-center px-4 py-3 text-left transition-colors
                    ${item.disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-50 hover:text-blue-600'
                    }
                    ${sizeClasses[size]}
                    focus:outline-none focus:bg-gray-50 focus:text-blue-600
                    ${index === 0 ? 'rounded-t-xl' : ''}
                    ${index === items.length - 1 ? 'rounded-b-xl' : ''}
                  `}
                  role="menuitem"
                  tabIndex={item.disabled ? -1 : 0}
                >
                  {item.icon && (
                    <span className="flex-shrink-0 mr-3">
                      {item.icon}
                    </span>
                  )}
                  
                  <span className="flex-1">
                    {item.label}
                  </span>
                  
                  {item.badge && (
                    <Badge variant="primary" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                  
                  {item.shortcut && (
                    <span className="ml-3 text-xs text-gray-400">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// User Dropdown Props
export interface UserDropdownProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    status?: 'online' | 'away' | 'busy' | 'offline';
  };
  onLogout: () => void;
  onProfile: () => void;
  onSettings?: () => void;
  className?: string;
}

// User Dropdown Component
export const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  onLogout,
  onProfile,
  onSettings,
  className = '',
}) => {
  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-500'
  };

  const items: DropdownItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: onProfile,
    },
    ...(onSettings ? [{
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: onSettings,
    }] : []),
    {
      id: 'divider',
      label: '',
      onClick: () => {},
      divider: true,
      disabled: true,
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: onLogout,
      shortcut: '⌘Q',
    }
  ];

  const trigger = (
    <div className="flex items-center space-x-3 p-2">
      <div className="relative">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="text-blue-600 font-medium text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {user.status && (
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusColors[user.status]} border-2 border-white rounded-full`} />
        )}
      </div>
      <div className="hidden md:block text-left">
        <div className="text-sm font-medium text-gray-900">{user.name}</div>
        <div className="text-xs text-gray-500">{user.email}</div>
      </div>
    </div>
  );

  return (
    <BaseDropdown
      trigger={trigger}
      items={items}
      variant="user"
      size="md"
      className={className}
    />
  );
};

// Settings Dropdown Props
export interface SettingsDropdownProps {
  onSettingClick: (settingId: string) => void;
  settings: Array<{
    id: string;
    label: string;
    description?: string;
    icon: ReactNode;
    badge?: string | number;
    isNew?: boolean;
  }>;
  className?: string;
}

// Settings Dropdown Component
export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  onSettingClick,
  settings,
  className = '',
}) => {
  const items: DropdownItem[] = settings.map(setting => ({
    id: setting.id,
    label: (
      <div>
        <div className="flex items-center justify-between">
          <span>{setting.label}</span>
          {setting.isNew && (
            <Badge variant="success" size="sm" className="ml-2">
              New
            </Badge>
          )}
        </div>
        {setting.description && (
          <div className="text-xs text-gray-500 mt-1">
            {setting.description}
          </div>
        )}
      </div>
    ),
    icon: setting.icon,
    badge: setting.badge,
    onClick: () => onSettingClick(setting.id),
  }));

  const trigger = (
    <button
      type="button"
      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      aria-label="Settings"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );

  return (
    <BaseDropdown
      trigger={trigger}
      items={items}
      variant="settings"
      size="md"
      className={className}
    />
  );
};

// Action Dropdown Props
export interface ActionDropdownProps {
  actions: DropdownItem[];
  variant?: 'button' | 'icon' | 'ellipsis';
  buttonText?: string;
  size?: DropdownSize;
  className?: string;
}

// Action Dropdown Component
export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  actions,
  variant = 'icon',
  buttonText = 'Actions',
  size = 'md',
  className = '',
}) => {
  const renderTrigger = () => {
    switch (variant) {
      case 'button':
        return (
          <Button variant="outline" size={size === 'sm' ? 'sm' : 'md'}>
            {buttonText}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        );
      
      case 'ellipsis':
        return (
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            aria-label="More actions"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        );
      
      default: // icon
        return (
          <button
            type="button"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Actions"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        );
    }
  };

  return (
    <BaseDropdown
      trigger={renderTrigger()}
      items={actions}
      variant="action"
      size={size}
      className={className}
    />
  );
};

// Search Dropdown Props
export interface SearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: any) => void;
  placeholder?: string;
  searchResults: Array<{
    id: string;
    label: string;
    subtitle?: string;
    icon?: ReactNode;
    category?: string;
  }>;
  className?: string;
  isLoading?: boolean;
}

// Search Dropdown Component
export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Search...',
  searchResults,
  className = '',
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
          onSelect(searchResults[highlightedIndex]);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleItemSelect = (item: any) => {
    onSelect(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
          "
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {isOpen && searchResults.length > 0 && (
        <div className="
          absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
          max-h-64 overflow-y-auto
        ">
          {searchResults.map((result, index) => (
            <button
              key={result.id}
              onClick={() => handleItemSelect(result)}
              className={`
                w-full flex items-center px-4 py-3 text-left transition-colors
                ${index === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === searchResults.length - 1 ? 'rounded-b-lg' : ''}
              `}
            >
              {result.icon && (
                <span className="flex-shrink-0 mr-3">
                  {result.icon}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {result.label}
                </div>
                {result.subtitle && (
                  <div className="text-xs text-gray-500 truncate">
                    {result.subtitle}
                  </div>
                )}
              </div>
              {result.category && (
                <Badge variant="outline" size="sm" className="ml-2">
                  {result.category}
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Default export
export default BaseDropdown;