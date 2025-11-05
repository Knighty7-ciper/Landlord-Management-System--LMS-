import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { 
  ArrowLeft,
  Edit2,
  Trash2,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Car,
  Calendar,
  DollarSign,
  Building,
  Users,
  Package,
  AlertCircle,
  Eye,
  Camera,
  Share2,
  Settings,
  Download,
  FileText,
  Clock,
  Shield,
  Zap,
  Wifi,
  Waves,
  TreePine,
  Dumbbell,
  Car as CarIcon
} from 'lucide-react'

// Import our component library
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import { Modal, ConfirmationModal, ModalProvider } from '@/components/layout/Modal'
import { ActionDropdown } from '@/components/layout/Dropdown'

// Property interfaces
interface Property {
  id: string
  name: string
  property_type: string
  monthly_rent: number
  status: PropertyStatus
  bedrooms?: number
  bathrooms?: number
  square_footage?: number
  parking_spaces?: number
  year_built?: number
  description?: string
  deposit_amount?: number
  pet_policy?: string
  smoking_policy?: string
  utilities_included?: string[]
  amenities?: string[]
  address: PropertyAddress
  images: PropertyImage[]
  units?: PropertyUnit[]
  created_at: string
  updated_at: string
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

interface PropertyImage {
  id: string
  image_url: string
  thumbnail_url?: string
  image_type: string
  original_filename?: string
  is_primary?: boolean
  caption?: string
}

interface PropertyUnit {
  id: string
  unit_number?: string
  monthly_rent?: number
  bedrooms?: number
  bathrooms?: number
  square_footage?: number
  floor_level?: number
  status: string
  description?: string
}

type PropertyStatus = 'available' | 'occupied' | 'maintenance' | 'unavailable' | 'archived'

// Mock service (in production this would be a real API service)
const propertyService = {
  getProperty: async (id: string): Promise<Property> => {
    // Mock implementation
    return Promise.resolve({
      id,
      name: 'Sunset Apartments Complex',
      property_type: 'APARTMENT',
      monthly_rent: 1500,
      status: 'available',
      bedrooms: 2,
      bathrooms: 2,
      square_footage: 1200,
      parking_spaces: 2,
      year_built: 2015,
      description: 'Beautiful modern apartment complex with stunning city views and premium amenities. Recently renovated with high-end finishes.',
      deposit_amount: 1500,
      pet_policy: 'pets_allowed',
      smoking_policy: 'no_smoking',
      utilities_included: ['Water', 'Sewer', 'Trash'],
      amenities: ['Pool', 'Gym', 'Parking', 'Laundry', 'Balcony'],
      address: {
        street: '123 Sunset Drive',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62701',
        country: 'USA',
        latitude: 39.7817,
        longitude: -89.6501
      },
      images: [
        {
          id: '1',
          image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          thumbnail_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=50',
          image_type: 'exterior',
          original_filename: 'building_exterior.jpg',
          is_primary: true
        },
        {
          id: '2',
          image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          thumbnail_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=50',
          image_type: 'living_room',
          original_filename: 'living_room.jpg'
        }
      ],
      units: [
        {
          id: '1',
          unit_number: '101',
          monthly_rent: 1500,
          bedrooms: 2,
          bathrooms: 2,
          square_footage: 1200,
          floor_level: 1,
          status: 'available',
          description: 'Corner unit with updated kitchen and city views'
        }
      ],
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    })
  },
  deleteProperty: async (id: string): Promise<void> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000))
    return Promise.resolve()
  }
}

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

// Remove the old interface declaration since we already have it above

export default PropertyDetails
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false)

  // Fetch property details
  const { data: property, isLoading, error } = useQuery<Property>(
    ['property', id],
    () => propertyService.getProperty(id!),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Delete property mutation
  const deleteMutation = useMutation(
    () => propertyService.deleteProperty(id!),
    {
      onSuccess: () => {
        toast.success('Property deleted successfully')
        queryClient.invalidateQueries(['properties'])
        navigate('/properties')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete property')
      },
    }
  )

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync()
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share && property) {
      try {
        await navigator.share({
          title: property.name,
          text: `Check out this property: ${property.name}`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Property link copied to clipboard')
    }
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

  const getPropertyTypeLabel = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Pool': <Waves className="h-4 w-4" />,
      'Gym': <Dumbbell className="h-4 w-4" />,
      'Parking': <CarIcon className="h-4 w-4" />,
      'Laundry': <Settings className="h-4 w-4" />,
      'Balcony': <Building className="h-4 w-4" />,
      'WiFi': <Wifi className="h-4 w-4" />,
      'Green Space': <TreePine className="h-4 w-4" />
    }
    return iconMap[amenity] || <Settings className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading property details...</span>
      </div>
    )
  }

  if (error || !property) {
    return (
      <Alert
        variant="danger"
        title="Property Not Found"
        message="The property you're looking for doesn't exist or has been removed."
        action={
          <Button as={Link} to="/properties" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Properties
          </Button>
        }
      />
    )
  }

  return (
    <ModalProvider>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Button
              as={Link}
              to="/properties"
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Properties
            </Button>
            <div className="h-4 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
              <div className="flex items-center mt-1 space-x-2">
                <Badge variant={getStatusBadgeVariant(property.status)}>
                  {property.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  {getPropertyTypeLabel(property.property_type)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              leftIcon={<Share2 className="h-4 w-4" />}
              onClick={handleShare}
            >
              Share
            </Button>
            
            <ActionDropdown
              trigger={
                <Button variant="primary">
                  <Settings className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              }
              items={[
                { 
                  label: 'Edit Property', 
                  icon: <Edit2 className="h-4 w-4" />,
                  as: Link,
                  to: `/properties/${id}/edit`
                },
                { 
                  label: 'Download Report', 
                  icon: <Download className="h-4 w-4" />
                },
                { 
                  label: 'Print Details', 
                  icon: <FileText className="h-4 w-4" />
                },
                { type: 'divider' as const },
                { 
                  label: 'Delete Property', 
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => setShowDeleteModal(true)
                }
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Property Images</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageGallery(true)}
                    leftIcon={<Eye className="h-4 w-4" />}
                  >
                    Full Gallery
                  </Button>
                </div>
              </Card.Header>
              
              <Card.Content>
                {property.images && property.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.images.slice(0, 6).map((image, index) => (
                      <div 
                        key={image.id} 
                        className="relative group cursor-pointer"
                        onClick={() => {
                          setCurrentImageIndex(index)
                          setShowImageGallery(true)
                        }}
                      >
                        <img
                          src={image.thumbnail_url || image.image_url}
                          alt={image.original_filename || `${image.image_type} view`}
                          className="w-full h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black bg-opacity-50 rounded-lg p-2">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        {image.is_primary && (
                          <Badge variant="primary" className="absolute top-2 left-2">
                            Primary
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p>No images available</p>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Property Details */}
            <Card>
              <Card.Header>
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    {property.bedrooms && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <BedDouble className="h-4 w-4" />
                          <span className="text-sm">Bedrooms</span>
                        </div>
                        <span className="font-medium">{property.bedrooms}</span>
                      </div>
                    )}
                    
                    {property.bathrooms && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Bath className="h-4 w-4" />
                          <span className="text-sm">Bathrooms</span>
                        </div>
                        <span className="font-medium">{property.bathrooms}</span>
                      </div>
                    )}
                    
                    {property.square_footage && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Square className="h-4 w-4" />
                          <span className="text-sm">Square Footage</span>
                        </div>
                        <span className="font-medium">{property.square_footage.toLocaleString()} sq ft</span>
                      </div>
                    )}
                    
                    {property.parking_spaces && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <CarIcon className="h-4 w-4" />
                          <span className="text-sm">Parking Spaces</span>
                        </div>
                        <span className="font-medium">{property.parking_spaces}</span>
                      </div>
                    )}
                    
                    {property.year_built && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">Year Built</span>
                        </div>
                        <span className="font-medium">{property.year_built}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Information */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Monthly Rent</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(property.monthly_rent)}
                      </span>
                    </div>
                    
                    {property.deposit_amount && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Shield className="h-4 w-4" />
                          <span className="text-sm">Security Deposit</span>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(property.deposit_amount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Description</h3>
                    <p className="text-sm text-gray-900 leading-relaxed">{property.description}</p>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <Card.Header>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
                  </div>
                </Card.Header>
                
                <Card.Content>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm font-medium text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}

            {/* Utilities Included */}
            {property.utilities_included && property.utilities_included.length > 0 && (
              <Card>
                <Card.Header>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Utilities Included</h2>
                  </div>
                </Card.Header>
                
                <Card.Content>
                  <div className="flex flex-wrap gap-2">
                    {property.utilities_included.map((utility, index) => (
                      <Badge key={index} variant="secondary">
                        {utility}
                      </Badge>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}

            {/* Units (if multi-family property) */}
            {property.units && property.units.length > 0 && (
              <Card>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-gray-500" />
                      <h2 className="text-lg font-semibold text-gray-900">Units</h2>
                    </div>
                    <Badge variant="secondary">
                      {property.units.length} unit{property.units.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </Card.Header>
                
                <Card.Content>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.units.map((unit) => (
                      <div key={unit.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Unit {unit.unit_number || unit.id.slice(-6)}
                          </h3>
                          <Badge 
                            variant={unit.status === 'available' ? 'success' : 'primary'}
                          >
                            {unit.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {unit.monthly_rent && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Monthly Rent:</span>
                              <span className="font-medium">{formatCurrency(unit.monthly_rent)}</span>
                            </div>
                          )}
                          
                          {(unit.bedrooms || unit.bathrooms) && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Layout:</span>
                              <span className="font-medium">
                                {unit.bedrooms || '?'} bed / {unit.bathrooms || '?'} bath
                              </span>
                            </div>
                          )}
                          
                          {unit.square_footage && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Size:</span>
                              <span className="font-medium">{unit.square_footage} sq ft</span>
                            </div>
                          )}
                          
                          {unit.floor_level && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Floor:</span>
                              <span className="font-medium">Level {unit.floor_level}</span>
                            </div>
                          )}
                        </div>
                        
                        {unit.description && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600">{unit.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Address */}
            <Card>
              <Card.Header>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Address</h2>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-2 text-sm text-gray-900">
                  <p className="font-medium">{property.address.street}</p>
                  <p>{property.address.city}, {property.address.state} {property.address.zip_code}</p>
                  <p>{property.address.country}</p>
                </div>
                {property.address.latitude && property.address.longitude && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps?q=${property.address.latitude},${property.address.longitude}`,
                          '_blank'
                        )
                      }}
                      leftIcon={<MapPin className="h-4 w-4" />}
                    >
                      View on Map
                    </Button>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Financial Overview */}
            <Card>
              <Card.Header>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Financial Overview</h2>
                </div>
              </Card.Header>
              
              <Card.Content className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Rent</span>
                    <span className="text-xl font-bold text-green-700">
                      {formatCurrency(property.monthly_rent)}
                    </span>
                  </div>
                </div>
                
                {property.deposit_amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Security Deposit</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(property.deposit_amount)}
                    </span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Annual Potential</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(property.monthly_rent * 12)}
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Policies */}
            {(property.pet_policy !== 'no_pets' || property.smoking_policy !== 'no_smoking') && (
              <Card>
                <Card.Header>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Policies</h2>
                  </div>
                </Card.Header>
                
                <Card.Content className="space-y-4">
                  {property.pet_policy !== 'no_pets' && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Pet Policy</div>
                      <Badge variant={property.pet_policy === 'pets_allowed' ? 'success' : 'warning'}>
                        {getPropertyTypeLabel(property.pet_policy)}
                      </Badge>
                    </div>
                  )}
                  
                  {property.smoking_policy !== 'no_smoking' && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Smoking Policy</div>
                      <Badge variant={property.smoking_policy === 'smoking_allowed' ? 'warning' : 'secondary'}>
                        {getPropertyTypeLabel(property.smoking_policy)}
                      </Badge>
                    </div>
                  )}
                </Card.Content>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <Card.Header>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
              </Card.Header>
              
              <Card.Content className="space-y-3">
                <Button
                  as={Link}
                  to={`/tenants/new?property_id=${id}`}
                  variant="primary"
                  leftIcon={<Users className="h-4 w-4" />}
                  className="w-full"
                >
                  Add Tenant
                </Button>
                
                <Button
                  as={Link}
                  to={`/leases/new?property_id=${id}`}
                  variant="outline"
                  leftIcon={<Package className="h-4 w-4" />}
                  className="w-full"
                >
                  Create Lease
                </Button>
                
                <Button
                  as={Link}
                  to={`/maintenance/new?property_id=${id}`}
                  variant="outline"
                  leftIcon={<AlertCircle className="h-4 w-4" />}
                  className="w-full"
                >
                  Maintenance Request
                </Button>
              </Card.Content>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Property"
          message={`Are you sure you want to delete "${property.name}"? This action cannot be undone and will remove all associated data.`}
          confirmText="Delete Property"
          variant="danger"
          loading={deleteMutation.isLoading}
        />

        {/* Image Gallery Modal */}
        {showImageGallery && property.images && property.images.length > 0 && (
          <Modal
            isOpen={showImageGallery}
            onClose={() => setShowImageGallery(false)}
            title={`${property.name} - Image Gallery`}
            size="xl"
          >
            <div className="space-y-4">
              {/* Image Navigation */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {currentImageIndex + 1} of {property.images.length}
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentImageIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentImageIndex(prev => Math.min(property.images!.length - 1, prev + 1))}
                    disabled={currentImageIndex === property.images.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
              
              {/* Main Image */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={property.images[currentImageIndex].image_url}
                  alt={property.images[currentImageIndex].original_filename || 'Property image'}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Navigation */}
              <div className="grid grid-cols-6 gap-2">
                {property.images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`aspect-square bg-gray-100 rounded cursor-pointer overflow-hidden ${
                      index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image.thumbnail_url || image.image_url}
                      alt={image.original_filename || 'Property image'}
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </ModalProvider>
  )
}

export default PropertyDetails