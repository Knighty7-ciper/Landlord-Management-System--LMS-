import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { 
  Users,
  Plus,
  Search as SearchIcon,
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
  Building2,
  MailOpen,
  PhoneCall,
  CalendarDays,
  User
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { Search } from '@/components/data/Search'
import { DataTable } from '@/components/data/DataTable'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ActionDropdown } from '@/components/layout/Dropdown'
import { ConfirmationModal } from '@/components/layout/Modal'

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

interface Tenant {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  property_name: string
  unit_number: string
  lease_status: 'active' | 'pending' | 'expired' | 'terminated'
  rent_amount: number
  lease_start_date: string
  lease_end_date: string
  deposit_paid: boolean
  created_at: string
}

interface TenantFilters {
  search: string
  status: string
  property: string
}

interface TenantsProps {}

const Tenants: React.FC<TenantsProps> = () => {
  const [filters, setFilters] = useState<TenantFilters>({
    search: '',
    status: 'all',
    property: 'all'
  })
  const [selectedTenants, setSelectedTenants] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Tenant | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' })

  // Get unique properties for filter
  const uniqueProperties = Array.from(new Set(mockTenants.map(tenant => tenant.property_name)))

  // Filter tenants based on search and filters
  const filteredTenants = mockTenants.filter(tenant => {
    const matchesSearch = 
      tenant.first_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      tenant.last_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      tenant.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      tenant.property_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      tenant.unit_number.toLowerCase().includes(filters.search.toLowerCase())

    const matchesStatus = filters.status === 'all' || tenant.lease_status === filters.status
    const matchesProperty = filters.property === 'all' || tenant.property_name === filters.property

    return matchesSearch && matchesStatus && matchesProperty
  })

  // Handle sorting
  const handleSort = (key: keyof Tenant) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Get sorted and filtered tenants
  const sortedTenants = [...filteredTenants].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedTenants.length === 0) {
      toast.error('Please select tenants first')
      return
    }
    
    switch (action) {
      case 'delete':
        setShowDeleteModal(true)
        break
      case 'export':
        // Implement export functionality
        toast.success(`Exporting ${selectedTenants.length} tenants`)
        setSelectedTenants([])
        break
      default:
        break
    }
  }

  // Handle tenant deletion
  const handleDeleteTenant = () => {
    if (tenantToDelete) {
      // In real implementation, this would be an API call
      toast.success('Tenant deleted successfully')
      setTenantToDelete(null)
      setShowDeleteModal(false)
    }
  }

  // Handle bulk deletion
  const handleBulkDelete = () => {
    // In real implementation, this would be an API call
    toast.success(`${selectedTenants.length} tenants deleted successfully`)
    setSelectedTenants([])
    setShowDeleteModal(false)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      property: 'all'
    })
    setSelectedTenants([])
  }

  // Status badge variants
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success' as const
      case 'pending':
        return 'warning' as const
      case 'expired':
        return 'danger' as const
      case 'terminated':
        return 'secondary' as const
      default:
        return 'secondary' as const
    }
  }

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'expired', label: 'Expired' },
    { value: 'terminated', label: 'Terminated' }
  ]

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your tenants and their lease agreements
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedTenants.length > 0 && (
              <ActionDropdown
                trigger={
                  <Button variant="outline" size="sm">
                    Actions ({selectedTenants.length})
                  </Button>
                }
                items={[
                  { label: 'Export Selected', icon: FileText, onClick: () => handleBulkAction('export') },
                  { type: 'divider' },
                  { label: 'Delete Selected', icon: Trash2, onClick: () => handleBulkAction('delete'), variant: 'danger' }
                ]}
              />
            )}
            
            <Link to="/tenants/new">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Tenant
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <Card.Content className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Tenants</p>
                  <p className="text-2xl font-semibold text-gray-900">{mockTenants.length}</p>
                </div>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content className="p-6">
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
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content className="p-6">
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
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content className="p-6">
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
            </Card.Content>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <Card.Content className="p-6">
            <div className="flex flex-col gap-4">
              <Search
                placeholder="Search tenants by name, email, or property..."
                value={filters.search}
                onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                suggestions={mockTenants.flatMap(tenant => [
                  `${tenant.first_name} ${tenant.last_name}`,
                  tenant.email,
                  tenant.property_name
                ])}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property
                  </label>
                  <select
                    value={filters.property}
                    onChange={(e) => setFilters(prev => ({ ...prev, property: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Properties</option>
                    {uniqueProperties.map(property => (
                      <option key={property} value={property}>{property}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Tenants Table */}
        <DataTable
          data={sortedTenants}
          columns={[
            {
              key: 'tenant',
              label: 'Tenant',
              sortable: true,
              render: (tenant: Tenant) => (
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
              )
            },
            {
              key: 'property',
              label: 'Property',
              sortable: true,
              render: (tenant: Tenant) => (
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
              )
            },
            {
              key: 'lease_status',
              label: 'Status',
              sortable: true,
              render: (tenant: Tenant) => (
                <div className="flex flex-col gap-1">
                  <Badge variant={getStatusVariant(tenant.lease_status)}>
                    {tenant.lease_status.charAt(0).toUpperCase() + tenant.lease_status.slice(1)}
                  </Badge>
                  {isLeaseExpiringSoon(tenant.lease_end_date) && (
                    <span className="text-xs text-yellow-600">
                      Expires soon
                    </span>
                  )}
                </div>
              )
            },
            {
              key: 'rent_amount',
              label: 'Rent',
              sortable: true,
              render: (tenant: Tenant) => (
                <div>
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
                </div>
              )
            },
            {
              key: 'lease_end_date',
              label: 'Lease End',
              sortable: true,
              render: (tenant: Tenant) => (
                <div>
                  <div className="text-sm text-gray-900">
                    {formatDate(tenant.lease_end_date)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Started {formatDate(tenant.lease_start_date)}
                  </div>
                </div>
              )
            },
            {
              key: 'contact',
              label: 'Contact',
              render: (tenant: Tenant) => (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`mailto:${tenant.email}`}>
                      <MailOpen className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`tel:${tenant.phone}`}>
                      <PhoneCall className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (tenant: Tenant) => (
                <ActionDropdown
                  items={[
                    { label: 'View Details', icon: Eye, onClick: () => window.location.href = `/tenants/${tenant.id}` },
                    { label: 'Edit', icon: Edit, onClick: () => window.location.href = `/tenants/${tenant.id}/edit` },
                    { type: 'divider' },
                    { label: 'Delete', icon: Trash2, onClick: () => { setTenantToDelete(tenant.id); setShowDeleteModal(true) }, variant: 'danger' }
                  ]}
                />
              )
            }
          ]}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable
          selectedItems={selectedTenants}
          onSelectionChange={setSelectedTenants}
          emptyState={{
            icon: User,
            title: 'No tenants found',
            description: filters.search || filters.status !== 'all' || filters.property !== 'all' 
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding your first tenant.',
            action: filters.search === '' && filters.status === 'all' && filters.property === 'all' ? {
              label: 'Add First Tenant',
              icon: UserPlus,
              onClick: () => window.location.href = '/tenants/new'
            } : undefined
          }}
          title={`Tenants (${sortedTenants.length})`}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setTenantToDelete(null)
          }}
          onConfirm={tenantToDelete ? handleDeleteTenant : handleBulkDelete}
          title={tenantToDelete ? 'Delete Tenant' : 'Delete Selected Tenants'}
          message={
            tenantToDelete 
              ? 'Are you sure you want to delete this tenant? This action cannot be undone.'
              : `Are you sure you want to delete ${selectedTenants.length} selected tenants? This action cannot be undone.`
          }
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </MainLayout>
  )
}

export default Tenants