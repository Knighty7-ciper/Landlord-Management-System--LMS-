import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import ImageGallery from 'react-image-gallery'
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
  Loader2,
  Eye,
  Camera,
  Share2,
  X
} from 'lucide-react'
import { propertyService, Property, PropertyUnit } from '@/services/api'
import MainLayout from '@/components/layout/MainLayout'

interface PropertyDetailsProps {}

const PropertyDetails: React.FC<PropertyDetailsProps> = () => {
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
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }
    
    setDeleteLoading(true)
    try {
      await deleteMutation.mutateAsync()
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.name,
          text: `Check out this property: ${property?.name}`,
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading property details...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !property) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Property Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <div className="mt-6">
              <Link
                to="/properties"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Prepare images for gallery
  const galleryImages = property.images.map(image => ({
    original: image.image_url,
    thumbnail: image.thumbnail_url || image.image_url,
    description: `${image.image_type.charAt(0).toUpperCase() + image.image_type.slice(1)} view`,
  }))

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  // Get unit status badge color
  const getUnitStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/properties"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Properties
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
            
            <Link
              to={`/properties/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Property Images</h2>
                <button
                  onClick={() => setImageGalleryOpen(true)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Full Gallery
                </button>
              </div>
              
              <div className="p-4">
                {property.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.images.slice(0, 6).map((image) => (
                      <div key={image.id} className="relative group cursor-pointer">
                        <img
                          src={image.thumbnail_url || image.image_url}
                          alt={image.original_filename || `${image.image_type} view`}
                          className="w-full h-24 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                          onClick={() => setImageGalleryOpen(true)}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black bg-opacity-50 rounded-lg p-2">
                            <Camera className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        {image.is_primary && (
                          <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              Primary
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No images available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Property Details</h2>
              </div>
              
              <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Building className="h-4 w-4 mr-1 text-gray-400" />
                      {property.property_type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(property.status)}`}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </span>
                    </dd>
                  </div>
                  
                  {property.description && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{property.description}</dd>
                    </div>
                  )}
                  
                  {property.bedrooms && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Bedrooms</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <BedDouble className="h-4 w-4 mr-1 text-gray-400" />
                        {property.bedrooms}
                      </dd>
                    </div>
                  )}
                  
                  {property.bathrooms && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Bathrooms</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <Bath className="h-4 w-4 mr-1 text-gray-400" />
                        {property.bathrooms}
                      </dd>
                    </div>
                  )}
                  
                  {property.square_footage && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Square Footage</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <Square className="h-4 w-4 mr-1 text-gray-400" />
                        {property.square_footage.toLocaleString()} sq ft
                      </dd>
                    </div>
                  )}
                  
                  {property.parking_spaces && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Parking Spaces</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <Car className="h-4 w-4 mr-1 text-gray-400" />
                        {property.parking_spaces}
                      </dd>
                    </div>
                  )}
                  
                  {property.year_built && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Year Built</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {property.year_built}
                      </dd>
                    </div>
                  )}
                  
                  {property.utilities_included && property.utilities_included.length > 0 && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Utilities Included</dt>
                      <dd className="mt-1">
                        <div className="flex flex-wrap gap-2">
                          {property.utilities_included.map((utility, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {utility}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                  
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Amenities</dt>
                      <dd className="mt-1">
                        <div className="flex flex-wrap gap-2">
                          {property.amenities.map((amenity, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Units (if multi-family property) */}
            {property.units && property.units.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Units</h2>
                  <span className="text-sm text-gray-500">{property.units.length} units</span>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.units.map((unit: PropertyUnit) => (
                      <div key={unit.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            {unit.unit_number || 'Unit ' + unit.id.slice(-6)}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUnitStatusBadgeColor(unit.status)}`}>
                            {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                          </span>
                        </div>
                        
                        <dl className="space-y-2">
                          {unit.monthly_rent && (
                            <div className="flex justify-between">
                              <dt className="text-xs text-gray-500">Rent</dt>
                              <dd className="text-xs text-gray-900 font-medium">${unit.monthly_rent.toLocaleString()}</dd>
                            </div>
                          )}
                          
                          {(unit.bedrooms || unit.bathrooms) && (
                            <div className="flex justify-between">
                              <dt className="text-xs text-gray-500">Layout</dt>
                              <dd className="text-xs text-gray-900">
                                {unit.bedrooms || '?'} bed / {unit.bathrooms || '?'} bath
                              </dd>
                            </div>
                          )}
                          
                          {unit.square_footage && (
                            <div className="flex justify-between">
                              <dt className="text-xs text-gray-500">Size</dt>
                              <dd className="text-xs text-gray-900">{unit.square_footage} sq ft</dd>
                            </div>
                          )}
                          
                          {unit.floor_level && (
                            <div className="flex justify-between">
                              <dt className="text-xs text-gray-500">Floor</dt>
                              <dd className="text-xs text-gray-900">Level {unit.floor_level}</dd>
                            </div>
                          )}
                        </dl>
                        
                        {unit.description && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600">{unit.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Address */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Address</h2>
              </div>
              
              <div className="p-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-gray-900">
                    <p>{property.address.street}</p>
                    <p>
                      {property.address.city}, {property.address.state} {property.address.zip_code}
                    </p>
                    <p>{property.address.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Financial</h2>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Monthly Rent</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${property.monthly_rent.toLocaleString()}
                  </span>
                </div>
                
                {property.deposit_amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Security Deposit</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${property.deposit_amount.toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-600">Property Income Potential</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies */}
            {(property.pet_policy !== 'no_pets' || property.smoking_policy !== 'no_smoking') && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Policies</h2>
                </div>
                
                <div className="p-4 space-y-3">
                  {property.pet_policy !== 'no_pets' && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Pet Policy</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {property.pet_policy.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </dd>
                    </div>
                  )}
                  
                  {property.smoking_policy !== 'no_smoking' && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Smoking Policy</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {property.smoking_policy.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              
              <div className="p-4 space-y-3">
                <Link
                  to={`/tenants/new?property_id=${id}`}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Tenant
                </Link>
                
                <Link
                  to={`/leases/new?property_id=${id}`}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Create Lease
                </Link>
                
                <Link
                  to={`/maintenance/new?property_id=${id}`}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Maintenance Request
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Full Image Gallery Modal */}
        {imageGalleryOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-75" onClick={() => setImageGalleryOpen(false)} />
            <div className="absolute inset-4 bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {property.name} - Image Gallery
                </h3>
                <button
                  onClick={() => setImageGalleryOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="h-full p-4">
                {galleryImages.length > 0 ? (
                  <ImageGallery
                    items={galleryImages}
                    showThumbnails={true}
                    showFullscreenButton={true}
                    showPlayButton={false}
                    thumbnailPosition="bottom"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2">No images available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default PropertyDetails