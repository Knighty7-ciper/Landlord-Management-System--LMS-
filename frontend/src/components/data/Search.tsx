import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../forms/Input';
import { Select } from '../forms/Select';
import { Modal } from '../layout/Modal';

// Search Result Interface
export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  icon?: React.ReactNode;
  image?: string;
  url?: string;
  score?: number;
  metadata?: Record<string, any>;
}

// Filter Option Interface
export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'number' | 'text';
  options?: Array<{ value: any; label: string; count?: number }>;
  placeholder?: string;
  min?: number;
  max?: number;
}

// Advanced Search Filters
export interface SearchFilters {
  [key: string]: {
    value: any;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'range' | 'in' | 'notIn';
  };
}

// Search Suggestion Interface
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'filter' | 'recent' | 'popular';
  count?: number;
}

// Search Props
export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string, filters?: SearchFilters) => void;
  results?: SearchResult[];
  suggestions?: SearchSuggestion[];
  loading?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showSuggestions?: boolean;
  maxSuggestions?: number;
  debounceMs?: number;
  clearable?: boolean;
  showFilters?: boolean;
  filters?: FilterOption[];
  initialFilters?: SearchFilters;
  onFilterChange?: (filters: SearchFilters) => void;
  showAdvanced?: boolean;
  onResultClick?: (result: SearchResult) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  renderResult?: (result: SearchResult) => React.ReactNode;
  renderSuggestion?: (suggestion: SearchSuggestion) => React.ReactNode;
}

// Main Search Component
export const Search: React.FC<SearchProps> = ({
  value,
  onChange,
  onSearch,
  results = [],
  suggestions = [],
  loading = false,
  placeholder = 'Search...',
  className = '',
  autoFocus = false,
  showSuggestions = true,
  maxSuggestions = 10,
  debounceMs = 300,
  clearable = true,
  showFilters = false,
  filters = [],
  initialFilters = {},
  onFilterChange,
  showAdvanced = false,
  onResultClick,
  onSuggestionClick,
  renderResult,
  renderSuggestion,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      if (onSearch) {
        onSearch(value, filters);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, onSearch, filters, debounceMs]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowAdvancedSearch(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    const totalItems = suggestions.length + results.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : totalItems - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[highlightedIndex]);
          } else {
            handleResultClick(results[highlightedIndex - suggestions.length]);
          }
        } else if (debouncedValue.trim()) {
          handleSearch();
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, highlightedIndex, suggestions, results, debouncedValue]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch(debouncedValue, filters);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [debouncedValue, filters, onSearch]);

  // Handle clear
  const handleClear = useCallback(() => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, [onChange]);

  // Handle result click
  const handleResultClick = useCallback((result: SearchResult) => {
    onResultClick?.(result);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onResultClick]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    onSuggestionClick?.(suggestion);
    onChange(suggestion.text);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, [onSuggestionClick, onChange]);

  // Handle filter change
  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...filters };
    if (value !== undefined && value !== null && value !== '') {
      newFilters[key] = { value, operator: 'equals' };
    } else {
      delete newFilters[key];
    }
    
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  // Render suggestion item
  const renderSuggestionItem = useCallback((suggestion: SearchSuggestion, index: number) => {
    if (renderSuggestion) {
      return renderSuggestion(suggestion);
    }

    const icons = {
      query: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      filter: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      ),
      recent: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      popular: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
    };

    return (
      <div
        key={suggestion.id}
        className={`
          flex items-center px-4 py-3 cursor-pointer transition-colors
          ${index === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}
        `}
        onClick={() => handleSuggestionClick(suggestion)}
      >
        <span className="flex-shrink-0 mr-3 text-gray-400">
          {icons[suggestion.type]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {suggestion.text}
          </div>
          {suggestion.count && (
            <div className="text-xs text-gray-500">
              {suggestion.count.toLocaleString()} results
            </div>
          )}
        </div>
      </div>
    );
  }, [highlightedIndex, handleSuggestionClick, renderSuggestion]);

  // Render result item
  const renderResultItem = useCallback((result: SearchResult, index: number) => {
    if (renderResult) {
      return renderResult(result);
    }

    const actualIndex = suggestions.length + index;

    return (
      <div
        key={result.id}
        className={`
          flex items-center px-4 py-3 cursor-pointer transition-colors border-t border-gray-100
          ${actualIndex === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}
        `}
        onClick={() => handleResultClick(result)}
      >
        {result.icon && (
          <span className="flex-shrink-0 mr-3 text-gray-400">
            {result.icon}
          </span>
        )}
        
        {result.image && (
          <div className="flex-shrink-0 mr-3">
            <img 
              src={result.image} 
              alt="" 
              className="w-10 h-10 rounded object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-900 truncate">
              {result.title}
            </div>
            {result.score && (
              <Badge variant="outline" size="sm">
                {Math.round(result.score * 100)}%
              </Badge>
            )}
          </div>
          
          {result.subtitle && (
            <div className="text-sm text-gray-500 truncate">
              {result.subtitle}
            </div>
          )}
          
          {result.description && (
            <div className="text-xs text-gray-400 mt-1 line-clamp-2">
              {result.description}
            </div>
          )}
          
          {result.category && (
            <div className="flex items-center mt-2">
              <Badge variant="secondary" size="sm">
                {result.category}
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  }, [suggestions.length, highlightedIndex, handleResultClick, renderResult]);

  // Combined suggestions and results for keyboard navigation
  const combinedItems = useMemo(() => {
    return [
      ...suggestions.slice(0, maxSuggestions),
      ...results,
    ];
  }, [suggestions, results, maxSuggestions]);

  const showDropdown = isOpen && (
    showSuggestions && combinedItems.length > 0 ||
    results.length > 0 ||
    loading
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-20"
          autoFocus={autoFocus}
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        {/* Clear and Filter Buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {clearable && value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          )}
          
          {showAdvanced && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Suggestions Section */}
          {showSuggestions && suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                Suggestions
              </div>
              <div className="max-h-32 overflow-y-auto">
                {suggestions.slice(0, maxSuggestions).map((suggestion, index) =>
                  renderSuggestionItem(suggestion, index)
                )}
              </div>
            </div>
          )}

          {/* Results Section */}
          {results.length > 0 && (
            <div ref={resultsRef}>
              {suggestions.length > 0 && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                  Results ({results.length})
                </div>
              )}
              <div className="max-h-64 overflow-y-auto">
                {results.map((result, index) =>
                  renderResultItem(result, index)
                )}
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && !results.length && !suggestions.length && value && (
            <div className="px-4 py-8 text-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="text-sm">No results found</div>
              <div className="text-xs mt-1">Try adjusting your search terms</div>
            </div>
          )}

          {/* Search Button */}
          {value && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSearch}
                className="w-full"
                disabled={loading}
              >
                Search for "{debouncedValue}"
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <AdvancedSearchModal
          isOpen={showAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />
      )}
    </div>
  );
};

// Advanced Search Modal Component
interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onSearch,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters };
    if (value !== undefined && value !== null && value !== '') {
      newFilters[key] = { value, operator: 'equals' };
    } else {
      delete newFilters[key];
    }
    setLocalFilters(newFilters);
  };

  const handleSearch = () => {
    onFilterChange(localFilters);
    onSearch();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Advanced Search" size="lg">
      <div className="space-y-6">
        {/* Date Range Filter Example */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              placeholder="From date"
              value={localFilters.dateFrom?.value || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
            <Input
              type="date"
              placeholder="To date"
              value={localFilters.dateTo?.value || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter Example */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <Select
            value={localFilters.category?.value || ''}
            onChange={(value) => handleFilterChange('category', value)}
            options={[
              { value: '', label: 'All categories' },
              { value: 'properties', label: 'Properties' },
              { value: 'tenants', label: 'Tenants' },
              { value: 'leases', label: 'Leases' },
              { value: 'maintenance', label: 'Maintenance' },
            ]}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Hook for search functionality
export const useSearch = (initialQuery: string = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (
    searchQuery: string, 
    filters?: SearchFilters,
    searchFunction?: (query: string, filters?: SearchFilters) => Promise<{ results: SearchResult[]; suggestions: SearchSuggestion[] }>
  ) => {
    if (!searchQuery.trim() && (!filters || Object.keys(filters).length === 0)) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    try {
      if (searchFunction) {
        const { results: searchResults, suggestions: searchSuggestions } = await searchFunction(searchQuery, filters);
        setResults(searchResults);
        setSuggestions(searchSuggestions);
      } else {
        // Mock implementation - replace with actual search logic
        setResults([]);
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    query,
    setQuery,
    results,
    suggestions,
    loading,
    search,
  };
};

// Default export
export default Search;