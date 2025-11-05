import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Select } from '../forms/Select';

// Pagination Props
export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxPageNumbers?: number;
  disabled?: boolean;
}

// Page Information Interface
export interface PageInfo {
  startIndex: number;
  endIndex: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  startPage: number;
  endPage: number;
}

// Main Pagination Component
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = false,
  pageSizeOptions = [10, 25, 50, 100],
  className = '',
  variant = 'default',
  showFirstLast = true,
  showPrevNext = true,
  maxPageNumbers = 7,
  disabled = false,
}) => {
  const [jumpToPage, setJumpToPage] = useState('');
  const [jumpInputVisible, setJumpInputVisible] = useState(false);

  // Calculate page information
  const pageInfo = useMemo((): PageInfo => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalItems);
    const hasNext = currentPage < totalPages;
    const hasPrev = currentPage > 1;

    // Calculate visible page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

    // Adjust start page if end page is near the end
    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(1, endPage - maxPageNumbers + 1);
    }

    return {
      startIndex,
      endIndex,
      totalPages,
      hasNext,
      hasPrev,
      startPage,
      endPage,
    };
  }, [currentPage, pageSize, totalItems, maxPageNumbers]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (disabled || page < 1 || page > pageInfo.totalPages || page === currentPage) {
      return;
    }
    onPageChange(page);
    setJumpInputVisible(false);
    setJumpToPage('');
  }, [disabled, currentPage, pageInfo.totalPages, onPageChange]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    onPageSizeChange?.(newPageSize);
    // Reset to first page when changing page size
    onPageChange(1);
  }, [onPageSizeChange, onPageChange]);

  // Handle jump to page
  const handleJumpToPage = useCallback(() => {
    const pageNumber = parseInt(jumpToPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= pageInfo.totalPages) {
      handlePageChange(pageNumber);
    }
  }, [jumpToPage, pageInfo.totalPages, handlePageChange]);

  // Handle key press for jump input
  const handleJumpKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    } else if (e.key === 'Escape') {
      setJumpInputVisible(false);
      setJumpToPage('');
    }
  }, [handleJumpToPage]);

  // Reset jump input when page changes
  useEffect(() => {
    setJumpInputVisible(false);
    setJumpToPage('');
  }, [currentPage]);

  // Generate page numbers for display
  const pageNumbers = useMemo(() => {
    const pages = [];
    const { startPage, endPage } = pageInfo;

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }, [pageInfo]);

  // Render page button
  const renderPageButton = (page: number, label?: string) => {
    const isActive = page === currentPage;
    const isDisabled = disabled;
    
    return (
      <Button
        key={page}
        variant={isActive ? 'primary' : 'ghost'}
        size="sm"
        disabled={isDisabled}
        onClick={() => handlePageChange(page)}
        className={`
          min-w-[2.5rem] h-10 px-3 text-sm font-medium
          ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${variant === 'compact' ? 'min-w-[2rem] h-8 px-2' : ''}
        `}
      >
        {label || page}
      </Button>
    );
  };

  // Render navigation arrow
  const renderNavArrow = (direction: 'prev' | 'next' | 'first' | 'last', page: number, label: string) => {
    const isDisabled = disabled || (
      (direction === 'prev' && !pageInfo.hasPrev) ||
      (direction === 'next' && !pageInfo.hasNext) ||
      (direction === 'first' && currentPage === 1) ||
      (direction === 'last' && currentPage === pageInfo.totalPages)
    );

    const icons = {
      prev: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      ),
      next: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      ),
      first: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      ),
      last: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      ),
    };

    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={isDisabled}
        onClick={() => handlePageChange(page)}
        className={`
          min-w-[2.5rem] h-10 px-3
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${variant === 'compact' ? 'min-w-[2rem] h-8 px-2' : ''}
        `}
        aria-label={label}
      >
        {icons[direction]}
      </Button>
    );
  };

  // Render ellipsis
  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className="px-2 text-gray-400 select-none"
    >
      ...
    </span>
  );

  // If no items, don't render pagination
  if (totalItems === 0) {
    return null;
  }

  // If only one page, show compact info
  if (pageInfo.totalPages === 1) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="text-sm text-gray-500">
          {totalItems > 0 ? `Showing 1 to ${totalItems} of ${totalItems} results` : 'No results'}
        </div>
      </div>
    );
  }

  // Base container styles
  const containerStyles = `
    flex flex-col sm:flex-row items-center justify-between gap-4
    ${disabled ? 'opacity-50' : ''}
    ${className}
  `;

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={containerStyles}>
        {/* Compact Controls */}
        <div className="flex items-center gap-2">
          {showFirstLast && renderNavArrow('first', 1, 'First page')}
          {showPrevNext && renderNavArrow('prev', currentPage - 1, 'Previous page')}
          
          <span className="text-sm text-gray-600 px-2">
            {currentPage} / {pageInfo.totalPages}
          </span>
          
          {showPrevNext && renderNavArrow('next', currentPage + 1, 'Next page')}
          {showFirstLast && renderNavArrow('last', pageInfo.totalPages, 'Last page')}
        </div>

        {/* Page Size Selector */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              options={pageSizeOptions.map(size => ({
                value: size,
                label: `${size}`,
              }))}
              className="w-20"
              size="sm"
            />
          </div>
        )}
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={containerStyles}>
        {/* Minimal Info */}
        <div className="text-sm text-gray-500">
          {pageInfo.startIndex}-{pageInfo.endIndex} of {totalItems}
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-1">
          {showPrevNext && renderNavArrow('prev', currentPage - 1, 'Previous page')}
          {showPrevNext && renderNavArrow('next', currentPage + 1, 'Next page')}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={containerStyles}>
      {/* Left Side: Page Size Selector and Info */}
      <div className="flex items-center gap-4">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              options={pageSizeOptions.map(size => ({
                value: size,
                label: `${size}`,
              }))}
              className="w-20"
              size="sm"
            />
            <span className="text-sm text-gray-600">per page</span>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          {pageInfo.startIndex}-{pageInfo.endIndex} of {totalItems}
        </div>
      </div>

      {/* Center: Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        {showFirstLast && pageInfo.startPage > 1 && (
          <>
            {renderPageButton(1)}
            {renderEllipsis('ellipsis-start')}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((page, index, array) => {
          // Add ellipsis between discontinuous page numbers
          if (index > 0 && page - array[index - 1] > 1) {
            return (
              <React.Fragment key={`${page}-fragment`}>
                {renderEllipsis(`ellipsis-${page}`)}
                {renderPageButton(page)}
              </React.Fragment>
            );
          }
          
          return renderPageButton(page);
        })}

        {/* Last Page */}
        {showFirstLast && pageInfo.endPage < pageInfo.totalPages && (
          <>
            {renderEllipsis('ellipsis-end')}
            {renderPageButton(pageInfo.totalPages)}
          </>
        )}
      </div>

      {/* Right Side: Navigation Arrows and Jump Control */}
      <div className="flex items-center gap-2">
        {/* Jump to Page */}
        {jumpInputVisible ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              onKeyPress={handleJumpKeyPress}
              min={1}
              max={pageInfo.totalPages}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleJumpToPage}
              className="px-2"
            >
              Go
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setJumpInputVisible(true)}
            className="text-xs px-2"
            disabled={disabled}
          >
            Jump to page
          </Button>
        )}

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1">
          {showFirstLast && renderNavArrow('first', 1, 'First page')}
          {showPrevNext && renderNavArrow('prev', currentPage - 1, 'Previous page')}
          {showPrevNext && renderNavArrow('next', currentPage + 1, 'Next page')}
          {showFirstLast && renderNavArrow('last', pageInfo.totalPages, 'Last page')}
        </div>
      </div>
    </div>
  );
};

// Hook for managing pagination state
export const usePagination = (initialPage: number = 1, initialPageSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  return {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  };
};

// Default export
export default Pagination;