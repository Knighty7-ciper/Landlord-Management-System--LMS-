import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  MapPin, 
  Home, 
  DollarSign, 
  Users,
  Edit,
  Eye,
  Trash2,
  Grid,
  List,
  Filter,
  SortAsc,
  Building2
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// Import new components
import Input from '@/components/forms/Input'
import Select, { SelectOption } from '@/components/forms/Select'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import Badge, { StatusBadge } from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'

// Import existing services and utilities
import { useQuery } from 'react-query'

interface Property {
  id: string
  name: string
  property_type: string
  monthly_rent: number
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable'
  bedrooms: number
  bathrooms: number
  square_footage: number
  address: {
    street: string
    city: string
    state: string
    zip_code: string
  }
  units_total: number
  units_occupied: number
  image_url?: string
  created_at: string
}

// Mock data - in a real app, this would come from API
const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Sunset Apartments Complex',
    property_type: 'APARTMENT',
    monthly_rent: 1500,
    status: 'available',
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 1200,
    address: {
      street: '123 Sunset Drive',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62701'
    },
    units_total: 12,
    units_occupied: 10,
    created_at: '2024-01-15'
  },
  {
    id: '2',
    name: 'Oak Street Townhouse',
    property_type: 'TOWNHOUSE',
    monthly_rent: 2200,
    status: 'occupied',
    bedrooms: 3,
    bathrooms: 2.5,
    square_footage: 1800,
    address: {
      street: '456 Oak Street',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62702'
    },
    units_total: 1,
    units_occupied: 1,
    created_at: '2024-02-10'
  },
  {
    id: '3',
    name: 'Downtown Lofts',
    property_type: 'LOFT',
    monthly_rent: 2800,
    status: 'maintenance',
    bedrooms: 1,
    bathrooms: 1,
    square_footage: 900,
    address: {
      street: '789 Main Street',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62703'
    },
    units_total: 8,
    units_occupied: 6,
    created_at: '2024-03-05'
  },
  {
    id: '4',
    name: 'Riverside Condos',
    property_type: 'CONDO',
    monthly_rent: 1800,
    status: 'unavailable',
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 1400,
    address: {
      street: '321 River Road',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62704'
    },
    units_total: 15,
    units_occupied: 14,
    created_at: '2024-04-20'
  }
]

const PropertiesEnhanced: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Mock API call
  const { data: properties, isLoading, error } = useQuery('properties', async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return mockProperties
  })

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    if (!properties) return []

    let filtered = properties.filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.address.city.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter
      const matchesType = propertyTypeFilter === 'all' || property.property_type === propertyTypeFilter

      return matchesSearch && matchesStatus && matchesType
    })

    // Sort properties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rent_low':
          return a.monthly_rent - b.monthly_rent
        case 'rent_high':
          return b.monthly_rent - a.monthly_rent
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [properties, searchTerm, statusFilter, propertyTypeFilter, sortBy])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Calculate occupancy rate
  const getOccupancyRate = (occupied: number, total: number) => {
    return Math.round((occupied / total) * 100)
  }

  // Property Type Options
  const propertyTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'TOWNHOUSE', label: 'Townhouse' },
    { value: 'CONDO', label: 'Condo' },
    { value: 'LOFT', label: 'Loft' },
    { value: 'HOUSE', label: 'House' }
  ]

  // Status Options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'unavailable', label: 'Unavailable' }
  ]

  // Sort Options
  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'rent_low', label: 'Rent: Low to High' },
    { value: 'rent_high', label: 'Rent: High to Low' },
    { value: 'created', label: 'Recently Added' }
  ]

  // Property Card Component
  const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
    return (
      <Card 
        variant="default" 
        hover={true}
        clickable={true}
        className="h-full"
      >
        <div className="aspect-video w-full bg-gray-200 rounded-t-lg overflow-hidden">
          {property.image_url ? (
            <img
              src={property.image_url}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>
        
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {property.name}
            </h3>
            <StatusBadge status={property.status} />
          </div>
          
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="text-sm truncate">
              {property.address.city}, {property.address.state}
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Monthly Rent</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(property.monthly_rent)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{property.bedrooms} bed</span>
              <span>{property.bathrooms} bath</span>
              <span>{property.square_footage} sq ft</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Occupancy</span>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-gray-400" />
                <span className="text-sm font-medium">
                  {property.units_occupied}/{property.units_total}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${getOccupancyRate(property.units_occupied, property.units_total)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-right">
              {getOccupancyRate(property.units_occupied, property.units_total)}% occupied
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="justify-between">
          <Link
            to={`/properties/${property.id}`}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Link>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit className="h-3 w-3" />}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
              leftIcon={<Trash2 className="h-3 w-3" />}
            >
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Property List Item Component
  const PropertyListItem: React.FC<{ property: Property }> = ({ property }) => {
    return (
      <Card variant="default" className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Property Image */}
              <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Home className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Property Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {property.name}
                  </h3>
                  <StatusBadge status={property.status} />
                </div>
                
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {property.address.street}, {property.address.city}, {property.address.state}
                  </span>
                </div>
                
                <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatCurrency(property.monthly_rent)}
                  </div>
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.square_footage} sq ft</span>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {property.units_occupied}/{property.units_total} occupied
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 ml-6">
              <Link
                to={`/properties/${property.id}`}
                className="text-blue-600 hover:text-blue-800"
              >
                <Eye className="h-5 w-5" />
              </Link>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit className="h-3 w-3" />}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                leftIcon={<Trash2 className="h-3 w-3" />}
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading properties..." />
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <Alert variant="error" title="Error Loading Properties">
        Failed to load properties. Please try again later.
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your property portfolio</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          size="lg"
        >
          Add Property
        </Button>
      </div>

      {/* Search and Filters */}
      <Card variant="default">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  size="lg"
                />
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-3">
                <Button
                  variant={showFilters ? 'primary' : 'outline'}
                  size="md"
                  leftIcon={<Filter className="h-4 w-4" />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>
                
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    className="rounded-none border-0"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    className="rounded-none border-0"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Select
                    label="Status"
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value as string)}
                    options={statusOptions}
                    size="md"
                  />
                  
                  <Select
                    label="Property Type"
                    value={propertyTypeFilter}
                    onChange={(value) => setPropertyTypeFilter(value as string)}
                    options={propertyTypeOptions}
                    size="md"
                  />
                  
                  <Select
                    label="Sort By"
                    value={sortBy}
                    onChange={(value) => setSortBy(value as string)}
                    options={sortOptions}
                    size="md"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredProperties.length} of {properties?.length || 0} properties
        </p>
        {filteredProperties.length === 0 && (
          <Alert variant="info">
            No properties found matching your criteria.
          </Alert>
        )}
      </div>

      {/* Properties Grid/List */}
      {filteredProperties.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="space-y-0">
              {filteredProperties.map((property) => (
                <PropertyListItem key={property.id} property={property} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PropertiesEnhanced