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
  Loader2
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

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

const MaintenanceRequests: React.FC<MaintenanceRequestsProps> = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique values for filters
  const uniqueProperties = Array.from(new Set(mockMaintenanceRequests.map(req => req.property_name)))
  const categories = Array.from(new Set(mockMaintenanceRequests.map(req => req.category)))

  // Filter requests based on search and filters
  const filteredRequests = mockMaintenanceRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.unit_number && request.unit_number.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter
    const matchesProperty = propertyFilter === 'all' || request.property_name === propertyFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesProperty
  })

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-gray-100 text-gray-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <Link
              to="/maintenance/new"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wrench className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{mockMaintenanceRequests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {mockMaintenanceRequests.filter(r => ['pending', 'scheduled'].includes(r.status)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Timer className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {mockMaintenanceRequests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cost</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${mockMaintenanceRequests.reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, description, tenant, or property..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property
                    </label>
                    <select
                      value={propertyFilter}
                      onChange={(e) => setPropertyFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="all">All Properties</option>
                      {uniqueProperties.map(property => (
                        <option key={property} value={property}>{property}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setPriorityFilter('all')
                        setCategoryFilter('all')
                        setPropertyFilter('all')
                      }}
                      className="w-full px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Requests ({filteredRequests.length})
            </h2>
          </div>

          {filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property & Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {request.title}
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
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(request.priority)}`}>
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                          </span>
                          <br />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                            {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.actual_cost ? (
                            <span className="font-medium">${request.actual_cost.toLocaleString()}</span>
                          ) : (
                            <span>Est. ${request.estimated_cost.toLocaleString()}</span>
                          )}
                        </div>
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
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Created {formatDate(request.created_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getDaysSinceCreated(request.created_at)} days ago
                        </div>
                        {request.completed_at && (
                          <div className="text-xs text-green-600 mt-1">
                            Completed {formatDate(request.completed_at)}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/maintenance/${request.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/maintenance/${request.id}/edit`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wrench className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || propertyFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first maintenance request.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && categoryFilter === 'all' && propertyFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    to="/maintenance/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Request
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Resolution Time</h3>
            <p className="text-2xl font-semibold text-gray-900">4.2 days</p>
            <p className="text-sm text-green-600 mt-1">↓ 15% from last month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">High Priority Requests</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {mockMaintenanceRequests.filter(r => ['high', 'urgent'].includes(r.priority) && !['completed', 'cancelled'].includes(r.status)).length}
            </p>
            <p className="text-sm text-red-600 mt-1">Requires attention</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">This Month's Cost</h3>
            <p className="text-2xl font-semibold text-gray-900">
              ${mockMaintenanceRequests
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
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default MaintenanceRequests