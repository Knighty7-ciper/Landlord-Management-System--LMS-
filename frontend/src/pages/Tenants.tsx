import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { 
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  MoreVertical,
  Loader2,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Building2
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

// Mock tenant data - in real implementation, this would come from API
const mockTenants = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    property_name: 'Maple Street Apartments',
    unit_number: '2A',
    lease_status: 'active',
    rent_amount: 1500,
    lease_start_date: '2024-01-01',
    lease_end_date: '2024-12-31',
    deposit_paid: true,
    created_at: '2023-12-01'
  },
  {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    property_name: 'Oak Park Condos',
    unit_number: '5B',
    lease_status: 'active',
    rent_amount: 1800,
    lease_start_date: '2024-03-01',
    lease_end_date: '2025-02-28',
    deposit_paid: true,
    created_at: '2024-02-01'
  },
  {
    id: '3',
    first_name: 'Mike',
    last_name: 'Johnson',
    email: 'mike.johnson@example.com',
    phone: '(555) 456-7890',
    property_name: 'Pine View Townhomes',
    unit_number: '',
    lease_status: 'expired',
    rent_amount: 2200,
    lease_start_date: '2023-06-01',
    lease_end_date: '2024-05-31',
    deposit_paid: true,
    created_at: '2023-05-01'
  },
  {
    id: '4',
    first_name: 'Sarah',
    last_name: 'Wilson',
    email: 'sarah.wilson@example.com',
    phone: '(555) 321-0987',
    property_name: 'Cedar Ridge Apartments',
    unit_number: '1C',
    lease_status: 'pending',
    rent_amount: 1650,
    lease_start_date: '2024-12-01',
    lease_end_date: '2025-11-30',
    deposit_paid: false,
    created_at: '2024-11-01'
  }
]

interface TenantsProps {}

const Tenants: React.FC<TenantsProps> = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique properties for filter
  const uniqueProperties = Array.from(new Set(mockTenants.map(tenant => tenant.property_name)))

  // Filter tenants based on search and filters
  const filteredTenants = mockTenants.filter(tenant => {
    const matchesSearch = 
      tenant.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.unit_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || tenant.lease_status === statusFilter
    const matchesProperty = propertyFilter === 'all' || tenant.property_name === propertyFilter

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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
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

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your tenants and their lease agreements
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
              to="/tenants/new"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Tenant
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tenants</p>
                <p className="text-2xl font-semibold text-gray-900">{mockTenants.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Leases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {mockTenants.filter(t => t.lease_status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {mockTenants.filter(t => isLeaseExpiringSoon(t.lease_end_date)).length}
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
                  ${mockTenants.filter(t => t.lease_status === 'active').reduce((sum, t) => sum + t.rent_amount, 0).toLocaleString()}
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
                    placeholder="Search tenants by name, email, or property..."
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

        {/* Tenants Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Tenants ({filteredTenants.length})
            </h2>
          </div>

          {filteredTenants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lease Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lease End
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-800">
                                {tenant.first_name[0]}{tenant.last_name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {tenant.first_name} {tenant.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Added {formatDate(tenant.created_at)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {tenant.property_name}
                            </div>
                            {tenant.unit_number && (
                              <div className="text-sm text-gray-500">
                                Unit {tenant.unit_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(tenant.lease_status)}`}>
                            {tenant.lease_status.charAt(0).toUpperCase() + tenant.lease_status.slice(1)}
                          </span>
                          {isLeaseExpiringSoon(tenant.lease_end_date) && (
                            <span className="text-xs text-yellow-600 mt-1">
                              Expires soon
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${tenant.rent_amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tenant.deposit_paid ? (
                            <span className="text-green-600">Deposit paid</span>
                          ) : (
                            <span className="text-red-600">Deposit pending</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(tenant.lease_end_date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Started {formatDate(tenant.lease_start_date)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <a
                            href={`mailto:${tenant.email}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                          <a
                            href={`tel:${tenant.phone}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/tenants/${tenant.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/tenants/${tenant.id}/edit`}
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
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || propertyFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by adding your first tenant.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && propertyFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    to="/tenants/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First Tenant
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default Tenants