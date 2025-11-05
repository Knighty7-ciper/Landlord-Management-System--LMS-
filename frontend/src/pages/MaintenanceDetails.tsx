import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  ArrowLeft,
  Edit2,
  Save,
  Camera,
  Download,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  X,
  Loader2,
  MessageSquare,
  Upload,
  FileText,
  Building2,
  Wrench,
  MoreVertical,
  Star
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ActionDropdown } from '@/components/ui/ActionDropdown'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { Select } from '@/components/ui/Select'

// Mock maintenance request data
const mockMaintenanceRequest = {
  id: '1',
  title: 'Leaky faucet in kitchen',
  description: 'The kitchen faucet has been dripping constantly for the past week. Water is pooling under the sink and may cause damage to the cabinet and flooring.',
  property_name: 'Maple Street Apartments',
  unit_number: '2A',
  property_address: '123 Maple Street, Anytown, CA 12345',
  tenant_name: 'John Doe',
  tenant_email: 'john.doe@example.com',
  tenant_phone: '(555) 123-4567',
  category: 'plumbing',
  priority: 'medium',
  status: 'in_progress',
  assigned_to: 'ABC Plumbing Co.',
  assigned_contact: 'John Smith',
  assigned_phone: '(555) 987-6543',
  created_at: '2024-10-15T10:30:00Z',
  updated_at: '2024-10-17T14:20:00Z',
  completed_at: null,
  estimated_cost: 150,
  actual_cost: 85,
  access_instructions: 'Use front door key from lockbox at main entrance. Tenant will be available from 2-6 PM.',
  images: [
    { id: '1', url: '/images/maintenance-1-1.jpg', description: 'Initial leak from faucet' },
    { id: '2', url: '/images/maintenance-1-2.jpg', description: 'Water pooling under sink' }
  ],
  notes: [
    {
      id: '1',
      author: 'John Doe',
      content: 'The leak started about a week ago and seems to be getting worse.',
      created_at: '2024-10-15T10:30:00Z',
      type: 'tenant_note'
    },
    {
      id: '2',
      author: 'Property Manager',
      content: 'Scheduled plumber for tomorrow morning. Tenant notified via email.',
      created_at: '2024-10-16T09:00:00Z',
      type: 'staff_note'
    },
    {
      id: '3',
      author: 'John Smith (ABC Plumbing)',
      content: 'Arrived on site. Issue identified: worn O-ring connection. Fixed and tested. No additional issues found.',
      created_at: '2024-10-17T14:20:00Z',
      type: 'vendor_note'
    }
  ],
  timeline: [
    {
      id: '1',
      action: 'created',
      description: 'Maintenance request created',
      author: 'John Doe',
      created_at: '2024-10-15T10:30:00Z'
    },
    {
      id: '2',
      action: 'assigned',
      description: 'Assigned to ABC Plumbing Co.',
      author: 'Property Manager',
      created_at: '2024-10-16T09:00:00Z'
    },
    {
      id: '3',
      action: 'status_changed',
      description: 'Status changed to in progress',
      author: 'ABC Plumbing Co.',
      created_at: '2024-10-17T10:00:00Z'
    }
  ]
}

interface UpdateFormData {
  status: string
  priority: string
  assigned_to: string
  assigned_contact: string
  assigned_phone: string
  estimated_cost: number
  actual_cost?: number
  notes: string
}

interface MaintenanceDetailsProps {}

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  property_name: string
  unit_number: string
  property_address: string
  tenant_name: string
  tenant_email: string
  tenant_phone: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to: string | null
  assigned_contact: string | null
  assigned_phone: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  estimated_cost: number
  actual_cost: number | null
  access_instructions: string
  images: Array<{ id: string; url: string; description: string }>
  notes: Array<{
    id: string
    author: string
    content: string
    created_at: string
    type: string
  }>
  timeline: Array<{
    id: string
    action: string
    description: string
    author: string
    created_at: string
  }>
}

const MaintenanceDetails: React.FC<MaintenanceDetailsProps> = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [maintenanceRequest, setMaintenanceRequest] = useState<MaintenanceRequest>(mockMaintenanceRequest)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<UpdateFormData>({
    defaultValues: {
      status: mockMaintenanceRequest.status,
      priority: mockMaintenanceRequest.priority,
      assigned_to: mockMaintenanceRequest.assigned_to || '',
      assigned_contact: mockMaintenanceRequest.assigned_contact || '',
      assigned_phone: mockMaintenanceRequest.assigned_phone || '',
      estimated_cost: mockMaintenanceRequest.estimated_cost,
      actual_cost: mockMaintenanceRequest.actual_cost || 0,
      notes: ''
    }
  })

  const { data: request, isLoading } = useQuery(
    ['maintenance-request', id],
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockMaintenanceRequest
    },
    {
      enabled: !!id,
    }
  )

  // Update request mutation
  const updateMutation = useMutation(
    async (data: UpdateFormData) => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      return data
    },
    {
      onSuccess: () => {
        toast.success('Maintenance request updated successfully!')
        queryClient.invalidateQueries(['maintenance-request', id])
        setIsEditing(false)
        reset()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update maintenance request')
      },
    }
  )

  const onSubmit = async (data: UpdateFormData) => {
    await updateMutation.mutateAsync(data)
  }

  // File upload handling
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      setSelectedFiles(prev => [...prev, ...acceptedFiles])
    }
  })

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Add note
  const addNote = async () => {
    if (!newNote.trim()) return
    
    // In real implementation, this would be an API call
    toast.success('Note added successfully!')
    setNewNote('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading maintenance request...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!request) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Request Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The maintenance request you're looking for doesn't exist.
            </p>
            <div className="mt-6">
              <Link
                to="/maintenance"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Maintenance
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/maintenance"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Maintenance
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <Badge
                  variant={
                    request.status === 'completed' ? 'success' :
                    request.status === 'in_progress' ? 'default' :
                    request.status === 'pending' ? 'warning' :
                    request.status === 'scheduled' ? 'secondary' : 'destructive'
                  }
                >
                  {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                </Badge>
                <Badge
                  variant={
                    request.priority === 'urgent' ? 'destructive' :
                    request.priority === 'high' ? 'warning' :
                    request.priority === 'medium' ? 'default' : 'secondary'
                  }
                >
                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                </Badge>
                <span className="text-sm text-gray-500">#{request.id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Request'}
            </Button>
            
            <ActionDropdown
              actions={[
                { id: 'export', label: 'Export PDF', icon: Download },
                { id: 'duplicate', label: 'Duplicate Request', icon: Plus },
                { id: 'archive', label: 'Archive Request', icon: FileText },
                { id: 'delete', label: 'Delete Request', icon: XCircle, variant: 'destructive' }
              ]}
              onActionSelect={(action) => {
                if (action === 'delete') {
                  setShowDeleteModal(true)
                } else {
                  console.log(`${action} request:`, request.id)
                }
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <nav className="-mb-px flex">
              {[
                { id: 'overview', name: 'Overview', icon: FileText },
                { id: 'timeline', name: 'Timeline', icon: Clock },
                { id: 'photos', name: 'Photos & Documents', icon: Camera },
                { id: 'notes', name: 'Notes', icon: MessageSquare }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </CardHeader>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {isEditing ? (
                  /* Edit Form */
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <Controller
                          name="status"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select status"
                            >
                              <option value="pending">Pending</option>
                              <option value="scheduled">Scheduled</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </Select>
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <Controller
                          name="priority"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select priority"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </Select>
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assigned To
                        </label>
                        <Controller
                          name="assigned_to"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Company or contractor name"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Person
                        </label>
                        <Controller
                          name="assigned_contact"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Contact person name"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Phone
                        </label>
                        <Controller
                          name="assigned_phone"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="tel"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="(555) 123-4567"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Cost ($)
                        </label>
                        <Controller
                          name="estimated_cost"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Actual Cost ($)
                        </label>
                        <Controller
                          name="actual_cost"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* View Mode */
                  <div className="space-y-6">
                    {/* Request Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Request Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{request.description}</p>
                      </CardContent>
                    </Card>

                    {/* Property Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Property Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-start">
                            <Building2 className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.property_name}</p>
                              <p className="text-sm text-gray-600">Unit {request.unit_number}</p>
                              <p className="text-sm text-gray-500 mt-1 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {request.property_address}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Tenant Information</p>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-2" />
                                {request.tenant_name}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-2" />
                                <a href={`mailto:${request.tenant_email}`} className="text-primary-600 hover:text-primary-800">
                                  {request.tenant_email}
                                </a>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-2" />
                                <a href={`tel:${request.tenant_phone}`} className="text-primary-600 hover:text-primary-800">
                                  {request.tenant_phone}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Assignment & Cost */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Assignment & Cost</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            {request.assigned_to ? (
                              <div>
                                <p className="text-sm font-medium text-gray-900">Assigned To</p>
                                <p className="text-sm text-gray-600">{request.assigned_to}</p>
                                {request.assigned_contact && (
                                  <p className="text-sm text-gray-600">Contact: {request.assigned_contact}</p>
                                )}
                                {request.assigned_phone && (
                                  <p className="text-sm text-gray-600">
                                    Phone: <a href={`tel:${request.assigned_phone}`} className="text-primary-600 hover:text-primary-800">
                                      {request.assigned_phone}
                                    </a>
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Not assigned yet</p>
                            )}
                          </div>

                          <div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Estimated Cost</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {formatCurrency(request.estimated_cost)}
                                </span>
                              </div>
                              {request.actual_cost && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Actual Cost</span>
                                  <span className="text-sm font-medium text-green-600">
                                    {formatCurrency(request.actual_cost)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Access Instructions */}
                    {request.access_instructions && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Access Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">{request.access_instructions}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Timeline Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {request.timeline.map((event) => (
                            <div key={event.id} className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                  <Clock className="h-4 w-4 text-primary-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{event.description}</p>
                                <p className="text-sm text-gray-500">by {event.author} • {formatDate(event.created_at)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {request.timeline.map((event, index) => (
                      <div key={event.id} className="relative">
                        {index !== request.timeline.length - 1 && (
                          <div className="absolute left-4 top-8 w-px h-full bg-gray-200"></div>
                        )}
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              {event.action === 'created' && <Plus className="h-4 w-4 text-primary-600" />}
                              {event.action === 'assigned' && <User className="h-4 w-4 text-primary-600" />}
                              {event.action === 'status_changed' && <Edit2 className="h-4 w-4 text-primary-600" />}
                              {event.action === 'completed' && <CheckCircle className="h-4 w-4 text-primary-600" />}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pb-6">
                            <p className="text-sm font-medium text-gray-900">{event.description}</p>
                            <p className="text-sm text-gray-500">
                              by {event.author} on {formatDate(event.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photos & Documents Tab */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Photos & Documents</h3>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setSelectedFiles(prev => [...prev, ...files])
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-primary-400 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Camera className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    {isDragActive ? (
                      'Drop the files here...'
                    ) : (
                      'Drag & drop files here, or click to browse'
                    )}
                  </p>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Files</h4>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing Images */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Existing Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {request.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.description}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <button className="text-white hover:text-gray-200">
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-600">{image.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Notes & Comments</h3>
                
                {/* Add Note */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Note</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-3">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Add a note or comment..."
                      />
                      <Button
                        onClick={addNote}
                        disabled={!newNote.trim()}
                      >
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes List */}
                <div className="space-y-4">
                  {request.notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {note.author.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{note.author}</p>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    note.type === 'tenant_note' ? 'default' :
                                    note.type === 'vendor_note' ? 'success' : 'secondary'
                                  }
                                >
                                  {note.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                                <span className="text-xs text-gray-500">{formatDate(note.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{note.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            toast.success('Maintenance request deleted successfully!')
            navigate('/maintenance')
          }}
          title="Delete Maintenance Request"
          message="Are you sure you want to delete this maintenance request? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </MainLayout>
  )
}

export default MaintenanceDetails