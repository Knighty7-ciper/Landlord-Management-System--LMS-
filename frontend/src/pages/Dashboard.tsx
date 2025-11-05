import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Plus,
  Eye,
  Home,
  Activity
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useQuery } from 'react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// Mock data - in a real app, this would come from API
const mockDashboardData = {
  overview: {
    totalProperties: 12,
    occupiedUnits: 28,
    vacantUnits: 4,
    totalRevenue: 45600,
    monthlyRevenue: 38400,
    occupancyRate: 87.5,
    maintenanceRequests: 3
  },
  revenueData: [
    { month: 'Jan', revenue: 32000, expenses: 12000 },
    { month: 'Feb', revenue: 35000, expenses: 13500 },
    { month: 'Mar', revenue: 38000, expenses: 14000 },
    { month: 'Apr', revenue: 42000, expenses: 16000 },
    { month: 'May', revenue: 45000, expenses: 18000 },
    { month: 'Jun', revenue: 38400, expenses: 15000 }
  ],
  propertyTypeData: [
    { name: 'Apartments', value: 45, color: '#3B82F6' },
    { name: 'Single Family', value: 30, color: '#10B981' },
    { name: 'Townhouses', value: 15, color: '#F59E0B' },
    { name: 'Commercial', value: 10, color: '#EF4444' }
  ],
  recentActivities: [
    { id: 1, type: 'maintenance', description: 'Plumbing issue resolved at Oak Street', time: '2 hours ago' },
    { id: 2, type: 'tenant', description: 'New lease signed - Unit 301', time: '4 hours ago' },
    { id: 3, type: 'payment', description: 'Rent payment received from John Doe', time: '1 day ago' },
    { id: 4, type: 'maintenance', description: 'HVAC inspection scheduled', time: '2 days ago' }
  ],
  recentProperties: [
    { id: 1, name: 'Sunset Apartments', address: '123 Sunset Drive', units: 12, occupied: 10, rent: 1500 },
    { id: 2, name: 'Oak Street Townhouse', address: '456 Oak Street', units: 4, occupied: 4, rent: 2200 },
    { id: 3, name: 'Maple Court Condos', address: '789 Maple Court', units: 8, occupied: 7, rent: 1800 }
  ]
}

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6M')

  // In a real app, this would be an API call
  const { data, isLoading } = useQuery('dashboard-data', async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return mockDashboardData
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your properties.</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/properties/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Properties */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Properties</dt>
                  <dd className="text-lg font-medium text-gray-900">{data?.overview.totalProperties}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Occupied Units */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Occupied Units</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data?.overview.occupiedUnits} / {data?.overview.occupiedUnits + data?.overview.vacantUnits}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(data?.overview.monthlyRevenue || 0)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Occupancy Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatPercentage(data?.overview.occupancyRate || 0)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 shadow rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Revenue & Expenses</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="3M">Last 3 months</option>
              <option value="6M">Last 6 months</option>
              <option value="1Y">Last year</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property Type Distribution */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Property Types</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.propertyTypeData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {data?.propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Properties Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {data?.recentActivities.map((activity) => (
              <div key={activity.id} className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 h-2 w-2 rounded-full ${
                    activity.type === 'payment' ? 'bg-green-400' :
                    activity.type === 'maintenance' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Properties</h3>
              <Link
                to="/properties"
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
              >
                View all
                <Eye className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {data?.recentProperties.map((property) => (
              <div key={property.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{property.name}</h4>
                    <p className="text-xs text-gray-500">{property.address}</p>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{property.occupied}/{property.units} units</span>
                      <span>{formatCurrency(property.rent)}/unit</span>
                    </div>
                  </div>
                  <Link
                    to={`/properties/${property.id}`}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance Alerts */}
      {data?.overview.maintenanceRequests && data.overview.maintenanceRequests > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have {data.overview.maintenanceRequests} pending maintenance request{data.overview.maintenanceRequests > 1 ? 's' : ''}.
                {' '}
                <Link to="/maintenance" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                  View requests
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard