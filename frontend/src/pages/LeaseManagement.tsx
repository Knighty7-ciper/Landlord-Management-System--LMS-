import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { 
  FileText,
  Plus,
  Search as SearchIcon,
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
  Loader2,
  MailOpen,
  PhoneCall
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { Search } from '@/components/data/Search'
import { DataTable } from '@/components/data/DataTable'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ActionDropdown } from '@/components/layout/Dropdown'
import { ConfirmationModal } from '@/components/layout/Modal'

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

interface Lease {
  id: string
  tenant_name: string
  tenant_email: string
  property_name: string
  unit_number: string
  property_address: string
  start_date: string
  end_date: string
  monthly_rent: number
  deposit_amount: number
  status: 'active' | 'pending' | 'expired' | 'terminated' | 'draft'
  document_url: string | null
  signed_date: string | null
  renewal_option: boolean
  auto_renewal: boolean
  created_at: string
}

interface LeaseFilters {
  search: string
  status: string
  property: string
}

interface LeaseManagementProps {}

const LeaseManagement: React.FC<LeaseManagementProps> = () => {
  const [filters, setFilters] = useState<LeaseFilters>({
    search: '',
    status: 'all',
    property: 'all'
  })
  const [selectedLeases, setSelectedLeases] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [leaseToDelete, setLeaseToDelete] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lease | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' })

  // Get unique properties for filter
  const uniqueProperties = Array.from(new Set(mockLeases.map(lease => lease.property_name)))

  // Filter leases based on search and filters
  const filteredLeases = mockLeases.filter(lease => {
    const matchesSearch = 
      lease.tenant_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      lease.tenant_email.toLowerCase().includes(filters.search.toLowerCase()) ||
      lease.property_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      lease.unit_number.toLowerCase().includes(filters.search.toLowerCase())

    const matchesStatus = filters.status === 'all' || lease.status === filters.status
    const matchesProperty = filters.property === 'all' || lease.property_name === filters.property

    return matchesSearch && matchesStatus && matchesProperty
  })

  // Handle sorting
  const handleSort = (key: keyof Lease) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Get sorted and filtered leases
  const sortedLeases = [...filteredLeases].sort((a, b) => {
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
    if (selectedLeases.length === 0) {
      toast.error('Please select leases first')
      return
    }
    
    switch (action) {
      case 'delete':
        setShowDeleteModal(true)
        break
      case 'export':
        // Implement export functionality
        toast.success(`Exporting ${selectedLeases.length} leases`)
        setSelectedLeases([])
        break
      case 'renew':
        // Implement bulk renewal functionality
        toast.success(`Renewing ${selectedLeases.length} leases`)
        setSelectedLeases([])
        break
      default:
        break
    }
  }

  // Handle lease deletion
  const handleDeleteLease = () => {
    if (leaseToDelete) {
      // In real implementation, this would be an API call
      toast.success('Lease deleted successfully')
      setLeaseToDelete(null)
      setShowDeleteModal(false)
    }
  }

  // Handle bulk deletion
  const handleBulkDelete = () => {
    // In real implementation, this would be an API call
    toast.success(`${selectedLeases.length} leases deleted successfully`)
    setSelectedLeases([])
    setShowDeleteModal(false)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      property: 'all'
    })
    setSelectedLeases([])
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
      case 'draft':
        return 'info' as const
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
    { value: 'terminated', label: 'Terminated' },
    { value: 'draft', label: 'Draft' }
  ]

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lease Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage lease agreements, renewals, and documents
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedLeases.length > 0 && (
              <ActionDropdown
                trigger={
                  <Button variant="outline" size="sm">
                    Actions ({selectedLeases.length})
                  </Button>
                }
                items={[
                  { label: 'Export Selected', icon: FileDown, onClick: () => handleBulkAction('export') },
                  { label: 'Renew Selected', icon: RefreshCw, onClick: () => handleBulkAction('renew') },
                  { type: 'divider' },
                  { label: 'Delete Selected', icon: Trash2, onClick: () => handleBulkAction('delete'), variant: 'danger' }
                ]}
              />
            )}
            
            <Link to="/leases/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Lease
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
                  <FileText className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Leases</p>
                  <p className="text-2xl font-semibold text-gray-900">{mockLeases.length}</p>
                </div>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content className="p-6">
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
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content className="p-6">
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
                    ${mockLeases.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthly_rent, 0).toLocaleString()}
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
                placeholder="Search leases by tenant, property, or unit..."
                value={filters.search}
                onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                suggestions={mockLeases.flatMap(lease => [
                  lease.tenant_name,
                  lease.tenant_email,
                  lease.property_name
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

        {/* Leases Table */}
        <DataTable
          data={sortedLeases}
          columns={[
            {
              key: 'tenant',
              label: 'Tenant & Property',
              sortable: true,
              render: (lease: Lease) => (
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
              )
            },
            {
              key: 'lease_period',
              label: 'Lease Period',
              sortable: true,
              render: (lease: Lease) => (
                <div>
                  <div className="text-sm text-gray-900">
                    {formatDate(lease.start_date)}
                  </div>
                  <div className="text-sm text-gray-500">
                    to {formatDate(lease.end_date)}
                  </div>
                  {isLeaseExpired(lease.end_date) && (
                    <div className="text-xs text-red-600 mt-1 font-medium">
                      Expired
                    </div>
                  )}
                  {isLeaseExpiringSoon(lease.end_date) && !isLeaseExpired(lease.end_date) && (
                    <div className="text-xs text-yellow-600 mt-1 font-medium">
                      Expires soon
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'monthly_rent',
              label: 'Monthly Rent',
              sortable: true,
              render: (lease: Lease) => (
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    ${lease.monthly_rent.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Deposit: ${lease.deposit_amount.toLocaleString()}
                  </div>
                </div>
              )
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              render: (lease: Lease) => (
                <div className="flex flex-col gap-1">
                  <Badge variant={getStatusVariant(lease.status)}>
                    {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                  </Badge>
                  {lease.renewal_option && (
                    <span className="text-xs text-blue-600">
                      Renewal option
                    </span>
                  )}
                  {lease.auto_renewal && (
                    <span className="text-xs text-green-600">
                      Auto-renewal
                    </span>
                  )}
                </div>
              )
            },
            {
              key: 'document',
              label: 'Document',
              render: (lease: Lease) => (
                <div>
                  {lease.document_url ? (
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-500">
                        Signed {formatDate(lease.signed_date)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Not signed</span>
                  )}
                </div>
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (lease: Lease) => (
                <div className="flex items-center space-x-2">
                  <ActionDropdown
                    items={[
                      { label: 'View Details', icon: Eye, onClick: () => window.location.href = `/leases/${lease.id}` },
                      { label: 'Edit Lease', icon: Edit, onClick: () => window.location.href = `/leases/${lease.id}/edit` },
                      ...(lease.status === 'active' && isLeaseExpiringSoon(lease.end_date) ? [
                        { label: 'Renew Lease', icon: RefreshCw, onClick: () => window.location.href = `/leases/${lease.id}/renew` },
                        { type: 'divider' as const }
                      ] : [
                        { type: 'divider' as const }
                      ]),
                      { label: 'Send to Tenant', icon: MailOpen, onClick: () => window.location.href = `mailto:${lease.tenant_email}?subject=Lease Document - ${lease.tenant_name}` },
                      { label: 'Delete', icon: Trash2, onClick: () => { setLeaseToDelete(lease.id); setShowDeleteModal(true) }, variant: 'danger' }
                    ]}
                  />
                </div>
              )
            }
          ]}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable
          selectedItems={selectedLeases}
          onSelectionChange={setSelectedLeases}
          emptyState={{
            icon: FileText,
            title: 'No leases found',
            description: filters.search || filters.status !== 'all' || filters.property !== 'all' 
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first lease.',
            action: filters.search === '' && filters.status === 'all' && filters.property === 'all' ? {
              label: 'Create First Lease',
              icon: Plus,
              onClick: () => window.location.href = '/leases/new'
            } : undefined
          }}
          title={`Leases (${sortedLeases.length})`}
        />

        {/* Quick Actions Section */}
        <Card className="mt-6">
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </Card.Header>
          <Card.Content>
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
          </Card.Content>
        </Card>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setLeaseToDelete(null)
          }}
          onConfirm={leaseToDelete ? handleDeleteLease : handleBulkDelete}
          title={leaseToDelete ? 'Delete Lease' : 'Delete Selected Leases'}
          message={
            leaseToDelete 
              ? 'Are you sure you want to delete this lease? This action cannot be undone.'
              : `Are you sure you want to delete ${selectedLeases.length} selected leases? This action cannot be undone.`
          }
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </MainLayout>
  )
}

export default LeaseManagement