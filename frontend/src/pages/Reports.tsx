import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Wrench,
  AlertCircle,
  Filter,
  Eye,
  Plus,
  PieChart,
  LineChart
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts'
import MainLayout from '@/components/layout/MainLayout'

// Mock data for reports
const mockOccupancyData = [
  { month: 'Jan', occupancy: 85, total_units: 50, occupied_units: 42 },
  { month: 'Feb', occupancy: 88, total_units: 50, occupied_units: 44 },
  { month: 'Mar', occupancy: 90, total_units: 50, occupied_units: 45 },
  { month: 'Apr', occupancy: 92, total_units: 50, occupied_units: 46 },
  { month: 'May', occupancy: 94, total_units: 50, occupied_units: 47 },
  { month: 'Jun', occupancy: 96, total_units: 50, occupied_units: 48 },
  { month: 'Jul', occupancy: 94, total_units: 50, occupied_units: 47 },
  { month: 'Aug', occupancy: 92, total_units: 50, occupied_units: 46 },
  { month: 'Sep', occupancy: 90, total_units: 50, occupied_units: 45 },
  { month: 'Oct', occupancy: 88, total_units: 50, occupied_units: 44 },
  { month: 'Nov', occupancy: 86, total_units: 50, occupied_units: 43 },
  { month: 'Dec', occupancy: 84, total_units: 50, occupied_units: 42 }
]

const mockMaintenanceData = [
  { category: 'Plumbing', requests: 12, avg_cost: 185 },
  { category: 'Electrical', requests: 8, avg_cost: 220 },
  { category: 'HVAC', requests: 6, avg_cost: 350 },
  { category: 'Structural', requests: 4, avg_cost: 450 },
  { category: 'Other', requests: 10, avg_cost: 95 }
]

const mockRevenueBreakdown = [
  { name: 'Rent Income', value: 225000, color: '#10B981' },
  { name: 'Late Fees', value: 3200, color: '#F59E0B' },
  { name: 'Pet Fees', value: 1800, color: '#3B82F6' },
  { name: 'Parking', value: 1500, color: '#8B5CF6' },
  { name: 'Other', value: 800, color: '#EF4444' }
]

const reportTemplates = [
  {
    id: 'occupancy',
    name: 'Occupancy Report',
    description: 'Track occupancy rates and trends across all properties',
    icon: Building2,
    category: 'Properties',
    lastGenerated: '2024-11-01'
  },
  {
    id: 'financial',
    name: 'Financial Summary',
    description: 'Revenue, expenses, and profit analysis',
    icon: DollarSign,
    category: 'Financial',
    lastGenerated: '2024-11-02'
  },
  {
    id: 'maintenance',
    name: 'Maintenance Report',
    description: 'Maintenance requests, costs, and vendor performance',
    icon: Wrench,
    category: 'Maintenance',
    lastGenerated: '2024-10-30'
  },
  {
    id: 'tenant',
    name: 'Tenant Report',
    description: 'Tenant demographics, lease status, and payment history',
    icon: Users,
    category: 'Tenants',
    lastGenerated: '2024-11-01'
  },
  {
    id: 'tax',
    name: 'Tax Statement',
    description: 'Annual tax preparation with income and expense details',
    icon: FileText,
    category: 'Tax',
    lastGenerated: '2024-01-15'
  },
  {
    id: 'vacancy',
    name: 'Vacancy Analysis',
    description: 'Vacancy periods, lost revenue, and turnaround times',
    icon: AlertCircle,
    category: 'Properties',
    lastGenerated: '2024-10-28'
  }
]

const customReports = [
  {
    id: 'custom-1',
    name: 'Q4 Revenue vs Expenses',
    description: 'Quarterly comparison of income and costs',
    type: 'financial',
    created_at: '2024-11-01'
  },
  {
    id: 'custom-2',
    name: 'High-Priority Maintenance',
    description: 'All urgent and high-priority maintenance requests',
    type: 'maintenance',
    created_at: '2024-10-29'
  }
]

interface ReportsProps {}

const Reports: React.FC<ReportsProps> = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('12m')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCustomReports, setShowCustomReports] = useState(false)

  // Filter reports
  const filteredReports = selectedCategory === 'all' 
    ? reportTemplates 
    : reportTemplates.filter(report => report.category === selectedCategory)

  const categories = Array.from(new Set(reportTemplates.map(r => r.category)))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              Generate comprehensive reports and view business analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
            
            <Link
              to="/reports/new"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Properties</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Tenants</p>
                <p className="text-2xl font-semibold text-gray-900">47</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Occupancy</p>
                <p className="text-2xl font-semibold text-gray-900">90%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Annual Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">$232K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Occupancy Trend */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Occupancy Trend</h3>
            </div>
            <div className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockOccupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
                    <Area
                      type="monotone"
                      dataKey="occupancy"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Revenue Breakdown</h3>
            </div>
            <div className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={mockRevenueBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {mockRevenueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {mockRevenueBreakdown.slice(0, 3).map((item, index) => (
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

        {/* Report Templates */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Report Templates</h3>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCustomReports(!showCustomReports)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    showCustomReports
                      ? 'bg-primary-100 text-primary-800'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Custom Reports
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {showCustomReports ? (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Custom Reports</h4>
                {customReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{report.name}</p>
                        <p className="text-sm text-gray-500">{report.description}</p>
                        <p className="text-xs text-gray-400 mt-1">Created {new Date(report.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/reports/${report.id}`}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button className="text-gray-600 hover:text-gray-800">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => {
                  const IconComponent = report.icon
                  return (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">{report.name}</h4>
                          <p className="text-xs text-gray-500">{report.category}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/reports/${report.id}/generate`}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button className="text-gray-600 hover:text-gray-800">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Analysis Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Maintenance Analysis</h3>
          </div>
          <div className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockMaintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Reports