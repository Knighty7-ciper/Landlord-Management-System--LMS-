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
  Loader2,
  AlertCircle,
  Camera
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { propertyService } from '@/services/api'
import MainLayout from '@/components/layout/MainLayout'

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

interface PropertyFormProps {}

const PropertyForm: React.FC<PropertyFormProps> = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [newUtility, setNewUtility] = useState('')
  const [newAmenity, setNewAmenity] = useState('')
  const [saving, setSaving] = useState(false)

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
      property_type: 'SINGLE_FAMILY',
      monthly_rent: 0,
      deposit_amount: 0,
      description: '',
      year_built: undefined,
      square_footage: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      parking_spaces: undefined,
      pet_policy: 'no_pets',
      smoking_policy: 'no_smoking',
      utilities_included: [],
      amenities: [],
      restrictions: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'United States'
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
    setSaving(true)
    try {
      await mutation.mutateAsync(data)
    } finally {
      setSaving(false)
    }
  }

  if (isPropertyLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading property data...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/properties"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Properties
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Property' : 'Add New Property'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Name *
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Property name is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Maple Street Apartments"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <Controller
                    name="property_type"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="SINGLE_FAMILY">Single Family</option>
                        <option value="MULTI_FAMILY">Multi Family</option>
                        <option value="APARTMENT">Apartment</option>
                        <option value="CONDO">Condominium</option>
                        <option value="TOWNHOUSE">Townhouse</option>
                        <option value="COMMERCIAL">Commercial</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent ($) *
                  </label>
                  <Controller
                    name="monthly_rent"
                    control={control}
                    rules={{ 
                      required: 'Monthly rent is required',
                      min: { value: 0, message: 'Rent must be positive' }
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="1500.00"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                  {errors.monthly_rent && (
                    <p className="mt-1 text-sm text-red-600">{errors.monthly_rent.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Deposit ($)
                  </label>
                  <Controller
                    name="deposit_amount"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="1500.00"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Describe the property, its features, and anything tenants should know..."
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Property Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <Controller
                    name="bedrooms"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select</option>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <Controller
                    name="bathrooms"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select</option>
                        {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Square Footage
                  </label>
                  <Controller
                    name="square_footage"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="1200"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Built
                  </label>
                  <Controller
                    name="year_built"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="1995"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parking Spaces
                  </label>
                  <Controller
                    name="parking_spaces"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select</option>
                        {[0, 1, 2, 3, 4].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Policy
                  </label>
                  <Controller
                    name="pet_policy"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="no_pets">No Pets</option>
                        <option value="cats_allowed">Cats Allowed</option>
                        <option value="dogs_allowed">Dogs Allowed</option>
                        <option value="all_pets_allowed">All Pets Allowed</option>
                      </select>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Address</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <Controller
                    name="address.street"
                    control={control}
                    rules={{ required: 'Street address is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="123 Main Street"
                      />
                    )}
                  />
                  {errors.address?.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <Controller
                      name="address.city"
                      control={control}
                      rules={{ required: 'City is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Anytown"
                        />
                      )}
                    />
                    {errors.address?.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <Controller
                      name="address.state"
                      control={control}
                      rules={{ required: 'State is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          maxLength={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="CA"
                        />
                      )}
                    />
                    {errors.address?.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <Controller
                      name="address.zip_code"
                      control={control}
                      rules={{ required: 'ZIP code is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="12345"
                        />
                      )}
                    />
                    {errors.address?.zip_code && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.zip_code.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Utilities and Amenities */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Utilities & Amenities</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilities Included
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newUtility}
                        onChange={(e) => setNewUtility(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Add utility..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUtility())}
                      />
                      <button
                        type="button"
                        onClick={addUtility}
                        className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {watch('utilities_included').map((utility, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {utility}
                          <button
                            type="button"
                            onClick={() => removeUtility(index)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Add amenity..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      />
                      <button
                        type="button"
                        onClick={addAmenity}
                        className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {watch('amenities').map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeAmenity(index)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Property Images</h2>
            </div>
            <div className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary-400 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {isDragActive ? (
                    'Drop the files here...'
                  ) : (
                    <>
                      Drag & drop property images here, or{' '}
                      <span className="text-primary-600 font-medium">browse</span>
                    </>
                  )}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Supports JPEG, PNG, GIF, WebP up to 10MB each. Max 10 images.
                </p>
              </div>

              {selectedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      <p className="mt-1 text-xs text-gray-600 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/properties"
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || saving}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting || saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default PropertyForm