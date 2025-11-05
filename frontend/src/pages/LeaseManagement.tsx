import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  Building2,
  Download,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileDown,
  Loader2
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

// Mock lease data
const mockLeases = [
  {
    id: '1',
    tenant_name: 'John Doe',
    tenant_email: 'john.doe@example.com',
    property_name: 'Maple Street Apartments',
    unit_number: '2A',
    property_address: '123 Maple Street, Anytown, CA 12345',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    monthly_rent: 1500,
    deposit_amount: 1500,
    status: 'active',
    document_url: '/documents/lease-1.pdf',
    signed_date: '2023-12-15',
    renewal_option: true,
    auto_renewal: false,
    created_at: '2023-12-01'
  },
  {
    id: '2',
    tenant_name: 'Jane Smith',
    tenant_email: 'jane.smith@example.com',
    property_name: 'Oak Park Condos',
    unit_number: '5B',
    property_address: '456 Oak Park Road, Anytown, CA 12345',
    start_date: '2024-03-01',
    end_date: '2025-02-28',
    monthly_rent: 1800,
    deposit_amount: 1800,
    status: 'active',
    document_url: '/documents/lease-2.pdf',
    signed_date: '2024-02-15',
    renewal_option: true,
    auto_renewal: true,
    created_at: '2024-02-01'
  },
  {
    id: '3',
    tenant_name: 'Mike Johnson',
    tenant_email: 'mike.johnson@example.com',
    property_name: 'Pine View Townhomes',
    unit_number: '',
    property_address: '789 Pine View Drive, Anytown, CA 12345',
    start_date: '2023-06-01',
    end_date: '2024-05-31',
    monthly_rent: 2200,
    deposit_amount: 2200,
    status: 'expired',
    document_url: '/documents/lease-3.pdf',
    signed_date: '2023-05-15',
    renewal_option: false,
    auto_renewal: false,
    created_at: '2023-05-01'
  },
  {
    id: '4',
    tenant_name: 'Sarah Wilson',
    tenant_email: 'sarah.wilson@example.com',
    property_name: 'Cedar Ridge Apartments',
    unit_number: '1C',
    property_address: '321 Cedar Ridge Ave, Anytown, CA 12345',
    start_date: '2024-12-01',
    end_date: '2025-11-30',
    monthly_rent: 1650,
    deposit_amount: 1650,
    status: 'pending',
    document_url: null,
    signed_date: null,
    renewal_option: true,
    auto_renewal: false,
    created_at: '2024-11-01'
  },
  {
    id: '5',
    tenant_name: 'Tom Anderson',
    tenant_email: 'tom.anderson@example.com',
    property_name: 'Maple Street Apartments',
    unit_number: '3A',
    property_address: '123 Maple Street, Anytown, CA 12345',
    start_date: '2024-01-15',
    end_date: '2025-01-14',
    monthly_rent: 1500,
    deposit_amount: 1500,
    status: 'terminated',
    document_url: '/documents/lease-5.pdf',
    signed_date: '2023-12-20',
    renewal_option: false,
    auto_renewal: false,
    created_at: '2023-12-10'
  }
]

interface LeaseManagementProps {}

const LeaseManagement: React.FC<LeaseManagementProps> = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique properties for filter
  const uniqueProperties = Array.from(new Set(mockLeases.map(lease => lease.property_name)))

  // Filter leases based on search and filters
  const filteredLeases = mockLeases.filter(lease => {
    const matchesSearch = 
      lease.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.tenant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.unit_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || lease.status === statusFilter
    const matchesProperty = propertyFilter === 'all' || lease.property_name === propertyFilter

    return matchesSearch && matchesStatus && matchesProperty
  })

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'terminated':
        return 'bg-gray-100 text-gray-800'
      case 'draft':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  // Check if lease is expiring soon (within 30 days)
  const isLeaseExpiringSoon = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  // Check if lease has expired
  const isLeaseExpired = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    return end < today
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lease Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage lease agreements, renewals, and documents
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
              to="/leases/new"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Lease
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Leases</p>
                <p className="text-2xl font-semibold text-gray-900">{mockLeases.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Leases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {mockLeases.filter(l => l.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {mockLeases.filter(l => l.status === 'active' && isLeaseExpiringSoon(l.end_date)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${mockLeases.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthly_rent, 0).toLocaleString()}
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
                    placeholder="Search leases by tenant, property, or unit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lease Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="expired">Expired</option>
                      <option value="terminated">Terminated</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property
                    </label>
                    <select
                      value={propertyFilter}
                      onChange={(e) => setPropertyFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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

        {/* Leases Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Leases ({filteredLeases.length})
            </h2>
          </div>

          {filteredLeases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant & Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lease Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Rent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-800">
                                {lease.tenant_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {lease.tenant_name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Building2 className="h-3 w-3 mr-1" />
                              {lease.property_name}
                              {lease.unit_number && ` - Unit ${lease.unit_number}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(lease.start_date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {formatDate(lease.end_date)}
                        </div>
                        {isLeaseExpired(lease.end_date) && (
                          <div className="text-xs text-red-600 mt-1">
                            Expired
                          </div>
                        )}
                        {isLeaseExpiringSoon(lease.end_date) && !isLeaseExpired(lease.end_date) && (
                          <div className="text-xs text-yellow-600 mt-1">
                            Expires soon
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${lease.monthly_rent.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Deposit: ${lease.deposit_amount.toLocaleString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(lease.status)}`}>
                            {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                          </span>
                          {lease.renewal_option && (
                            <span className="text-xs text-blue-600 mt-1">
                              Renewal option
                            </span>
                          )}
                          {lease.auto_renewal && (
                            <span className="text-xs text-green-600">
                              Auto-renewal
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lease.document_url ? (
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-800">
                              <Download className="h-4 w-4" />
                            </button>
                            <span className="text-sm text-gray-500">
                              Signed {formatDate(lease.signed_date)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not signed</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/leases/${lease.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/leases/${lease.id}/edit`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {lease.status === 'active' && isLeaseExpiringSoon(lease.end_date) && (
                            <Link
                              to={`/leases/${lease.id}/renew`}
                              className="text-green-600 hover:text-green-900"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Link>
                          )}
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
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leases found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || propertyFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first lease.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && propertyFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    to="/leases/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Lease
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/leases/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Create New Lease</p>
                <p className="text-xs text-gray-500">Generate a new lease agreement</p>
              </div>
            </Link>
            
            <Link
              to="/leases/bulk-renewal"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Bulk Renewal</p>
                <p className="text-xs text-gray-500">Renew multiple expiring leases</p>
              </div>
            </Link>
            
            <Link
              to="/reports/leases"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileDown className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Export Leases</p>
                <p className="text-xs text-gray-500">Download lease report</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default LeaseManagement