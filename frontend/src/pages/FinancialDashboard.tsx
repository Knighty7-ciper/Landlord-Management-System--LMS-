import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  PieChart,
  BarChart3,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Building2,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Send
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ActionDropdown } from '@/components/ui/ActionDropdown'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { SearchInput } from '@/components/ui/Search'
import { DataTable } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Select'

// Mock financial data
const mockRevenueData = [
  { month: 'Jan', revenue: 15000, expenses: 3200, profit: 11800 },
  { month: 'Feb', revenue: 16500, expenses: 4100, profit: 12400 },
  { month: 'Mar', revenue: 17200, expenses: 3800, profit: 13400 },
  { month: 'Apr', revenue: 16800, expenses: 3500, profit: 13300 },
  { month: 'May', revenue: 18500, expenses: 4200, profit: 14300 },
  { month: 'Jun', revenue: 19200, expenses: 3900, profit: 15300 },
  { month: 'Jul', revenue: 20100, expenses: 4500, profit: 15600 },
  { month: 'Aug', revenue: 19500, expenses: 4100, profit: 15400 },
  { month: 'Sep', revenue: 20800, expenses: 3800, profit: 17000 },
  { month: 'Oct', revenue: 21500, expenses: 4200, profit: 17300 },
  { month: 'Nov', revenue: 22000, expenses: 4600, profit: 17400 },
  { month: 'Dec', revenue: 23000, expenses: 5000, profit: 18000 },
]

const mockExpenseBreakdown = [
  { name: 'Maintenance', value: 4500, color: '#EF4444' },
  { name: 'Property Management', value: 2800, color: '#3B82F6' },
  { name: 'Insurance', value: 1200, color: '#10B981' },
  { name: 'Utilities', value: 800, color: '#F59E0B' },
  { name: 'Legal & Professional', value: 600, color: '#8B5CF6' },
  { name: 'Marketing', value: 400, color: '#EC4899' },
  { name: 'Other', value: 200, color: '#6B7280' }
]

const mockRecentTransactions = [
  {
    id: '1',
    date: '2024-11-02',
    description: 'Rent Payment - Maple Street Apt 2A',
    type: 'income',
    amount: 1500,
    category: 'rent',
    tenant_name: 'John Doe',
    status: 'completed'
  },
  {
    id: '2',
    date: '2024-11-02',
    description: 'HVAC Repair - Oak Park Condos',
    type: 'expense',
    amount: -850,
    category: 'maintenance',
    vendor: 'Cool Air HVAC',
    status: 'completed'
  },
  {
    id: '3',
    date: '2024-11-01',
    description: 'Rent Payment - Pine View Townhome',
    type: 'income',
    amount: 2200,
    category: 'rent',
    tenant_name: 'Mike Johnson',
    status: 'completed'
  },
  {
    id: '4',
    date: '2024-11-01',
    description: 'Property Insurance Premium',
    type: 'expense',
    amount: -1200,
    category: 'insurance',
    vendor: 'ABC Insurance Co.',
    status: 'completed'
  },
  {
    id: '5',
    date: '2024-10-31',
    description: 'Rent Payment - Cedar Ridge Apt 1C',
    type: 'income',
    amount: 1650,
    category: 'rent',
    tenant_name: 'Sarah Wilson',
    status: 'pending'
  }
]

const mockOutstandingPayments = [
  {
    id: '1',
    tenant_name: 'Tom Anderson',
    property_name: 'Maple Street Apartments',
    unit_number: '3A',
    amount: 1500,
    due_date: '2024-11-01',
    days_overdue: 1,
    payment_type: 'rent'
  },
  {
    id: '2',
    tenant_name: 'Lisa Brown',
    property_name: 'Oak Park Condos',
    unit_number: '4A',
    amount: 1800,
    due_date: '2024-10-15',
    days_overdue: 18,
    payment_type: 'rent'
  }
]

interface FinancialDashboardProps {}

interface Transaction {
  id: string
  date: string
  description: string
  type: 'income' | 'expense'
  amount: number
  category: string
  tenant_name?: string
  vendor?: string
  status: 'completed' | 'pending' | 'failed'
}

interface OutstandingPayment {
  id: string
  tenant_name: string
  property_name: string
  unit_number: string
  amount: number
  due_date: string
  days_overdue: number
  payment_type: string
}

interface TransactionFilters {
  search: string
  type: string
  status: string
  category: string
  dateRange: string
}

interface TransactionSortConfig {
  key: keyof Transaction | null
  direction: 'asc' | 'desc'
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('12m')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [transactions, setTransactions] = useState<Transaction[]>(mockRecentTransactions)
  const [outstandingPayments, setOutstandingPayments] = useState<OutstandingPayment[]>(mockOutstandingPayments)
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: '',
    status: '',
    category: '',
    dateRange: ''
  })
  const [sortConfig, setSortConfig] = useState<TransactionSortConfig>({ key: null, direction: 'asc' })
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calculate totals
  const currentMonthRevenue = mockRevenueData[mockRevenueData.length - 1].revenue
  const currentMonthExpenses = mockRevenueData[mockRevenueData.length - 1].expenses
  const currentMonthProfit = mockRevenueData[mockRevenueData.length - 1].profit
  
  const previousMonthRevenue = mockRevenueData[mockRevenueData.length - 2].revenue
  const revenueGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100

  const totalOutstanding = mockOutstandingPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const occupancyRate = 85 // Mock data

  // Filter and sort transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         (transaction.tenant_name?.toLowerCase().includes(filters.search.toLowerCase()) ?? false) ||
                         (transaction.vendor?.toLowerCase().includes(filters.search.toLowerCase()) ?? false)
    const matchesType = !filters.type || transaction.type === filters.type
    const matchesStatus = !filters.status || transaction.status === filters.status
    const matchesCategory = !filters.category || transaction.category === filters.category
    return matchesSearch && matchesType && matchesStatus && matchesCategory
  })

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortConfig.key) return 0
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (key: keyof Transaction) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedTransactions.length === paginatedTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(paginatedTransactions.map(t => t.id))
    }
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (transactionToDelete) {
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete))
      setShowDeleteModal(false)
      setTransactionToDelete(null)
    }
  }

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'export':
        console.log('Exporting transactions:', selectedTransactions)
        break
      case 'delete':
        setTransactions(prev => prev.filter(t => !selectedTransactions.includes(t.id)))
        setSelectedTransactions([])
        break
      case 'mark_completed':
        setTransactions(prev => prev.map(t => 
          selectedTransactions.includes(t.id) ? { ...t, status: 'completed' } : t
        ))
        setSelectedTransactions([])
        break
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Revenue, expenses, and profit analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
              placeholder="Select period"
            >
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
              <option value="24m">Last 24 months</option>
            </Select>
            
            <Button variant="outline" className="inline-flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Link to="/payments/new">
              <Button className="inline-flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(currentMonthRevenue)}
                    </p>
                    <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                      revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {revenueGrowth >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(revenueGrowth).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Monthly Profit</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(currentMonthProfit)}
                    </p>
                    <p className="ml-2 text-sm font-medium text-gray-500">
                      {((currentMonthProfit / currentMonthRevenue) * 100).toFixed(0)}% margin
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Monthly Expenses</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(currentMonthExpenses)}
                    </p>
                    <p className="ml-2 text-sm font-medium text-gray-500">
                      {((currentMonthExpenses / currentMonthRevenue) * 100).toFixed(0)}% of revenue
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Outstanding</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(totalOutstanding)}
                    </p>
                    <p className="ml-2 text-sm font-medium text-gray-500">
                      {mockOutstandingPayments.length} payments
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue & Profit Trend</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedMetric === 'revenue' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('revenue')}
                  >
                    Revenue
                  </Button>
                  <Button
                    variant={selectedMetric === 'profit' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('profit')}
                  >
                    Profit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={selectedMetric === 'revenue' ? '#10B981' : '#3B82F6'}
                      fill={selectedMetric === 'revenue' ? '#10B981' : '#3B82F6'}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={mockExpenseBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {mockExpenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {mockExpenseBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <div className="flex items-center space-x-3">
                  <SearchInput
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                    className="w-64"
                  />
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                    placeholder="Type"
                  >
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </Select>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    placeholder="Status"
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </Select>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                    placeholder="Category"
                  >
                    <option value="">All Categories</option>
                    <option value="rent">Rent</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="insurance">Insurance</option>
                  </Select>
                </div>
              </div>
              {selectedTransactions.length > 0 && (
                <div className="flex items-center space-x-2 mt-4">
                  <span className="text-sm text-gray-600">
                    {selectedTransactions.length} selected
                  </span>
                  <ActionDropdown
                    actions={[
                      { id: 'export', label: 'Export Selected', icon: Download },
                      { id: 'mark_completed', label: 'Mark as Completed', icon: CheckCircle },
                      { id: 'delete', label: 'Delete Selected', icon: Trash2, variant: 'destructive' }
                    ]}
                    onActionSelect={handleBulkAction}
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <DataTable
                data={paginatedTransactions}
                columns={[
                  {
                    key: 'checkbox',
                    header: (
                      <input
                        type="checkbox"
                        checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    ),
                    render: (transaction: Transaction) => (
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => handleSelectTransaction(transaction.id)}
                        className="rounded border-gray-300"
                      />
                    )
                  },
                  {
                    key: 'description',
                    header: 'Description',
                    sortable: true,
                    render: (transaction: Transaction) => (
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {transaction.category} • {transaction.type === 'income' ? transaction.tenant_name : transaction.vendor}
                        </p>
                      </div>
                    )
                  },
                  {
                    key: 'date',
                    header: 'Date',
                    sortable: true,
                    render: (transaction: Transaction) => (
                      <span className="text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </span>
                    )
                  },
                  {
                    key: 'amount',
                    header: 'Amount',
                    sortable: true,
                    render: (transaction: Transaction) => (
                      <span className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                      </span>
                    )
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (transaction: Transaction) => (
                      <Badge
                        variant={
                          transaction.status === 'completed' ? 'success' :
                          transaction.status === 'pending' ? 'warning' : 'destructive'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    )
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (transaction: Transaction) => (
                      <ActionDropdown
                        actions={[
                          { id: 'view', label: 'View Details', icon: Eye },
                          { id: 'edit', label: 'Edit', icon: Edit },
                          { id: 'receipt', label: 'Receipt', icon: FileText },
                          { id: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive' }
                        ]}
                        onActionSelect={(action) => {
                          if (action === 'delete') {
                            handleDeleteTransaction(transaction.id)
                          } else {
                            console.log(`${action} transaction:`, transaction.id)
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
                  totalItems: sortedTransactions.length
                }}
              />
              <div className="mt-6 text-center">
                <Link
                  to="/transactions"
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  View all transactions →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Outstanding Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {outstandingPayments.length > 0 ? (
                <div className="space-y-4">
                  {outstandingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {payment.tenant_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payment.property_name} - Unit {payment.unit_number}
                          </p>
                          <p className="text-xs text-gray-400">
                            Due: {formatDate(payment.due_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <div className="flex items-center justify-end space-x-2 mt-1">
                          <Badge variant="destructive">
                            {payment.days_overdue} days overdue
                          </Badge>
                          <ActionDropdown
                            actions={[
                              { id: 'remind', label: 'Send Reminder', icon: Send },
                              { id: 'view', label: 'View Details', icon: Eye },
                              { id: 'call', label: 'Call Tenant', icon: CreditCard }
                            ]}
                            onActionSelect={(action) => {
                              console.log(`${action} payment:`, payment.id)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                  <p className="mt-2 text-sm text-gray-500">All payments are up to date!</p>
                </div>
              )}
              <div className="mt-6 text-center">
                <Link
                  to="/payments"
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Manage payments →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/payments/new">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <CreditCard className="h-6 w-6 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Record Payment</p>
                    <p className="text-xs text-gray-500">Log a payment received</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/expenses/new">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <TrendingDown className="h-6 w-6 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Add Expense</p>
                    <p className="text-xs text-gray-500">Record property expense</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/reports/financial">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Financial Report</p>
                    <p className="text-xs text-gray-500">Generate detailed report</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/tax-documents">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <FileText className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tax Documents</p>
                    <p className="text-xs text-gray-500">Prepare tax statements</p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Transaction"
          message="Are you sure you want to delete this transaction? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </MainLayout>
  )
}

export default FinancialDashboard