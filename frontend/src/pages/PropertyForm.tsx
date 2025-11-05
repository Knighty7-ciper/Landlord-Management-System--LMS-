import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  ArrowLeft,
  Save,
  Upload,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Car,
  Building,
  Plus,
  X,
  AlertCircle,
  Camera,
  FileText,
  Home,
  DollarSign,
  Calendar,
  Shield,
  Zap,
  Settings
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'

// Import our component library
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import { Input } from '@/components/forms/Input'
import { Select } from '@/components/forms/Select'

// Property form interfaces
interface PropertyFormData {
  name: string
  property_type: string
  monthly_rent: number
  deposit_amount?: number
  description?: string
  year_built?: number
  square_footage?: number
  bedrooms?: number
  bathrooms?: number
  parking_spaces?: number
  pet_policy: string
  smoking_policy: string
  utilities_included: string[]
  amenities: string[]
  restrictions?: string
  address: {
    street: string
    city: string
    state: string
    zip_code: string
    country: string
  }
}

type PropertyType = 'SINGLE_FAMILY' | 'APARTMENT' | 'CONDO' | 'TOWNHOUSE' | 'DUPLEX' | 'COMMERCIAL'
type PetPolicy = 'no_pets' | 'cats_allowed' | 'dogs_allowed' | 'all_pets_allowed'
type SmokingPolicy = 'no_smoking' | 'smoking_allowed' | 'designated_areas'

// Mock property service (in production this would be a real API service)
const propertyService = {
  getProperty: async (id: string) => {
    // Mock implementation
    return Promise.resolve({
      id,
      name: 'Sample Property',
      property_type: 'APARTMENT',
      monthly_rent: 1500,
      deposit_amount: 1500,
      description: 'Beautiful property with great amenities',
      year_built: 2015,
      square_footage: 1200,
      bedrooms: 2,
      bathrooms: 2,
      parking_spaces: 2,
      pet_policy: 'pets_allowed',
      smoking_policy: 'no_smoking',
      utilities_included: ['Water', 'Sewer'],
      amenities: ['Pool', 'Gym'],
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62701',
        country: 'USA'
      }
    })
  },
  createProperty: async (data: PropertyFormData) => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000))
    return Promise.resolve({ data: { id: '1' } })
  },
  updateProperty: async (id: string, data: PropertyFormData) => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000))
    return Promise.resolve({ data: { id } })
  },
  uploadImages: async (propertyId: string, images: File[]) => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000))
    return Promise.resolve()
  }
}

const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [newUtility, setNewUtility] = useState('')
  const [newAmenity, setNewAmenity] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<PropertyFormData>({
    defaultValues: {
      name: '',
      property_type: 'APARTMENT' as PropertyType,
      monthly_rent: 0,
      deposit_amount: 0,
      description: '',
      year_built: undefined,
      square_footage: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      parking_spaces: undefined,
      pet_policy: 'no_pets' as PetPolicy,
      smoking_policy: 'no_smoking' as SmokingPolicy,
      utilities_included: [],
      amenities: [],
      restrictions: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'USA'
      }
    }
  })

  const { data: property, isLoading: isPropertyLoading } = useQuery(
    ['property', id],
    () => propertyService.getProperty(id!),
    {
      enabled: !!id && isEditing,
    }
  )

  // Populate form when editing
  useEffect(() => {
    if (property && isEditing) {
      reset({
        name: property.name,
        property_type: property.property_type,
        monthly_rent: property.monthly_rent,
        deposit_amount: property.deposit_amount || 0,
        description: property.description || '',
        year_built: property.year_built,
        square_footage: property.square_footage,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parking_spaces: property.parking_spaces,
        pet_policy: property.pet_policy,
        smoking_policy: property.smoking_policy,
        utilities_included: property.utilities_included || [],
        amenities: property.amenities || [],
        restrictions: '',
        address: {
          street: property.address.street,
          city: property.address.city,
          state: property.address.state,
          zip_code: property.address.zip_code,
          country: property.address.country
        }
      })
    }
  }, [property, isEditing, reset])

  // Image upload handling
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      setSelectedImages(prev => [...prev, ...acceptedFiles])
    }
  })

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  // Add utility
  const addUtility = () => {
    if (newUtility.trim() && !watch('utilities_included').includes(newUtility.trim())) {
      setValue('utilities_included', [...watch('utilities_included'), newUtility.trim()])
      setNewUtility('')
    }
  }

  const removeUtility = (index: number) => {
    setValue('utilities_included', watch('utilities_included').filter((_, i) => i !== index))
  }

  // Add amenity
  const addAmenity = () => {
    if (newAmenity.trim() && !watch('amenities').includes(newAmenity.trim())) {
      setValue('amenities', [...watch('amenities'), newAmenity.trim()])
      setNewAmenity('')
    }
  }

  const removeAmenity = (index: number) => {
    setValue('amenities', watch('amenities').filter((_, i) => i !== index))
  }

  // Create/Update mutation
  const mutation = useMutation(
    async (data: PropertyFormData) => {
      if (isEditing) {
        return propertyService.updateProperty(id!, data)
      } else {
        return propertyService.createProperty(data)
      }
    },
    {
      onSuccess: (response) => {
        toast.success(isEditing ? 'Property updated successfully!' : 'Property created successfully!')
        queryClient.invalidateQueries(['properties'])
        
        // Upload images if any selected
        if (selectedImages.length > 0) {
          const propertyId = isEditing ? id : response.data.id
          propertyService.uploadImages(propertyId, selectedImages)
            .then(() => {
              toast.success('Images uploaded successfully!')
              queryClient.invalidateQueries(['property', propertyId])
            })
            .catch((error) => {
              toast.error('Property saved but image upload failed')
            })
        }
        
        navigate('/properties')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to save property')
      },
    }
  )

  const onSubmit = async (data: PropertyFormData) => {
    setIsSaving(true)
    try {
      await mutation.mutateAsync(data)
    } finally {
      setIsSaving(false)
    }
  }

  // Helper functions for form options
  const getPropertyTypeOptions = () => [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'CONDO', label: 'Condominium' },
    { value: 'TOWNHOUSE', label: 'Townhouse' },
    { value: 'SINGLE_FAMILY', label: 'Single Family' },
    { value: 'DUPLEX', label: 'Duplex' },
    { value: 'COMMERCIAL', label: 'Commercial' }
  ]

  const getPetPolicyOptions = () => [
    { value: 'no_pets', label: 'No Pets' },
    { value: 'cats_allowed', label: 'Cats Allowed' },
    { value: 'dogs_allowed', label: 'Dogs Allowed' },
    { value: 'all_pets_allowed', label: 'All Pets Allowed' }
  ]

  const getSmokingPolicyOptions = () => [
    { value: 'no_smoking', label: 'No Smoking' },
    { value: 'smoking_allowed', label: 'Smoking Allowed' },
    { value: 'designated_areas', label: 'Designated Smoking Areas' }
  ]

  const getBedroomOptions = () => [
    { value: '', label: 'Select' },
    { value: '0', label: 'Studio' },
    { value: '1', label: '1 Bedroom' },
    { value: '2', label: '2 Bedrooms' },
    { value: '3', label: '3 Bedrooms' },
    { value: '4', label: '4 Bedrooms' },
    { value: '5', label: '5+ Bedrooms' }
  ]

  const getBathroomOptions = () => [
    { value: '', label: 'Select' },
    { value: '1', label: '1 Bathroom' },
    { value: '1.5', label: '1.5 Bathrooms' },
    { value: '2', label: '2 Bathrooms' },
    { value: '2.5', label: '2.5 Bathrooms' },
    { value: '3', label: '3+ Bathrooms' }
  ]

  const getParkingOptions = () => [
    { value: '', label: 'Select' },
    { value: '0', label: 'No Parking' },
    { value: '1', label: '1 Space' },
    { value: '2', label: '2 Spaces' },
    { value: '3', label: '3+ Spaces' }
  ]

  if (isPropertyLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading property data...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-8">
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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Update property information' : 'Create a new property listing'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <Card.Header>
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            </div>
          </Card.Header>
          
          <Card.Content className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Property name is required' }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Property Name"
                    placeholder="e.g., Maple Street Apartments"
                    error={fieldState.error?.message}
                    leftIcon={<Building className="h-4 w-4" />}
                    required
                  />
                )}
              />

              <Controller
                name="property_type"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Property Type"
                    options={getPropertyTypeOptions()}
                    leftIcon={<Building className="h-4 w-4" />}
                    required
                  />
                )}
              />

              <Controller
                name="monthly_rent"
                control={control}
                rules={{ 
                  required: 'Monthly rent is required',
                  min: { value: 0, message: 'Rent must be positive' }
                }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Monthly Rent"
                    placeholder="1500.00"
                    error={fieldState.error?.message}
                    leftIcon={<DollarSign className="h-4 w-4" />}
                    right="$"
                    min="0"
                    step="0.01"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    required
                  />
                )}
              />

              <Controller
                name="deposit_amount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Security Deposit"
                    placeholder="1500.00"
                    leftIcon={<Shield className="h-4 w-4" />}
                    right="$"
                    min="0"
                    step="0.01"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
            </div>

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Description"
                  placeholder="Describe the property, its features, and anything tenants should know..."
                  type="textarea"
                  rows={4}
                  leftIcon={<FileText className="h-4 w-4" />}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Property Details */}
        <Card>
          <Card.Header>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
            </div>
          </Card.Header>
          
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Controller
                name="bedrooms"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Bedrooms"
                    options={getBedroomOptions()}
                    leftIcon={<BedDouble className="h-4 w-4" />}
                  />
                )}
              />

              <Controller
                name="bathrooms"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Bathrooms"
                    options={getBathroomOptions()}
                    leftIcon={<Bath className="h-4 w-4" />}
                  />
                )}
              />

              <Controller
                name="square_footage"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Square Footage"
                    placeholder="1200"
                    leftIcon={<Square className="h-4 w-4" />}
                    right="sq ft"
                    min="0"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                )}
              />

              <Controller
                name="year_built"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Year Built"
                    placeholder="1995"
                    leftIcon={<Calendar className="h-4 w-4" />}
                    min="1800"
                    max={new Date().getFullYear()}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                )}
              />

              <Controller
                name="parking_spaces"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Parking Spaces"
                    options={getParkingOptions()}
                    leftIcon={<Car className="h-4 w-4" />}
                  />
                )}
              />

              <Controller
                name="pet_policy"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Pet Policy"
                    options={getPetPolicyOptions()}
                    leftIcon={<Shield className="h-4 w-4" />}
                  />
                )}
              />

              <Controller
                name="smoking_policy"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Smoking Policy"
                    options={getSmokingPolicyOptions()}
                    leftIcon={<Shield className="h-4 w-4" />}
                  />
                )}
              />
            </div>
          </Card.Content>
        </Card>

        {/* Address */}
        <Card>
          <Card.Header>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Address</h2>
            </div>
          </Card.Header>
          
          <Card.Content className="space-y-6">
            <Controller
              name="address.street"
              control={control}
              rules={{ required: 'Street address is required' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Street Address"
                  placeholder="123 Main Street"
                  error={fieldState.error?.message}
                  leftIcon={<MapPin className="h-4 w-4" />}
                  required
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Controller
                name="address.city"
                control={control}
                rules={{ required: 'City is required' }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="City"
                    placeholder="Anytown"
                    error={fieldState.error?.message}
                    leftIcon={<MapPin className="h-4 w-4" />}
                    required
                  />
                )}
              />

              <Controller
                name="address.state"
                control={control}
                rules={{ required: 'State is required' }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="State"
                    placeholder="CA"
                    error={fieldState.error?.message}
                    leftIcon={<MapPin className="h-4 w-4" />}
                    maxLength={2}
                    required
                  />
                )}
              />

              <Controller
                name="address.zip_code"
                control={control}
                rules={{ required: 'ZIP code is required' }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="ZIP Code"
                    placeholder="12345"
                    error={fieldState.error?.message}
                    leftIcon={<MapPin className="h-4 w-4" />}
                    required
                  />
                )}
              />
            </div>
          </Card.Content>
        </Card>

        {/* Utilities and Amenities */}
        <Card>
          <Card.Header>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Utilities & Amenities</h2>
            </div>
          </Card.Header>
          
          <Card.Content>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Utilities Included */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Utilities Included
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      value={newUtility}
                      onChange={(e) => setNewUtility(e.target.value)}
                      placeholder="Add utility..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUtility())}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addUtility}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watch('utilities_included').map((utility, index) => (
                      <Badge
                        key={index}
                        variant="success"
                        className="cursor-pointer"
                        onClick={() => removeUtility(index)}
                      >
                        {utility}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Amenities
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Add amenity..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addAmenity}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watch('amenities').map((amenity, index) => (
                      <Badge
                        key={index}
                        variant="primary"
                        className="cursor-pointer"
                        onClick={() => removeAmenity(index)}
                      >
                        {amenity}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Image Upload */}
        <Card>
          <Card.Header>
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Property Images</h2>
            </div>
          </Card.Header>
          
          <Card.Content>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-3 text-sm text-gray-600">
                {isDragActive ? (
                  'Drop the files here...'
                ) : (
                  <>
                    Drag & drop property images here, or{' '}
                    <span className="text-blue-600 font-medium">browse</span>
                  </>
                )}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Supports JPEG, PNG, GIF, WebP up to 10MB each. Max 10 images.
              </p>
            </div>

            {selectedImages.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <p className="mt-2 text-xs text-gray-600 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            as={Link}
            to="/properties"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save className="h-4 w-4" />}
            loading={isSubmitting || isSaving}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PropertyForm