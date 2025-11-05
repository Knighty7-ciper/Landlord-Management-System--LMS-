import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { 
  Wrench,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Camera,
  Phone,
  Mail,
  Timer,
  TrendingUp,
  Loader2,
  MoreVertical,
  Send,
  CheckSquare,
  Square,
  Download
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ActionDropdown } from '@/components/ui/ActionDropdown'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { SearchInput } from '@/components/ui/Search'
import { DataTable } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Select'

// Mock maintenance requests data
const mockMaintenanceRequests = [
  {
    id: '1',
    title: 'Leaky faucet in kitchen',
    description: 'The kitchen faucet has been dripping constantly for the past week. Water is pooling under the sink and may cause damage.',
    property_name: 'Maple Street Apartments',
    unit_number: '2A',
    property_address: '123 Maple Street, Anytown, CA 12345',
    tenant_name: 'John Doe',
    tenant_email: 'john.doe@example.com',
    tenant_phone: '(555) 123-4567',
    category: 'plumbing',
    priority: 'medium',
    status: 'completed',
    assigned_to: 'ABC Plumbing Co.',
    assigned_contact: 'John Smith',
    created_at: '2024-10-15',
    updated_at: '2024-10-17',
    completed_at: '2024-10-17',
    estimated_cost: 150,
    actual_cost: 85,
    images: ['/images/maintenance-1-1.jpg', '/images/maintenance-1-2.jpg'],
    access_instructions: 'Use front door key from lockbox at main entrance',
    notes: 'Fixed loose O-ring connection. No additional issues found.',
    vendor_rating: 5
  },
  {
    id: '2',
    title: 'AC not cooling properly',
    description: 'Air conditioning system is running but not cooling effectively. Temperature remains high even when set to 70°F.',
    property_name: 'Oak Park Condos',
    unit_number: '5B',
    property_address: '456 Oak Park Road, Anytown, CA 12345',
    tenant_name: 'Jane Smith',
    tenant_email: 'jane.smith@example.com',
    tenant_phone: '(555) 987-6543',
    category: 'hvac',
    priority: 'high',
    status: 'in_progress',
    assigned_to: 'Cool Air HVAC',
    assigned_contact: 'Mike Johnson',
    created_at: '2024-11-01',
    updated_at: '2024-11-02',
    completed_at: null,
    estimated_cost: 300,
    actual_cost: null,
    images: [],
    access_instructions: 'Unit has smart lock - code will be provided',
    notes: 'Technician diagnosed low refrigerant. Part ordered.',
    vendor_rating: null
  },
  {
    id: '3',
    title: 'Broken window in living room',
    description: 'Large crack in living room window. Appears to be from thermal stress. Requires immediate attention for weatherproofing.',
    property_name: 'Pine View Townhomes',
    unit_number: '',
    property_address: '789 Pine View Drive, Anytown, CA 12345',
    tenant_name: 'Mike Johnson',
    tenant_email: 'mike.johnson@example.com',
    tenant_phone: '(555) 456-7890',
    category: 'structural',
    priority: 'urgent',
    status: 'pending',
    assigned_to: null,
    assigned_contact: null,
    created_at: '2024-11-02',
    updated_at: '2024-11-02',
    completed_at: null,
    estimated_cost: 400,
    actual_cost: null,
    images: ['/images/maintenance-3-1.jpg'],
    access_instructions: 'Tenant will be home',
    notes: '',
    vendor_rating: null
  },
  {
    id: '4',
    title: 'Light bulb replacement',
    description: 'Several light bulbs in hallway and bedroom have burned out.',
    property_name: 'Cedar Ridge Apartments',
    unit_number: '1C',
    property_address: '321 Cedar Ridge Ave, Anytown, CA 12345',
    tenant_name: 'Sarah Wilson',
    tenant_email: 'sarah.wilson@example.com',
    tenant_phone: '(555) 321-0987',
    category: 'electrical',
    priority: 'low',
    status: 'scheduled',
    assigned_to: 'Handy Man Services',
    assigned_contact: 'Bob Wilson',
    created_at: '2024-10-28',
    updated_at: '2024-10-29',
    completed_at: null,
    estimated_cost: 50,
    actual_cost: null,
    images: [],
    access_instructions: 'Maintenance key available in office',
    notes: 'Scheduled for next week',
    vendor_rating: null
  },
  {
    id: '5',
    title: 'Garage door malfunction',
    description: 'Garage door opener is making loud grinding noises and door doesn\'t fully close.',
    property_name: 'Maple Street Apartments',
    unit_number: '2A',
    property_address: '123 Maple Street, Anytown, CA 12345',
    tenant_name: 'John Doe',
    tenant_email: 'john.doe@example.com',
    tenant_phone: '(555) 123-4567',
    category: 'mechanical',
    priority: 'medium',
    status: 'cancelled',
    assigned_to: null,
    assigned_contact: null,
    created_at: '2024-10-20',
    updated_at: '2024-10-22',
    completed_at: null,
    estimated_cost: 200,
    actual_cost: null,
    images: [],
    access_instructions: 'Tenant resolved issue themselves',
    notes: 'Tenant purchased new garage door remote and issue resolved',
    vendor_rating: null
  }
]

interface MaintenanceRequestsProps {}

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
  created_at: string
  updated_at: string
  completed_at: string | null
  estimated_cost: number
  actual_cost: number | null
  images: string[]
  access_instructions: string
  notes: string
  vendor_rating: number | null
}

interface MaintenanceFilters {
  search: string
  status: string
  priority: string
  category: string
  property: string
}

interface MaintenanceSortConfig {
  key: keyof MaintenanceRequest | null
  direction: 'asc' | 'desc'
}

const MaintenanceRequests: React.FC<MaintenanceRequestsProps> = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(mockMaintenanceRequests)
  const [filters, setFilters] = useState<MaintenanceFilters>({
    search: '',
    status: '',
    priority: '',
    category: '',
    property: ''
  })
  const [sortConfig, setSortConfig] = useState<MaintenanceSortConfig>({ key: null, direction: 'asc' })
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Get unique values for filters
  const uniqueProperties = Array.from(new Set(mockMaintenanceRequests.map(req => req.property_name)))
  const categories = Array.from(new Set(mockMaintenanceRequests.map(req => req.category)))

  // Filter and sort requests
  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.tenant_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.property_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (request.unit_number && request.unit_number.toLowerCase().includes(filters.search.toLowerCase()))

    const matchesStatus = !filters.status || request.status === filters.status
    const matchesPriority = !filters.priority || request.priority === filters.priority
    const matchesCategory = !filters.category || request.category === filters.category
    const matchesProperty = !filters.property || request.property_name === filters.property

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesProperty
  })

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (!sortConfig.key) return 0
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRequests = sortedRequests.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (key: keyof MaintenanceRequest) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleSelectRequest = (id: string) => {
    setSelectedRequests(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedRequests.length === paginatedRequests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(paginatedRequests.map(r => r.id))
    }
  }

  const handleDeleteRequest = (id: string) => {
    setRequestToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (requestToDelete) {
      setMaintenanceRequests(prev => prev.filter(r => r.id !== requestToDelete))
      setShowDeleteModal(false)
      setRequestToDelete(null)
    }
  }

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'export':
        console.log('Exporting requests:', selectedRequests)
        break
      case 'delete':
        setMaintenanceRequests(prev => prev.filter(r => !selectedRequests.includes(r.id)))
        setSelectedRequests([])
        break
      case 'mark_completed':
        setMaintenanceRequests(prev => prev.map(r => 
          selectedRequests.includes(r.id) ? { ...r, status: 'completed' as const } : r
        ))
        setSelectedRequests([])
        break
      case 'assign_vendor':
        console.log('Assigning vendor to requests:', selectedRequests)
        break
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate days since created
  const getDaysSinceCreated = (createdAt: string) => {
    const today = new Date()
    const created = new Date(createdAt)
    const diffTime = Math.abs(today.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track and manage property maintenance and repairs
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="inline-flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <Link to="/maintenance/new">
              <Button className="inline-flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wrench className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Requests</p>
                  <p className="text-2xl font-semibold text-gray-900">{maintenanceRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {maintenanceRequests.filter(r => ['pending', 'scheduled'].includes(r.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Timer className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {maintenanceRequests.filter(r => r.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Cost</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${maintenanceRequests.reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <SearchInput
                placeholder="Search by title, description, tenant, or property..."
                value={filters.search}
                onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                className="w-full"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  placeholder="Status"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>

                <Select
                  value={filters.priority}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
                  placeholder="Priority"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>

                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  placeholder="Category"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      search: '',
                      status: '',
                      priority: '',
                      category: '',
                      property: ''
                    })
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Requests DataTable */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Maintenance Requests ({filteredRequests.length})</CardTitle>
              {selectedRequests.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedRequests.length} selected
                  </span>
                  <ActionDropdown
                    actions={[
                      { id: 'assign_vendor', label: 'Assign Vendor', icon: User },
                      { id: 'export', label: 'Export Selected', icon: Download },
                      { id: 'mark_completed', label: 'Mark as Completed', icon: CheckCircle },
                      { id: 'delete', label: 'Delete Selected', icon: Trash2, variant: 'destructive' }
                    ]}
                    onActionSelect={handleBulkAction}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredRequests.length > 0 ? (
              <DataTable
                data={paginatedRequests}
                columns={[
                  {
                    key: 'checkbox',
                    header: (
                      <input
                        type="checkbox"
                        checked={selectedRequests.length === paginatedRequests.length && paginatedRequests.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    ),
                    render: (request: MaintenanceRequest) => (
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => handleSelectRequest(request.id)}
                        className="rounded border-gray-300"
                      />
                    )
                  },
                  {
                    key: 'request',
                    header: 'Request Details',
                    sortable: true,
                    render: (request: MaintenanceRequest) => (
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <Link to={`/maintenance/${request.id}`} className="hover:text-primary-600">
                            {request.title}
                          </Link>
                          {request.images.length > 0 && (
                            <Camera className="h-4 w-4 text-gray-400 ml-2" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {request.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 capitalize">
                          {request.category} • #{request.id}
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'property',
                    header: 'Property & Tenant',
                    sortable: true,
                    render: (request: MaintenanceRequest) => (
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-1" />
                          {request.property_name}
                          {request.unit_number && ` - ${request.unit_number}`}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <div className="flex items-center">
                            <User className="h-3 w-3 text-gray-400 mr-1" />
                            {request.tenant_name}
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-1">
                          <a href={`mailto:${request.tenant_email}`} className="text-primary-600 hover:text-primary-800">
                            <Mail className="h-3 w-3" />
                          </a>
                          <a href={`tel:${request.tenant_phone}`} className="text-primary-600 hover:text-primary-800">
                            <Phone className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'priority_status',
                    header: 'Priority & Status',
                    render: (request: MaintenanceRequest) => (
                      <div className="space-y-2">
                        <Badge
                          variant={
                            request.priority === 'urgent' ? 'destructive' :
                            request.priority === 'high' ? 'warning' :
                            request.priority === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </Badge>
                        <br />
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
                      </div>
                    )
                  },
                  {
                    key: 'cost',
                    header: 'Cost',
                    sortable: true,
                    render: (request: MaintenanceRequest) => (
                      <div className="text-sm text-gray-900">
                        {request.actual_cost ? (
                          <span className="font-medium">${request.actual_cost.toLocaleString()}</span>
                        ) : (
                          <span>Est. ${request.estimated_cost.toLocaleString()}</span>
                        )}
                        {request.assigned_to && (
                          <div className="text-xs text-gray-500 mt-1">
                            {request.assigned_to}
                            {request.vendor_rating && (
                              <span className="ml-1">
                                ⭐ {request.vendor_rating}/5
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'timeline',
                    header: 'Timeline',
                    sortable: true,
                    render: (request: MaintenanceRequest) => (
                      <div className="text-sm text-gray-900">
                        <div>Created {formatDate(request.created_at)}</div>
                        <div className="text-xs text-gray-500">
                          {getDaysSinceCreated(request.created_at)} days ago
                        </div>
                        {request.completed_at && (
                          <div className="text-xs text-green-600 mt-1">
                            Completed {formatDate(request.completed_at)}
                          </div>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (request: MaintenanceRequest) => (
                      <ActionDropdown
                        actions={[
                          { id: 'view', label: 'View Details', icon: Eye },
                          { id: 'edit', label: 'Edit Request', icon: Edit },
                          { id: 'assign', label: 'Assign Vendor', icon: User },
                          { id: 'contact_tenant', label: 'Contact Tenant', icon: Phone },
                          { id: 'delete', label: 'Delete Request', icon: Trash2, variant: 'destructive' }
                        ]}
                        onActionSelect={(action) => {
                          if (action === 'delete') {
                            handleDeleteRequest(request.id)
                          } else {
                            console.log(`${action} request:`, request.id)
                          }
                        }}
                      />
                    )
                  }
                ]}
                onSort={handleSort}
                sortConfig={sortConfig}
                pagination={{
                  currentPage,
                  totalPages,
                  onPageChange: setCurrentPage,
                  itemsPerPage,
                  onItemsPerPageChange: setItemsPerPage,
                  totalItems: sortedRequests.length
                }}
              />
            ) : (
              <div className="text-center py-12">
                <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance requests found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filters.search || filters.status || filters.priority || filters.category || filters.property
                    ? 'Try adjusting your search or filters.'
                    : 'Get started by creating your first maintenance request.'
                  }
                </p>
                {!filters.search && !filters.status && !filters.priority && !filters.category && !filters.property && (
                  <div className="mt-6">
                    <Link to="/maintenance/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Request
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Average Resolution Time</h3>
              <p className="text-2xl font-semibold text-gray-900">4.2 days</p>
              <p className="text-sm text-green-600 mt-1">↓ 15% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">High Priority Requests</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {maintenanceRequests.filter(r => ['high', 'urgent'].includes(r.priority) && !['completed', 'cancelled'].includes(r.status)).length}
              </p>
              <p className="text-sm text-red-600 mt-1">Requires attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">This Month's Cost</h3>
              <p className="text-2xl font-semibold text-gray-900">
                ${maintenanceRequests
                  .filter(r => {
                    const created = new Date(r.created_at)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  })
                  .reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost), 0)
                  .toLocaleString()
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">vs $850 last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Maintenance Request"
          message="Are you sure you want to delete this maintenance request? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </MainLayout>
  )
}

export default MaintenanceRequests