import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  Settings,
  Building2,
  Bell,
  Shield,
  Mail,
  CreditCard,
  Database,
  Globe,
  Palette,
  Save,
  Plus,
  Edit,
  Trash2,
  Key,
  Link,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

interface SettingsFormData {
  business: {
    name: string
    email: string
    phone: string
    address: string
    website: string
    tax_id: string
    timezone: string
    currency: string
  }
  notifications: {
    email_leases: boolean
    email_payments: boolean
    email_maintenance: boolean
    sms_urgent: boolean
    push_all: boolean
  }
  integrations: {
    stripe_enabled: boolean
    stripe_public_key: string
    stripe_secret_key: string
    quickbooks_enabled: boolean
    google_calendar_enabled: boolean
  }
  security: {
    two_factor_required: boolean
    password_expiry_days: number
    session_timeout_minutes: number
    ip_restriction: boolean
  }
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('business')
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SettingsFormData>({
    defaultValues: {
      business: {
        name: 'Acme Property Management',
        email: 'info@acmeproperty.com',
        phone: '(555) 123-4567',
        address: '123 Business St, Anytown, CA 12345',
        website: 'https://acmeproperty.com',
        tax_id: '12-3456789',
        timezone: 'America/Los_Angeles',
        currency: 'USD'
      },
      notifications: {
        email_leases: true,
        email_payments: true,
        email_maintenance: true,
        sms_urgent: false,
        push_all: true
      },
      integrations: {
        stripe_enabled: false,
        stripe_public_key: '',
        stripe_secret_key: '',
        quickbooks_enabled: false,
        google_calendar_enabled: true
      },
      security: {
        two_factor_required: false,
        password_expiry_days: 90,
        session_timeout_minutes: 120,
        ip_restriction: false
      }
    }
  })

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true)
    try {
      // In real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'business', name: 'Business', icon: Building2 },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'integrations', name: 'Integrations', icon: Link },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database }
  ]

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your application settings and preferences
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center flex-shrink-0`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              {/* Business Settings Tab */}
              {activeTab === 'business' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name *
                        </label>
                        <Controller
                          name="business.name"
                          control={control}
                          rules={{ required: 'Business name is required' }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                        {errors.business?.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.business.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Controller
                          name="business.email"
                          control={control}
                          rules={{ 
                            required: 'Email is required',
                            pattern: {
                              value: /^\S+@\S+$/i,
                              message: 'Invalid email address'
                            }
                          }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                        {errors.business?.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.business.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Controller
                          name="business.phone"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="tel"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <Controller
                          name="business.website"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="url"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Address
                        </label>
                        <Controller
                          name="business.address"
                          control={control}
                          render={({ field }) => (
                            <textarea
                              {...field}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax ID / EIN
                        </label>
                        <Controller
                          name="business.tax_id"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <Controller
                          name="business.timezone"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="America/Los_Angeles">Pacific Time (PT)</option>
                              <option value="America/Denver">Mountain Time (MT)</option>
                              <option value="America/Chicago">Central Time (CT)</option>
                              <option value="America/New_York">Eastern Time (ET)</option>
                            </select>
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Currency
                        </label>
                        <Controller
                          name="business.currency"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="USD">USD - US Dollar</option>
                              <option value="EUR">EUR - Euro</option>
                              <option value="GBP">GBP - British Pound</option>
                              <option value="CAD">CAD - Canadian Dollar</option>
                            </select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Lease Notifications</p>
                          <p className="text-sm text-gray-500">Receive emails about lease expirations and renewals</p>
                        </div>
                        <Controller
                          name="notifications.email_leases"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Payment Notifications</p>
                          <p className="text-sm text-gray-500">Receive emails about rent payments and overdue amounts</p>
                        </div>
                        <Controller
                          name="notifications.email_payments"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Maintenance Notifications</p>
                          <p className="text-sm text-gray-500">Receive emails about maintenance requests and updates</p>
                        </div>
                        <Controller
                          name="notifications.email_maintenance"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">SMS & Push Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Urgent SMS Notifications</p>
                          <p className="text-sm text-gray-500">Receive SMS for urgent maintenance requests</p>
                        </div>
                        <Controller
                          name="notifications.sms_urgent"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                          <p className="text-sm text-gray-500">Receive push notifications for all updates</p>
                        </div>
                        <Controller
                          name="notifications.push_all"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Processing</h3>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Stripe Payment Processing</h4>
                              <p className="text-sm text-gray-500">Accept credit card and ACH payments</p>
                            </div>
                          </div>
                          <Controller
                            name="integrations.stripe_enabled"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Public Key
                            </label>
                            <Controller
                              name="integrations.stripe_public_key"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  placeholder="pk_test_..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                              )}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Secret Key
                            </label>
                            <div className="relative">
                              <Controller
                                name="integrations.stripe_secret_key"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type={showApiKeys ? 'text' : 'password'}
                                    placeholder="sk_test_..."
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                )}
                              />
                              <button
                                type="button"
                                onClick={() => setShowApiKeys(!showApiKeys)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showApiKeys ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Accounting & Calendar</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <Database className="h-6 w-6 text-green-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">QuickBooks Integration</p>
                            <p className="text-sm text-gray-500">Sync financial data with QuickBooks Online</p>
                          </div>
                        </div>
                        <Controller
                          name="integrations.quickbooks_enabled"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <Globe className="h-6 w-6 text-red-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Google Calendar</p>
                            <p className="text-sm text-gray-500">Sync maintenance appointments with Google Calendar</p>
                          </div>
                        </div>
                        <Controller
                          name="integrations.google_calendar_enabled"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication & Access</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Require Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Force all users to enable 2FA</p>
                        </div>
                        <Controller
                          name="security.two_factor_required"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">IP Restriction</p>
                          <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                        </div>
                        <Controller
                          name="security.ip_restriction"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Password & Session Policy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Expiry (Days)
                        </label>
                        <Controller
                          name="security.password_expiry_days"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              min="30"
                              max="365"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          )}
                        />
                        <p className="text-xs text-gray-500 mt-1">Users must change password after this many days</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (Minutes)
                        </label>
                        <Controller
                          name="security.session_timeout_minutes"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              min="15"
                              max="480"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          )}
                        />
                        <p className="text-xs text-gray-500 mt-1">Automatically log out inactive users</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Tab */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Application Version</span>
                        <span className="text-sm text-gray-900">v1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Database Version</span>
                        <span className="text-sm text-gray-900">PostgreSQL 15.2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Last Backup</span>
                        <span className="text-sm text-gray-900">2024-11-02 02:00 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">System Status</span>
                        <span className="inline-flex items-center text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Healthy
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
                    <div className="space-y-4">
                      <button
                        type="button"
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Export All Data
                      </button>
                      
                      <button
                        type="button"
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Generate API Keys
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <h4 className="text-sm font-medium text-red-800">Irreversible Actions</h4>
                      </div>
                      <p className="text-sm text-red-700 mb-4">
                        These actions cannot be undone. Please proceed with caution.
                      </p>
                      <div className="space-y-3">
                        <button
                          type="button"
                          className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete All Data
                        </button>
                        
                        <button
                          type="button"
                          className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Reset to Factory Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}

export default Settings