import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { 
  ArrowLeft,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  User,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Download,
  MessageSquare,
  Loader2
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

// Mock tenant data
const mockTenant = {
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  date_of_birth: '1990-05-15',
  ssn_last_four: '1234',
  emergency_contact: {
    name: 'Jane Doe',
    relationship: 'Spouse',
    phone: '(555) 987-6543',
    email: 'jane.doe@example.com'
  },
  property_name: 'Maple Street Apartments',
  unit_number: '2A',
  property_address: '123 Maple Street, Anytown, CA 12345',
  lease_status: 'active',
  rent_amount: 1500,
  deposit_amount: 1500,
  deposit_paid: true,
  lease_start_date: '2024-01-01',
  lease_end_date: '2024-12-31',
  created_at: '2023-12-01',
  notes: 'Excellent tenant. Always pays on time. Property is well maintained.',
  documents: [
    { id: '1', name: 'Lease Agreement', type: 'pdf', uploaded_at: '2023-12-01' },
    { id: '2', name: 'Application Form', type: 'pdf', uploaded_at: '2023-11-15' },
    { id: '3', name: 'Background Check', type: 'pdf', uploaded_at: '2023-11-20' }
  ]
}

// Mock payment history
const mockPaymentHistory = [
  {
    id: '1',
    date: '2024-11-01',
    amount: 1500,
    type: 'rent',
    status: 'paid',
    method: 'ACH Transfer',
    due_date: '2024-11-01',
    paid_date: '2024-11-01'
  },
  {
    id: '2',
    date: '2024-10-01',
    amount: 1500,
    type: 'rent',
    status: 'paid',
    method: 'ACH Transfer',
    due_date: '2024-10-01',
    paid_date: '2024-10-01'
  },
  {
    id: '3',
    date: '2024-09-01',
    amount: 1500,
    type: 'rent',
    status: 'paid',
    method: 'Check',
    due_date: '2024-09-01',
    paid_date: '2024-09-02'
  },
  {
    id: '4',
    date: '2024-08-01',
    amount: 75,
    type: 'late_fee',
    status: 'paid',
    method: 'ACH Transfer',
    due_date: '2024-08-05',
    paid_date: '2024-08-05'
  }
]

// Mock maintenance requests
const mockMaintenanceRequests = [
  {
    id: '1',
    title: 'Leaky faucet in kitchen',
    description: 'The kitchen faucet has been dripping constantly for the past week.',
    status: 'completed',
    priority: 'medium',
    created_at: '2024-10-15',
    completed_at: '2024-10-17',
    cost: 85.00
  },
  {
    id: '2',
    title: 'AC not cooling properly',
    description: 'Air conditioning system is running but not cooling effectively.',
    status: 'in_progress',
    priority: 'high',
    created_at: '2024-11-01',
    completed_at: null,
    cost: null
  }
]

interface TenantDetailsProps {}

const TenantDetails: React.FC<TenantDetailsProps> = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // In real implementation, these would be API calls
  const { data: tenant, isLoading } = useQuery(
    ['tenant', id],
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockTenant
    },
    {
      enabled: !!id,
    }
  )

  const { data: paymentHistory } = useQuery(
    ['tenant-payments', id],
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockPaymentHistory
    },
    {
      enabled: !!id,
    }
  )

  const { data: maintenanceRequests } = useQuery(
    ['tenant-maintenance', id],
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockMaintenanceRequests
    },
    {
      enabled: !!id,
    }
  )

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

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
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'late':
        return 'bg-red-100 text-red-800'
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-gray-100 text-gray-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const isLeaseExpiringSoon = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading tenant details...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!tenant) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tenant Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The tenant you're looking for doesn't exist.
            </p>
            <div className="mt-6">
              <Link
                to="/tenants"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tenants
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/tenants"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Tenants
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-lg font-medium text-primary-800">
                  {tenant.first_name[0]}{tenant.last_name[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {tenant.first_name} {tenant.last_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {tenant.property_name} - Unit {tenant.unit_number}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              to={`/tenants/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Tenant
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                to={`/leases/new?tenant_id=${id}`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Create Lease</p>
                  <p className="text-xs text-gray-500">Generate new lease agreement</p>
                </div>
              </Link>
              
              <Link
                to={`/maintenance/new?tenant_id=${id}`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Maintenance</p>
                  <p className="text-xs text-gray-500">Create maintenance request</p>
                </div>
              </Link>
              
              <a
                href={`mailto:${tenant.email}`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Send Message</p>
                  <p className="text-xs text-gray-500">Email the tenant</p>
                </div>
              </a>
              
              <Link
                to={`/payments/new?tenant_id=${id}`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <DollarSign className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Record Payment</p>
                  <p className="text-xs text-gray-500">Log a payment received</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: 'overview', name: 'Overview', icon: User },
                { id: 'lease', name: 'Lease Details', icon: FileText },
                { id: 'payments', name: 'Payment History', icon: DollarSign },
                { id: 'maintenance', name: 'Maintenance', icon: AlertCircle }
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
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd className="text-sm text-gray-900">{tenant.first_name} {tenant.last_name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">
                          <a href={`mailto:${tenant.email}`} className="text-primary-600 hover:text-primary-800">
                            {tenant.email}
                          </a>
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="text-sm text-gray-900">
                          <a href={`tel:${tenant.phone}`} className="text-primary-600 hover:text-primary-800">
                            {tenant.phone}
                          </a>
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Age</dt>
                        <dd className="text-sm text-gray-900">{calculateAge(tenant.date_of_birth)} years old</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                        <dd className="text-sm text-gray-900">{formatDate(tenant.date_of_birth)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="text-sm text-gray-900">{tenant.emergency_contact.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                        <dd className="text-sm text-gray-900">{tenant.emergency_contact.relationship}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="text-sm text-gray-900">
                          <a href={`tel:${tenant.emergency_contact.phone}`} className="text-primary-600 hover:text-primary-800">
                            {tenant.emergency_contact.phone}
                          </a>
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">
                          <a href={`mailto:${tenant.emergency_contact.email}`} className="text-primary-600 hover:text-primary-800">
                            {tenant.emergency_contact.email}
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Property Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Property Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <Building2 className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tenant.property_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{tenant.property_address}</p>
                        <p className="text-sm text-gray-600">Unit {tenant.unit_number}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {tenant.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{tenant.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lease Details Tab */}
            {activeTab === 'lease' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Lease Information</h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(tenant.lease_status)}`}>
                            {tenant.lease_status.charAt(0).toUpperCase() + tenant.lease_status.slice(1)}
                          </span>
                          {isLeaseExpiringSoon(tenant.lease_end_date) && (
                            <span className="ml-2 text-xs text-yellow-600">(Expires soon)</span>
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Monthly Rent</dt>
                        <dd className="text-sm text-gray-900 font-semibold">{formatCurrency(tenant.rent_amount)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Security Deposit</dt>
                        <dd className="text-sm text-gray-900">{formatCurrency(tenant.deposit_amount)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Deposit Status</dt>
                        <dd>
                          {tenant.deposit_paid ? (
                            <span className="inline-flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-600">
                              <XCircle className="h-4 w-4 mr-1" />
                              Pending
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Lease Dates</h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                        <dd className="text-sm text-gray-900">{formatDate(tenant.lease_start_date)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">End Date</dt>
                        <dd className="text-sm text-gray-900">{formatDate(tenant.lease_end_date)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Lease Duration</dt>
                        <dd className="text-sm text-gray-900">12 months</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                  <div className="space-y-3">
                    {tenant.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">Uploaded {formatDate(doc.uploaded_at)}</p>
                          </div>
                        </div>
                        <button className="text-primary-600 hover:text-primary-800">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payment History Tab */}
            {activeTab === 'payments' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
                  <div className="text-sm text-gray-500">
                    {paymentHistory?.length || 0} payments recorded
                  </div>
                </div>

                {paymentHistory && paymentHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentHistory.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(payment.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {payment.type.replace('_', ' ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.method}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(payment.status)}`}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No payment history available</p>
                  </div>
                )}
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Maintenance Requests</h3>
                  <Link
                    to={`/maintenance/new?tenant_id=${id}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Link>
                </div>

                {maintenanceRequests && maintenanceRequests.length > 0 ? (
                  <div className="space-y-4">
                    {maintenanceRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">{request.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(request.priority)}`}>
                              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                              {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{request.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Created:</span><br />
                            {formatDate(request.created_at)}
                          </div>
                          {request.completed_at && (
                            <div>
                              <span className="font-medium">Completed:</span><br />
                              {formatDate(request.completed_at)}
                            </div>
                          )}
                          {request.cost && (
                            <div>
                              <span className="font-medium">Cost:</span><br />
                              {formatCurrency(request.cost)}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Request ID:</span><br />
                            #{request.id}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No maintenance requests</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default TenantDetails