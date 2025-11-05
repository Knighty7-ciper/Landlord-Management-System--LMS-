import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Home, 
  DollarSign, 
  Users,
  Edit,
  Eye,
  Trash2,
  Grid,
  List
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useQuery } from 'react-query'
import { clsx } from 'clsx'

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
    name: 'Maple Court Condos',
    property_type: 'CONDO',
    monthly_rent: 1800,
    status: 'maintenance',
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 1100,
    address: {
      street: '789 Maple Court',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62703'
    },
    units_total: 8,
    units_occupied: 7,
    created_at: '2024-03-05'
  }
]

const Properties: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [showFilters, setShowFilters] = useState(false)

  // In a real app, this would be an API call
  const { data: properties, isLoading } = useQuery('properties', async () => {
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockProperties
  })

  const filteredAndSortedProperties = useMemo(() => {
    if (!properties) return []

    let filtered = properties.filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.address.state.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter
      const matchesType = typeFilter === 'all' || property.property_type === typeFilter

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
  }, [properties, searchTerm, statusFilter, typeFilter, sortBy])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'occupied':
        return 'bg-blue-100 text-blue-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'unavailable':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'APARTMENT':
        return 'Apartment'
      case 'TOWNHOUSE':
        return 'Townhouse'
      case 'CONDO':
        return 'Condo'
      case 'SINGLE_FAMILY':
        return 'Single Family'
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading properties..." />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your property portfolio</p>
        </div>
        <Link
          to="/properties/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 shadow rounded-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md',
                showFilters
                  ? 'border-blue-300 text-blue-700 bg-blue-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              )}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="rent_low">Rent: Low to High</option>
              <option value="rent_high">Rent: High to Low</option>
              <option value="created">Recently Added</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'px-3 py-2 text-sm font-medium',
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'px-3 py-2 text-sm font-medium border-l border-gray-300',
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="CONDO">Condo</option>
                  <option value="SINGLE_FAMILY">Single Family</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-700">
        Showing {filteredAndSortedProperties.length} of {properties?.length || 0} properties
      </div>

      {/* Properties Grid/List */}
      {filteredAndSortedProperties.length === 0 ? (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
          <div className="mt-6">
            <Link
              to="/properties/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedProperties.map((property) => (
            <div key={property.id} className="bg-white overflow-hidden shadow rounded-lg">
              {/* Property Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
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

              {/* Property Info */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {property.name}
                  </h3>
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getStatusColor(property.status)
                  )}>
                    {property.status}
                  </span>
                </div>

                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  {property.address.city}, {property.address.state}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Rent</p>
                    <p className="text-lg font-medium text-gray-900">
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

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {property.units_occupied}/{property.units_total} occupied
                    </span>
                    <span className="text-gray-500">
                      {property.square_footage} sq ft
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      to={`/properties/${property.id}`}
                      className="text-blue-600 hover:text-blue-500"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/properties/${property.id}/edit`}
                      className="text-gray-600 hover:text-gray-500"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                  <button className="text-red-600 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredAndSortedProperties.map((property) => (
              <li key={property.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {property.image_url ? (
                        <img
                          src={property.image_url}
                          alt={property.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center">
                          <Home className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{property.name}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {property.address.street}, {property.address.city}, {property.address.state}
                          </p>
                        </div>
                        <span className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(property.status)
                        )}>
                          {property.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <DollarSign className="mr-1 h-3 w-3" />
                          {formatCurrency(property.monthly_rent)}
                        </span>
                        <span>{property.bedrooms} bed</span>
                        <span>{property.bathrooms} bath</span>
                        <span>{property.square_footage} sq ft</span>
                        <span>
                          <Users className="mr-1 h-3 w-3 inline" />
                          {property.units_occupied}/{property.units_total} occupied
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/properties/${property.id}`}
                      className="text-blue-600 hover:text-blue-500"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/properties/${property.id}/edit`}
                      className="text-gray-600 hover:text-gray-500"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button className="text-red-600 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Properties