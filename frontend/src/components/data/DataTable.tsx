import React, { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../forms/Select';
import { Pagination } from './Pagination';

// Column Definition Types
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'image' | 'badge' | 'custom';

export interface Column<T = any> {
  key: string;
  title: string;
  type?: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  render?: (value: any, row: T, index: number) => ReactNode;
  format?: (value: any) => string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
}

// Sort Configuration
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Filter Configuration
export interface FilterConfig {
  [key: string]: {
    value: any;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual';
  };
}

// Row Selection Configuration
export interface SelectionConfig {
  selected: string[];
  onSelect: (selected: string[]) => void;
  onSelectAll: (selected: string[]) => void;
}

// Action Button Configuration
export interface RowAction<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (row: T, index: number) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: (row: T) => boolean;
  show?: (row: T) => boolean;
}

// DataTable Props
export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowKey?: keyof T | ((row: T) => string);
  height?: string | number;
  maxHeight?: string | number;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  stripeRows?: boolean;
  highlightRows?: boolean;
  compact?: boolean;
  
  // Pagination
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    showPageSizeSelector?: boolean;
    pageSizeOptions?: number[];
  };
  
  // Sorting
  sortConfig?: SortConfig;
  onSort?: (config: SortConfig) => void;
  
  // Filtering
  filters?: FilterConfig;
  onFilterChange?: (filters: FilterConfig) => void;
  showFilters?: boolean;
  
  // Selection
  selection?: SelectionConfig;
  
  // Row Actions
  rowActions?: RowAction<T>[];
  
  // Custom Row Rendering
  renderRow?: (row: T, index: number, columns: Column<T>[]) => ReactNode;
  
  // Event Handlers
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  
  // Style Customization
  theme?: 'light' | 'dark' | 'auto';
}

// Main DataTable Component
export const DataTable: React.FC<DataTableProps<T = any>> = ({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  rowKey = 'id' as keyof T,
  height,
  maxHeight,
  stickyHeader = false,
  stickyFooter = false,
  stripeRows = false,
  highlightRows = false,
  compact = false,
  
  // Pagination
  pagination,
  
  // Sorting
  sortConfig,
  onSort,
  
  // Filtering
  filters,
  onFilterChange,
  showFilters = false,
  
  // Selection
  selection,
  
  // Row Actions
  rowActions,
  
  // Custom Rendering
  renderRow,
  
  // Event Handlers
  onRowClick,
  onRowDoubleClick,
  
  // Style
  theme = 'auto',
}) => {
  const [localSortConfig, setLocalSortConfig] = useState<SortConfig | null>(sortConfig || null);
  const [localFilters, setLocalFilters] = useState<FilterConfig>(filters || {});
  const [selectedRows, setSelectedRows] = useState<string[]>(selection?.selected || []);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Update local state when props change
  useEffect(() => {
    if (sortConfig) {
      setLocalSortConfig(sortConfig);
    }
  }, [sortConfig]);

  useEffect(() => {
    if (filters) {
      setLocalFilters(filters);
    }
  }, [filters]);

  // Calculate row key
  const getRowKey = useCallback((row: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return String(row[rowKey]);
  }, [rowKey]);

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    if (!onSort && !columns.find(col => col.key === columnKey)?.sortable) return;

    const newDirection = localSortConfig?.key === columnKey && localSortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newConfig = { key: columnKey, direction: newDirection };
    
    setLocalSortConfig(newConfig);
    onSort?.(newConfig);
  }, [localSortConfig, onSort, columns]);

  // Handle filtering
  const handleFilterChange = useCallback((columnKey: string, value: any, operator: any) => {
    const newFilters = { ...localFilters };
    if (value !== undefined && value !== null && value !== '') {
      newFilters[columnKey] = { value, operator };
    } else {
      delete newFilters[columnKey];
    }
    
    setLocalFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [localFilters, onFilterChange]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!Object.keys(localFilters).length) return data;

    return data.filter(row => {
      return Object.entries(localFilters).every(([key, filter]) => {
        const value = (row as any)[key];
        const { value: filterValue, operator } = filter;

        switch (operator) {
          case 'equals':
            return value === filterValue;
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filterValue);
          case 'lessThan':
            return Number(value) < Number(filterValue);
          case 'greaterThanOrEqual':
            return Number(value) >= Number(filterValue);
          case 'lessThanOrEqual':
            return Number(value) <= Number(filterValue);
          default:
            return true;
        }
      });
    });
  }, [data, localFilters]);

  // Apply sorting to filtered data
  const sortedData = useMemo(() => {
    if (!localSortConfig || !filteredData.length) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[localSortConfig.key];
      const bValue = (b as any)[localSortConfig.key];

      if (aValue === null || aValue === undefined) return localSortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return localSortConfig.direction === 'asc' ? 1 : -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return localSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return localSortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return localSortConfig.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });
  }, [filteredData, localSortConfig]);

  // Handle row selection
  const handleRowSelect = useCallback((rowKey: string, checked: boolean) => {
    const newSelected = checked 
      ? [...selectedRows, rowKey]
      : selectedRows.filter(key => key !== rowKey);
    
    setSelectedRows(newSelected);
    selection?.onSelect(newSelected);
  }, [selectedRows, selection]);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelected = checked 
      ? sortedData.map((row, index) => getRowKey(row, index))
      : [];
    
    setSelectedRows(newSelected);
    selection?.onSelectAll(newSelected);
  }, [sortedData, getRowKey, selection]);

  // Handle row expansion
  const handleRowExpand = useCallback((rowKey: string) => {
    setExpandedRows(prev => 
      prev.includes(rowKey) 
        ? prev.filter(key => key !== rowKey)
        : [...prev, rowKey]
    );
  }, []);

  // Check if all rows are selected
  const isAllSelected = useMemo(() => {
    return sortedData.length > 0 && sortedData.every((row, index) => 
      selectedRows.includes(getRowKey(row, index))
    );
  }, [sortedData, selectedRows, getRowKey]);

  // Check if some rows are selected
  const isSomeSelected = useMemo(() => {
    return selectedRows.length > 0 && !isAllSelected;
  }, [selectedRows, isAllSelected]);

  // Render cell content
  const renderCell = useCallback((value: any, row: T, column: Column<T>, index: number) => {
    if (column.render) {
      return column.render(value, row, index);
    }

    if (column.format && value !== null && value !== undefined) {
      return column.format(value);
    }

    switch (column.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-center">
            {value ? (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        );
      
      case 'badge':
        return <Badge variant="primary" size="sm">{value}</Badge>;
      
      case 'image':
        return value ? (
          <img 
            src={value} 
            alt="" 
            className="w-8 h-8 rounded object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null;
      
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '';
      
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      
      default:
        return value;
    }
  }, []);

  // Render sort icon
  const renderSortIcon = (column: Column) => {
    if (!column.sortable || !localSortConfig || localSortConfig.key !== column.key) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={localSortConfig.direction === 'asc' ? "M7 16V4m0 0L3 8m4-4l4 4M17 20v-12m0 0l4-4m-4 4l-4-4" : "M7 20V8m0 0l-4 4m4-4l4 4M17 4v12m0 0l-4-4m4 4l4-4"} 
        />
      </svg>
    );
  };

  // Render filter input
  const renderFilterInput = (column: Column) => {
    if (!column.filterable) return null;

    const filter = localFilters[column.key];
    
    return (
      <div className="p-2">
        <input
          type="text"
          value={filter?.value || ''}
          onChange={(e) => handleFilterChange(column.key, e.target.value, 'contains')}
          placeholder={`Filter ${column.title.toLowerCase()}`}
          className="
            w-full px-3 py-1 text-sm border border-gray-300 rounded
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          "
        />
      </div>
    );
  };

  // Base table styles
  const tableStyles = {
    height: height || (maxHeight ? undefined : 'auto'),
    maxHeight,
    overflow: maxHeight ? 'auto' : undefined,
  };

  const rowHeight = compact ? 'h-8' : 'h-12';
  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';
  const fontSize = compact ? 'text-sm' : 'text-base';

  return (
    <div className={`data-table ${className}`}>
      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
            {columns.map(column => (
              <div key={column.key}>
                {renderFilterInput(column)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div 
        className="relative bg-white border border-gray-200 rounded-lg overflow-hidden"
        style={tableStyles}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        <table className={`min-w-full ${fontSize}`}>
          {/* Header */}
          <thead className={stickyHeader ? 'sticky top-0 bg-white' : 'bg-gray-50'}>
            <tr className="border-b border-gray-200">
              {/* Selection Column */}
              {selection && (
                <th className={`${cellPadding} w-12`}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={checkbox => {
                      if (checkbox) checkbox.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {/* Expansion Column */}
              {renderRow && (
                <th className={`${cellPadding} w-12`}>
                  <span className="sr-only">Expand</span>
                </th>
              )}
              
              {/* Data Columns */}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`
                    ${cellPadding} text-left font-semibold text-gray-900
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                    ${column.headerClassName || ''}
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.align === 'right' ? 'text-right' : ''}
                  `}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && renderSortIcon(column)}
                  </div>
                </th>
              ))}
              
              {/* Actions Column */}
              {rowActions && rowActions.length > 0 && (
                <th className={`${cellPadding} w-32 text-right font-semibold text-gray-900`}>
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={
                    1 + // selection column
                    (renderRow ? 1 : 0) + // expansion column
                    columns.length + // data columns
                    (rowActions?.length ? 1 : 0) // actions column
                  }
                  className={`${cellPadding} text-center text-gray-500`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => {
                const rowKeyValue = getRowKey(row, index);
                const isSelected = selectedRows.includes(rowKeyValue);
                const isExpanded = expandedRows.includes(rowKeyValue);
                
                return (
                  <React.Fragment key={rowKeyValue}>
                    {/* Main Row */}
                    <tr
                      className={`
                        ${rowHeight} transition-colors
                        ${stripeRows && index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                        ${highlightRows && isSelected ? 'bg-blue-50' : ''}
                        ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                      `}
                      onClick={() => onRowClick?.(row, index)}
                      onDoubleClick={() => onRowDoubleClick?.(row, index)}
                    >
                      {/* Selection Column */}
                      {selection && (
                        <td className={cellPadding}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleRowSelect(rowKeyValue, e.target.checked);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      
                      {/* Expansion Column */}
                      {renderRow && (
                        <td className={cellPadding}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowExpand(rowKeyValue);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg 
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                      )}
                      
                      {/* Data Columns */}
                      {columns.map(column => {
                        const value = (row as any)[column.key];
                        return (
                          <td
                            key={column.key}
                            className={`
                              ${cellPadding} text-gray-900
                              ${column.align === 'center' ? 'text-center' : ''}
                              ${column.align === 'right' ? 'text-right' : ''}
                              ${column.className || ''}
                            `}
                          >
                            {renderCell(value, row, column, index)}
                          </td>
                        );
                      })}
                      
                      {/* Actions Column */}
                      {rowActions && rowActions.length > 0 && (
                        <td className={`${cellPadding} text-right`}>
                          <div className="flex items-center justify-end space-x-1">
                            {rowActions
                              .filter(action => action.show?.(row) !== false)
                              .map(action => (
                                <button
                                  key={action.key}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(row, index);
                                  }}
                                  disabled={action.disabled?.(row)}
                                  className={`
                                    p-1 rounded transition-colors
                                    ${action.disabled?.(row) 
                                      ? 'opacity-50 cursor-not-allowed' 
                                      : 'hover:bg-gray-100'
                                    }
                                  `}
                                  title={action.label}
                                >
                                  {action.icon || action.label}
                                </button>
                              ))
                            }
                          </div>
                        </td>
                      )}
                    </tr>
                    
                    {/* Expanded Row */}
                    {renderRow && isExpanded && (
                      <tr>
                        <td 
                          colSpan={
                            1 + // selection column
                            (renderRow ? 1 : 0) + // expansion column
                            columns.length + // data columns
                            (rowActions?.length ? 1 : 0) // actions column
                          }
                          className="px-0"
                        >
                          <div className="p-4 bg-gray-50 border-t border-gray-200">
                            {renderRow(row, index, columns)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className={stickyFooter ? 'sticky bottom-0 bg-white border-t border-gray-200' : 'pt-4'}>
          <Pagination
            currentPage={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.total}
            onPageChange={pagination.onPageChange}
            showPageSizeSelector={pagination.showPageSizeSelector}
            pageSizeOptions={pagination.pageSizeOptions}
            onPageSizeChange={pagination.onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
};

// Default export
export default DataTable;