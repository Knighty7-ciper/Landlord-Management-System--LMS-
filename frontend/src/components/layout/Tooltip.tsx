import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Tooltip Position Types
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// Tooltip Variant Types
export type TooltipVariant = 'default' | 'dark' | 'light' | 'info' | 'warning' | 'error' | 'success';

// Tooltip Size Types
export type TooltipSize = 'sm' | 'md' | 'lg';

// Tooltip Arrow Direction Types
export type ArrowDirection = 'top' | 'bottom' | 'left' | 'right';

// Tooltip Props
export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  size?: TooltipSize;
  disabled?: boolean;
  delay?: number;
  arrow?: boolean;
  className?: string;
  maxWidth?: string;
  portal?: boolean;
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  showOnInit?: boolean;
}

// Base Tooltip Component
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  variant = 'default',
  size = 'md',
  disabled = false,
  delay = 300,
  arrow = true,
  className = '',
  maxWidth = 'max-w-xs',
  portal = false,
  trigger = 'hover',
  showOnInit = false,
}) => {
  const [isVisible, setIsVisible] = useState(showOnInit);
  const [isReady, setIsReady] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [arrowDirection, setArrowDirection] = useState<ArrowDirection>('top');
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate tooltip position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    const triggerCenterX = triggerRect.left + triggerRect.width / 2 + scrollLeft;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2 + scrollTop;

    let newPosition = { top: 0, left: 0 };
    let newArrowDirection: ArrowDirection = 'top';

    switch (position) {
      case 'top':
        newPosition = {
          top: triggerRect.top + scrollTop - tooltipRect.height - 8,
          left: triggerCenterX - tooltipRect.width / 2,
        };
        newArrowDirection = 'bottom';
        break;

      case 'bottom':
        newPosition = {
          top: triggerRect.bottom + scrollTop + 8,
          left: triggerCenterX - tooltipRect.width / 2,
        };
        newArrowDirection = 'top';
        break;

      case 'left':
        newPosition = {
          top: triggerCenterY - tooltipRect.height / 2,
          left: triggerRect.left + scrollLeft - tooltipRect.width - 8,
        };
        newArrowDirection = 'right';
        break;

      case 'right':
        newPosition = {
          top: triggerCenterY - tooltipRect.height / 2,
          left: triggerRect.right + scrollLeft + 8,
        };
        newArrowDirection = 'left';
        break;

      case 'top-left':
        newPosition = {
          top: triggerRect.top + scrollTop - tooltipRect.height - 8,
          left: triggerRect.left + scrollLeft,
        };
        newArrowDirection = 'bottom';
        break;

      case 'top-right':
        newPosition = {
          top: triggerRect.top + scrollTop - tooltipRect.height - 8,
          left: triggerRect.right + scrollLeft - tooltipRect.width,
        };
        newArrowDirection = 'bottom';
        break;

      case 'bottom-left':
        newPosition = {
          top: triggerRect.bottom + scrollTop + 8,
          left: triggerRect.left + scrollLeft,
        };
        newArrowDirection = 'top';
        break;

      case 'bottom-right':
        newPosition = {
          top: triggerRect.bottom + scrollTop + 8,
          left: triggerRect.right + scrollLeft - tooltipRect.width,
        };
        newArrowDirection = 'top';
        break;
    }

    // Ensure tooltip stays within viewport
    const margin = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (newPosition.left < margin) {
      newPosition.left = margin;
    } else if (newPosition.left + tooltipRect.width > viewportWidth - margin) {
      newPosition.left = viewportWidth - tooltipRect.width - margin;
    }

    if (newPosition.top < margin) {
      newPosition.top = triggerRect.bottom + scrollTop + 8;
      newArrowDirection = 'top';
    } else if (newPosition.top + tooltipRect.height > viewportHeight - margin) {
      newPosition.top = triggerRect.top + scrollTop - tooltipRect.height - 8;
      newArrowDirection = 'bottom';
    }

    setTooltipPosition(newPosition);
    setArrowDirection(newArrowDirection);
  };

  // Show tooltip
  const showTooltip = () => {
    if (disabled) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => {
        setIsReady(true);
        calculatePosition();
      }, 50);
    }, delay);
  };

  // Hide tooltip
  const hideTooltip = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsReady(false);
    }, 150);
  };

  // Handle mouse events
  const handleMouseEnter = () => {
    if (trigger === 'hover' || trigger === 'manual') {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover' || trigger === 'manual') {
      hideTooltip();
    }
  };

  // Handle click events
  const handleClick = () => {
    if (trigger === 'click' || trigger === 'manual') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  // Handle focus events
  const handleFocus = () => {
    if (trigger === 'focus' || trigger === 'manual') {
      showTooltip();
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus' || trigger === 'manual') {
      hideTooltip();
    }
  };

  // Update position on window resize
  useEffect(() => {
    if (isVisible && isReady) {
      const handleResize = () => {
        calculatePosition();
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isVisible, isReady]);

  // Manual control
  useEffect(() => {
    if (trigger === 'manual') {
      if (showOnInit) {
        showTooltip();
      } else {
        hideTooltip();
      }
    }
  }, [trigger, showOnInit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
    };
  }, []);

  if (disabled) {
    return <>{children}</>;
  }

  // Variant classes
  const variantClasses = {
    default: 'bg-gray-900 text-white',
    dark: 'bg-gray-800 text-white',
    light: 'bg-white text-gray-900 border border-gray-200',
    info: 'bg-blue-600 text-white',
    warning: 'bg-yellow-600 text-white',
    error: 'bg-red-600 text-white',
    success: 'bg-green-600 text-white',
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-2 px-3',
    lg: 'text-base py-3 px-4',
  };

  // Arrow classes
  const getArrowClasses = () => {
    if (!arrow) return '';
    
    const baseClasses = 'absolute w-2 h-2 transform rotate-45';
    const variantColor = variantClasses[variant].split(' ')[0];

    switch (arrowDirection) {
      case 'top':
        return `${baseClasses} -top-1 left-1/2 transform -translate-x-1/2 ${variantColor === 'bg-white' || variantColor === 'bg-gray-100' ? 'bg-white border-l border-t border-gray-200' : variantColor}`;
      case 'bottom':
        return `${baseClasses} -bottom-1 left-1/2 transform -translate-x-1/2 ${variantColor === 'bg-white' || variantColor === 'bg-gray-100' ? 'bg-white border-r border-b border-gray-200' : variantColor}`;
      case 'left':
        return `${baseClasses} -left-1 top-1/2 transform -translate-y-1/2 ${variantColor === 'bg-white' || variantColor === 'bg-gray-100' ? 'bg-white border-t border-l border-gray-200' : variantColor}`;
      case 'right':
        return `${baseClasses} -right-1 top-1/2 transform -translate-y-1/2 ${variantColor === 'bg-white' || variantColor === 'bg-gray-100' ? 'bg-white border-b border-r border-gray-200' : variantColor}`;
      default:
        return '';
    }
  };

  const tooltipClasses = `
    ${variantClasses[variant]} ${sizeClasses[size]} ${maxWidth}
    rounded-lg shadow-lg z-50 pointer-events-none
    transition-all duration-200 ease-out
    ${isVisible && isReady 
      ? 'opacity-100 transform translate-y-0 scale-100' 
      : 'opacity-0 transform translate-y-2 scale-95'
    }
    ${className}
  `;

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className={tooltipClasses}
      style={{
        position: 'fixed',
        top: tooltipPosition.top,
        left: tooltipPosition.left,
      }}
      role="tooltip"
      aria-hidden={!isVisible}
    >
      {content}
      {arrow && <div className={getArrowClasses()} />}
    </div>
  );

  const triggerElement = (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="inline-block"
    >
      {children}
    </div>
  );

  if (portal) {
    return (
      <>
        {triggerElement}
        {isVisible && createPortal(tooltipContent, document.body)}
      </>
    );
  }

  return (
    <>
      {triggerElement}
      {tooltipContent}
    </>
  );
};

// Rich Tooltip Props
export interface RichTooltipProps {
  children: ReactNode;
  title?: ReactNode;
  content: ReactNode;
  image?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  size?: TooltipSize;
  className?: string;
}

// Rich Tooltip Component
export const RichTooltip: React.FC<RichTooltipProps> = ({
  children,
  title,
  content,
  image,
  actions,
  position = 'top',
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const renderContent = () => (
    <div className="space-y-3">
      {image && (
        <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden">
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      
      {title && (
        <div className="font-semibold">
          {title}
        </div>
      )}
      
      <div className="text-sm opacity-90">
        {content}
      </div>
      
      {actions && actions.length > 0 && (
        <div className="flex space-x-2 pt-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                px-3 py-1 text-xs rounded-md transition-colors
                ${action.variant === 'primary' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                }
              `}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip
      content={renderContent()}
      position={position}
      variant={variant}
      size={size}
      maxWidth="max-w-sm"
      portal={true}
      className={className}
    >
      {children}
    </Tooltip>
  );
};

// Interactive Tooltip Props
export interface InteractiveTooltipProps {
  children: ReactNode;
  content: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  size?: TooltipSize;
  className?: string;
}

// Interactive Tooltip Component
export const InteractiveTooltip: React.FC<InteractiveTooltipProps> = ({
  children,
  content,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  position = 'top',
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const renderContent = () => (
    <div className="space-y-3">
      <div className="text-sm">
        {content}
      </div>
      
      {(onConfirm || onCancel) && (
        <div className="flex space-x-2 pt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-3 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {confirmText}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip
      content={renderContent()}
      position={position}
      variant={variant}
      size={size}
      maxWidth="max-w-xs"
      portal={true}
      trigger="click"
      className={className}
    >
      {children}
    </Tooltip>
  );
};

// Help Tooltip Props
export interface HelpTooltipProps {
  content: ReactNode;
  title?: string;
  size?: TooltipSize;
  position?: TooltipPosition;
  className?: string;
}

// Help Tooltip Component (question mark icon with tooltip)
export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  size = 'sm',
  position = 'top',
  className = '',
}) => {
  return (
    <Tooltip
      content={
        <div className="space-y-2">
          {title && (
            <div className="font-semibold text-sm">
              {title}
            </div>
          )}
          <div className="text-sm opacity-90">
            {content}
          </div>
        </div>
      }
      position={position}
      variant="info"
      size={size}
      portal={true}
      className={className}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 text-blue-600 hover:text-blue-800 rounded-full border border-blue-600 hover:border-blue-800 transition-colors"
        aria-label="Help"
      >
        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
    </Tooltip>
  );
};

// Validation Tooltip Props
export interface ValidationTooltipProps {
  isVisible: boolean;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  position?: TooltipPosition;
  className?: string;
}

// Validation Tooltip Component (for form field validation)
export const ValidationTooltip: React.FC<ValidationTooltipProps> = ({
  isVisible,
  message,
  type = 'error',
  position = 'top',
  className = '',
}) => {
  const variantMap = {
    error: 'error',
    warning: 'warning',
    success: 'success',
    info: 'info',
  };

  return (
    <Tooltip
      isOpen={isVisible}
      onToggle={() => {}}
      content={message}
      position={position}
      variant={variantMap[type]}
      size="sm"
      portal={true}
      trigger="manual"
      className={className}
      showOnInit={isVisible}
    >
      <div className="sr-only" role="alert" aria-live="polite">
        {message}
      </div>
    </Tooltip>
  );
};

// Tooltip Group Component for managing multiple tooltips
interface TooltipGroupProps {
  children: ReactNode;
  className?: string;
}

export const TooltipGroup: React.FC<TooltipGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`tooltip-group ${className}`}>
      {children}
    </div>
  );
};

// Default export
export default Tooltip;