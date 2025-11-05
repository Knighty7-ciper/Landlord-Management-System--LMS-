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
  ArrowDownRight
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts'
import MainLayout from '@/components/layout/MainLayout'

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

const FinancialDashboard: React.FC<FinancialDashboardProps> = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('12m')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  // Calculate totals
  const currentMonthRevenue = mockRevenueData[mockRevenueData.length - 1].revenue
  const currentMonthExpenses = mockRevenueData[mockRevenueData.length - 1].expenses
  const currentMonthProfit = mockRevenueData[mockRevenueData.length - 1].profit
  
  const previousMonthRevenue = mockRevenueData[mockRevenueData.length - 2].revenue
  const revenueGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100

  const totalOutstanding = mockOutstandingPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const occupancyRate = 85 // Mock data

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
      day: 'numeric'
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
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
              <option value="24m">Last 24 months</option>
            </select>
            
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            
            <Link
              to="/payments/new"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
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
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Revenue & Profit Trend</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMetric('revenue')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      selectedMetric === 'revenue'
                        ? 'bg-primary-100 text-primary-800'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Revenue
                  </button>
                  <button
                    onClick={() => setSelectedMetric('profit')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      selectedMetric === 'profit'
                        ? 'bg-primary-100 text-primary-800'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Profit
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
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
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Expense Breakdown</h3>
            </div>
            <div className="p-6">
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
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockRecentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 space-x-2">
                          <span>{formatDate(transaction.date)}</span>
                          <span>•</span>
                          <span className="capitalize">{transaction.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        {transaction.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link
                  to="/transactions"
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  View all transactions →
                </Link>
              </div>
            </div>
          </div>

          {/* Outstanding Payments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Outstanding Payments</h3>
            </div>
            <div className="p-6">
              {mockOutstandingPayments.length > 0 ? (
                <div className="space-y-4">
                  {mockOutstandingPayments.map((payment) => (
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
                        <p className="text-xs text-red-600">
                          {payment.days_overdue} days overdue
                        </p>
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
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/payments/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Record Payment</p>
                <p className="text-xs text-gray-500">Log a payment received</p>
              </div>
            </Link>
            
            <Link
              to="/expenses/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingDown className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Add Expense</p>
                <p className="text-xs text-gray-500">Record property expense</p>
              </div>
            </Link>
            
            <Link
              to="/reports/financial"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Financial Report</p>
                <p className="text-xs text-gray-500">Generate detailed report</p>
              </div>
            </Link>
            
            <Link
              to="/tax-documents"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Tax Documents</p>
                <p className="text-xs text-gray-500">Prepare tax statements</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default FinancialDashboard