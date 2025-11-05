import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

// Modal Size Types
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Modal Animation States
export type ModalAnimationState = 'entering' | 'entered' | 'exiting' | 'exited';

// Modal Component Props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  animationDuration?: number;
  preventScroll?: boolean;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}

// Basic Modal Component
export const BasicModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  animationDuration = 300,
  preventScroll = true,
  ariaLabelledby,
  ariaDescribedby,
}) => {
  const [animationState, setAnimationState] = useState<ModalAnimationState>('exited');
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      setAnimationState('entering');
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
        setAnimationState('entered');
      }, 50);

      // Prevent body scroll
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      setAnimationState('exiting');
      setTimeout(() => {
        setAnimationState('exited');
        
        // Restore body scroll
        if (preventScroll) {
          document.body.style.overflow = '';
        }
        
        // Restore focus
        previousActiveElement.current?.focus();
      }, animationDuration);
    }

    // Cleanup on unmount
    return () => {
      if (preventScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, preventScroll, animationDuration]);

  // ESC key handling
  useEffect(() => {
    if (!closeOnEsc) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose, closeOnEsc]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || animationState !== 'entered') return;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, animationState]);

  if (animationState === 'exited') return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  const backdropClasses = `
    fixed inset-0 z-50 flex items-center justify-center p-4
    ${animationState === 'entering' || animationState === 'entered' 
      ? 'bg-black bg-opacity-50' 
      : 'bg-transparent'
    }
    transition-all duration-${animationDuration} ease-in-out
  `;

  const modalClasses = `
    bg-white rounded-lg shadow-xl transform transition-all duration-${animationDuration} ease-out
    ${sizeClasses[size]} ${className}
    ${animationState === 'entering' 
      ? 'opacity-0 scale-95 translate-y-4' 
      : 'opacity-100 scale-100 translate-y-0'
    }
    ${animationState === 'exiting' 
      ? 'opacity-0 scale-95 translate-y-4' 
      : ''
    }
    focus:outline-none
  `;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className={backdropClasses}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={modalClasses}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledby || (title ? 'modal-title' : undefined)}
        aria-describedby={ariaDescribedby}
        style={{
          animationDuration: `${animationDuration}ms`
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h3 
                id={ariaLabelledby || 'modal-title'}
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Confirmation Modal Props
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  size?: ModalSize;
  isLoading?: boolean;
  className?: string;
}

// Confirmation Modal Component
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  size = 'md',
  isLoading = false,
  className = '',
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const variantStyles = {
    danger: {
      confirmButton: 'danger' as const,
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      iconBg: 'bg-red-100'
    },
    warning: {
      confirmButton: 'primary' as const,
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      iconBg: 'bg-yellow-100'
    },
    info: {
      confirmButton: 'primary' as const,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-blue-100'
    }
  };

  const style = variantStyles[variant];

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
      closeOnBackdrop={!isLoading}
      closeOnEsc={!isLoading}
      preventScroll={false}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 p-2 rounded-full ${style.iconBg}`}>
          {style.icon}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-4">
            {message}
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={style.confirmButton}
              onClick={handleConfirm}
              isLoading={isLoading}
              loadingText={confirmText}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </BasicModal>
  );
};

// Form Modal Props
export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void> | void;
  title?: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  size?: ModalSize;
  isLoading?: boolean;
  className?: string;
  preventCloseOnSubmit?: boolean;
}

// Form Modal Component
export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  size = 'md',
  isLoading = false,
  className = '',
  preventCloseOnSubmit = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!formRef.current) return;

    try {
      // Get form data
      const formData = new FormData(formRef.current);
      const data = Object.fromEntries(formData);

      // Call submit handler
      await onSubmit(data);

      // Close modal if not prevented
      if (!preventCloseOnSubmit) {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetError = () => setError(null);

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
      closeOnBackdrop={!isLoading}
      closeOnEsc={!isLoading}
      preventScroll={false}
    >
      <form ref={formRef} onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4">
            <Alert
              type="error"
              onDismiss={resetError}
              dismissible={!isLoading}
            >
              {error}
            </Alert>
          </div>
        )}
        
        <div className="mb-6">
          {children}
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText={submitText}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </BasicModal>
  );
};

// Alert Modal Props
export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: ReactNode;
  buttonText?: string;
  size?: ModalSize;
  className?: string;
}

// Alert Modal Component
export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  buttonText = 'OK',
  size = 'md',
  className = '',
}) => {
  const alertTypes = {
    success: {
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      iconBg: 'bg-green-100',
      titleColor: 'text-green-900'
    },
    error: {
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      iconBg: 'bg-red-100',
      titleColor: 'text-red-900'
    },
    warning: {
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      iconBg: 'bg-yellow-100',
      titleColor: 'text-yellow-900'
    },
    info: {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-blue-100',
      titleColor: 'text-blue-900'
    }
  };

  const alertStyle = alertTypes[type];

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
      preventScroll={false}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 p-2 rounded-full ${alertStyle.iconBg}`}>
          {alertStyle.icon}
        </div>
        <div className="flex-1">
          <div className={`text-sm ${alertStyle.titleColor} mb-4`}>
            {message}
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={onClose}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </BasicModal>
  );
};

// Modal Context for global state management
interface ModalContextType {
  showConfirmation: (options: Omit<ConfirmationModalProps, 'isOpen' | 'onClose'>) => void;
  showAlert: (options: Omit<AlertModalProps, 'isOpen' | 'onClose'>) => void;
  showForm: (options: Omit<FormModalProps, 'isOpen' | 'onClose'>) => void;
}

const ModalContext = React.createContext<ModalContextType | null>(null);

// Modal Provider Hook
export const useModal = (): ModalContextType => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Modal Provider Component
interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalProps | null>(null);
  const [alertModal, setAlertModal] = useState<AlertModalProps | null>(null);
  const [formModal, setFormModal] = useState<FormModalProps | null>(null);

  const showConfirmation = (options: Omit<ConfirmationModalProps, 'isOpen' | 'onClose'>) => {
    setConfirmationModal({
      ...options,
      isOpen: true,
      onClose: () => setConfirmationModal(null),
    });
  };

  const showAlert = (options: Omit<AlertModalProps, 'isOpen' | 'onClose'>) => {
    setAlertModal({
      ...options,
      isOpen: true,
      onClose: () => setAlertModal(null),
    });
  };

  const showForm = (options: Omit<FormModalProps, 'isOpen' | 'onClose'>) => {
    setFormModal({
      ...options,
      isOpen: true,
      onClose: () => setFormModal(null),
    });
  };

  const contextValue: ModalContextType = {
    showConfirmation,
    showAlert,
    showForm,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      
      {/* Confirmation Modal */}
      {confirmationModal && <ConfirmationModal {...confirmationModal} />}
      
      {/* Alert Modal */}
      {alertModal && <AlertModal {...alertModal} />}
      
      {/* Form Modal */}
      {formModal && <FormModal {...formModal} />}
    </ModalContext.Provider>
  );
};

// Default export
export default BasicModal;