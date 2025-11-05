import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  MapPin, 
  Home, 
  DollarSign, 
  Users,
  Edit,
  Eye,
  Trash2,
  Grid,
  List,
  Settings,
  Download,
  Share2
} from 'lucide-react'
import { useQuery } from 'react-query'
import { clsx } from 'clsx'

// Import our component library
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import { Input } from '@/components/forms/Input'
import { Select } from '@/components/forms/Select'
import { Modal, ConfirmationModal, ModalProvider } from '@/components/layout/Modal'
import { ActionDropdown } from '@/components/layout/Dropdown'
import { DataTable } from '@/components/data/DataTable'
import { Search } from '@/components/data/Search'

// Property interfaces - production-ready
interface Property {
  id: string
  name: string
  property_type: PropertyType
  monthly_rent: number
  status: PropertyStatus
  bedrooms: number
  bathrooms: number
  square_footage: number
  address: PropertyAddress
  units_total: number
  units_occupied: number
  image_url?: string
  description?: string
  amenities: string[]
  lease_terms: string
  created_at: string
  updated_at: string
  landlord_id: string
  total_value: number
  yearly_roi: number
}

interface PropertyAddress {
  street: string
  city: string
  state: string
  zip_code: string
  country: string
  latitude?: number
  longitude?: number
}

type PropertyType = 'APARTMENT' | 'TOWNHOUSE' | 'CONDO' | 'SINGLE_FAMILY' | 'DUPLEX' | 'COMMERCIAL'
type PropertyStatus = 'available' | 'occupied' | 'maintenance' | 'unavailable' | 'archived'

interface PropertyFilters {
  status: PropertyStatus | 'all'
  property_type: PropertyType | 'all'
  bedrooms: number | 'all'
  bathrooms: number | 'all'
  price_range: { min: number; max: number } | null
  location: string
}

interface PropertySortConfig {
  field: string
  direction: 'asc' | 'desc'
}

const Properties: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<PropertyFilters>({
    status: 'all',
    property_type: 'all',
    bedrooms: 'all',
    bathrooms: 'all',
    price_range: null,
    location: ''
  })
  const [sortConfig, setSortConfig] = useState<PropertySortConfig>({
    field: 'name',
    direction: 'asc'
  })
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // API integration - would connect to real backend
  const { data: properties, isLoading, error } = useQuery(
    ['properties', filters, sortConfig],
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // In production, this would be an actual API call
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, sort: sortConfig })
      })
      
      if (!response.ok) throw new Error('Failed to fetch properties')
      return response.json()
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  const filteredAndSortedProperties = useMemo(() => {
    if (!properties) return []

    let filtered = properties.filter(property => {
      // Status filter
      if (filters.status !== 'all' && property.status !== filters.status) return false
      
      // Property type filter
      if (filters.property_type !== 'all' && property.property_type !== filters.property_type) return false
      
      // Bedrooms filter
      if (filters.bedrooms !== 'all' && property.bedrooms !== filters.bedrooms) return false
      
      // Bathrooms filter
      if (filters.bathrooms !== 'all' && property.bathrooms !== filters.bathrooms) return false
      
      // Price range filter
      if (filters.price_range) {
        if (property.monthly_rent < filters.price_range.min || 
            property.monthly_rent > filters.price_range.max) return false
      }
      
      // Location filter (handled by Search component)
      
      return true
    })

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = sortConfig
      let aValue: any
      let bValue: any

      switch (field) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'monthly_rent':
          aValue = a.monthly_rent
          bValue = b.monthly_rent
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'bedrooms':
          aValue = a.bedrooms
          bValue = b.bedrooms
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [properties, filters, sortConfig])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadgeVariant = (status: PropertyStatus) => {
    switch (status) {
      case 'available':
        return 'success' as const
      case 'occupied':
        return 'primary' as const
      case 'maintenance':
        return 'warning' as const
      case 'unavailable':
        return 'danger' as const
      case 'archived':
        return 'secondary' as const
      default:
        return 'secondary' as const
    }
  }

  const getPropertyTypeLabel = (type: PropertyType) => {
    switch (type) {
      case 'APARTMENT':
        return 'Apartment'
      case 'TOWNHOUSE':
        return 'Townhouse'
      case 'CONDO':
        return 'Condo'
      case 'SINGLE_FAMILY':
        return 'Single Family'
      case 'DUPLEX':
        return 'Duplex'
      case 'COMMERCIAL':
        return 'Commercial'
      default:
        return type
    }
  }

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handlePropertyDelete = (property: Property) => {
    setPropertyToDelete(property)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!propertyToDelete) return
    
    try {
      // In production, this would be an actual API call
      await fetch(`/api/properties/${propertyToDelete.id}`, {
        method: 'DELETE'
      })
      
      // Refresh the properties list
      // queryClient.invalidateQueries(['properties'])
      
      setShowDeleteModal(false)
      setPropertyToDelete(null)
    } catch (error) {
      console.error('Failed to delete property:', error)
    }
  }

  const handleBulkActions = async (action: string) => {
    switch (action) {
      case 'delete':
        // Handle bulk delete
        break
      case 'export':
        // Handle bulk export
        break
      case 'archive':
        // Handle bulk archive
        break
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading properties...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        variant="danger"
        title="Error Loading Properties"
        message="Failed to load properties. Please try again."
      />
    )
  }

  return (
    <ModalProvider>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600">Manage your property portfolio</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export
            </Button>
            <Button
              as={Link}
              to="/properties/new"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Property
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="space-y-4">
            {/* Search Bar */}
            <Search
              placeholder="Search properties by name, address, or type..."
              onResults={(results) => {
                // Handle search results
                console.log('Search results:', results)
              }}
              showSuggestions={true}
              categories={[
                { label: 'Properties', count: properties?.length || 0 },
                { label: 'Available', count: properties?.filter(p => p.status === 'available').length || 0 },
                { label: 'Occupied', count: properties?.filter(p => p.status === 'occupied').length || 0 }
              ]}
            />

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Left side controls */}
              <div className="flex items-center space-x-4">
                {/* Filters Toggle */}
                <Button
                  variant={showFilters ? "primary" : "outline"}
                  leftIcon={<Settings className="h-4 w-4" />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? "primary" : "outline"}
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                    leftIcon={<Grid className="h-4 w-4" />}
                  />
                  <Button
                    variant={viewMode === 'list' ? "primary" : "outline"}
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none border-l-0"
                    leftIcon={<List className="h-4 w-4" />}
                  />
                </div>
              </div>

              {/* Right side controls */}
              <div className="flex items-center space-x-3">
                {/* Bulk Actions */}
                {selectedProperties.length > 0 && (
                  <ActionDropdown
                    trigger={<Button variant="outline">Actions ({selectedProperties.length})</Button>}
                    items={[
                      { label: 'Export Selected', icon: <Download className="h-4 w-4" /> },
                      { label: 'Archive Selected', icon: <Settings className="h-4 w-4" /> },
                      { label: 'Share Selected', icon: <Share2 className="h-4 w-4" /> },
                      { type: 'divider' as const },
                      { 
                        label: 'Delete Selected', 
                        icon: <Trash2 className="h-4 w-4" />,
                        onClick: () => handleBulkActions('delete')
                      }
                    ]}
                  />
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Select
                    label="Status"
                    value={filters.status}
                    onChange={(value) => setFilters(prev => ({ ...prev, status: value as PropertyStatus | 'all' }))}
                    options={[
                      { value: 'all', label: 'All Statuses' },
                      { value: 'available', label: 'Available' },
                      { value: 'occupied', label: 'Occupied' },
                      { value: 'maintenance', label: 'Maintenance' },
                      { value: 'unavailable', label: 'Unavailable' },
                      { value: 'archived', label: 'Archived' }
                    ]}
                  />
                  
                  <Select
                    label="Property Type"
                    value={filters.property_type}
                    onChange={(value) => setFilters(prev => ({ ...prev, property_type: value as PropertyType | 'all' }))}
                    options={[
                      { value: 'all', label: 'All Types' },
                      { value: 'APARTMENT', label: 'Apartment' },
                      { value: 'TOWNHOUSE', label: 'Townhouse' },
                      { value: 'CONDO', label: 'Condo' },
                      { value: 'SINGLE_FAMILY', label: 'Single Family' },
                      { value: 'DUPLEX', label: 'Duplex' },
                      { value: 'COMMERCIAL', label: 'Commercial' }
                    ]}
                  />
                  
                  <Select
                    label="Bedrooms"
                    value={filters.bedrooms}
                    onChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value as number | 'all' }))}
                    options={[
                      { value: 'all', label: 'Any' },
                      { value: '0', label: 'Studio' },
                      { value: '1', label: '1 Bedroom' },
                      { value: '2', label: '2 Bedrooms' },
                      { value: '3', label: '3 Bedrooms' },
                      { value: '4', label: '4+ Bedrooms' }
                    ]}
                  />
                  
                  <Select
                    label="Bathrooms"
                    value={filters.bathrooms}
                    onChange={(value) => setFilters(prev => ({ ...prev, bathrooms: value as number | 'all' }))}
                    options={[
                      { value: 'all', label: 'Any' },
                      { value: '1', label: '1 Bathroom' },
                      { value: '1.5', label: '1.5 Bathrooms' },
                      { value: '2', label: '2 Bathrooms' },
                      { value: '2.5', label: '2.5 Bathrooms' },
                      { value: '3', label: '3+ Bathrooms' }
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredAndSortedProperties.length}</span> of{' '}
            <span className="font-medium">{properties?.length || 0}</span> properties
          </div>
          
          {selectedProperties.length > 0 && (
            <div className="text-sm text-blue-600">
              {selectedProperties.length} property{selectedProperties.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Properties Display */}
        {filteredAndSortedProperties.length === 0 ? (
          <Card className="text-center py-12">
            <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or add a new property.
            </p>
            <Button
              as={Link}
              to="/properties/new"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Property
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                {/* Property Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Home className="h-12 w-12 text-gray-400" />
                  )}
                </div>

                {/* Property Content */}
                <Card.Content className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
                      {property.name}
                    </h3>
                    <Badge variant={getStatusBadgeVariant(property.status)}>
                      {property.status}
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    {property.address.city}, {property.address.state}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Monthly Rent</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(property.monthly_rent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {getPropertyTypeLabel(property.property_type)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bedrooms</p>
                      <p className="text-sm font-medium text-gray-900">{property.bedrooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bathrooms</p>
                      <p className="text-sm font-medium text-gray-900">{property.bathrooms}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {property.units_occupied}/{property.units_total} occupied
                    </span>
                    <span>{property.square_footage} sq ft</span>
                  </div>

                  {/* Property Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        as={Link}
                        to={`/properties/${property.id}`}
                        leftIcon={<Eye className="h-3 w-3" />}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        as={Link}
                        to={`/properties/${property.id}/edit`}
                        leftIcon={<Edit className="h-3 w-3" />}
                      >
                        Edit
                      </Button>
                    </div>
                    
                    <ActionDropdown
                      trigger={
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      }
                      items={[
                        { label: 'View Details', icon: <Eye className="h-4 w-4" /> },
                        { label: 'Edit Property', icon: <Edit className="h-4 w-4" /> },
                        { type: 'divider' as const },
                        { 
                          label: 'Delete Property', 
                          icon: <Trash2 className="h-4 w-4" />,
                          onClick: () => handlePropertyDelete(property)
                        }
                      ]}
                    />
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        ) : (
          /* DataTable View */
          <DataTable
            data={filteredAndSortedProperties}
            columns={[
              {
                key: 'name',
                header: 'Property',
                sortable: true,
                render: (property: Property) => (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {property.image_url ? (
                        <img
                          src={property.image_url}
                          alt={property.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <Home className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{property.name}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {property.address.city}, {property.address.state}
                      </p>
                    </div>
                  </div>
                )
              },
              {
                key: 'status',
                header: 'Status',
                sortable: true,
                render: (property: Property) => (
                  <Badge variant={getStatusBadgeVariant(property.status)}>
                    {property.status}
                  </Badge>
                )
              },
              {
                key: 'monthly_rent',
                header: 'Monthly Rent',
                sortable: true,
                render: (property: Property) => (
                  <span className="font-medium">{formatCurrency(property.monthly_rent)}</span>
                )
              },
              {
                key: 'property_type',
                header: 'Type',
                sortable: true,
                render: (property: Property) => getPropertyTypeLabel(property.property_type)
              },
              {
                key: 'bedrooms',
                header: 'Beds',
                sortable: true,
                render: (property: Property) => property.bedrooms
              },
              {
                key: 'bathrooms',
                header: 'Baths',
                sortable: true,
                render: (property: Property) => property.bathrooms
              },
              {
                key: 'square_footage',
                header: 'Sq Ft',
                sortable: true,
                render: (property: Property) => property.square_footage.toLocaleString()
              },
              {
                key: 'occupancy',
                header: 'Occupancy',
                render: (property: Property) => (
                  <span className="text-sm text-gray-500">
                    {property.units_occupied}/{property.units_total}
                  </span>
                )
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (property: Property) => (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      as={Link}
                      to={`/properties/${property.id}`}
                      leftIcon={<Eye className="h-3 w-3" />}
                    >
                      View
                    </Button>
                    <ActionDropdown
                      trigger={
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      }
                      items={[
                        { label: 'View Details', icon: <Eye className="h-4 w-4" /> },
                        { label: 'Edit Property', icon: <Edit className="h-4 w-4" /> },
                        { type: 'divider' as const },
                        { 
                          label: 'Delete Property', 
                          icon: <Trash2 className="h-4 w-4" />,
                          onClick: () => handlePropertyDelete(property)
                        }
                      ]}
                    />
                  </div>
                )
              }
            ]}
            selectable
            selectedRows={selectedProperties}
            onSelectionChange={setSelectedProperties}
            onSort={handleSort}
            pageSize={10}
            emptyMessage="No properties found matching your criteria."
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setPropertyToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Delete Property"
          message={`Are you sure you want to delete "${propertyToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          loading={false}
        />
      </div>
    </ModalProvider>
  )
}

export default Properties