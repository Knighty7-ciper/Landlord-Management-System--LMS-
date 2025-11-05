import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  User,
  Camera,
  Edit2,
  Save,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

interface ProfileFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  address: {
    street: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  bio: string
  preferences: {
    email_notifications: boolean
    sms_notifications: boolean
    push_notifications: boolean
    marketing_emails: boolean
    language: string
    timezone: string
  }
}

interface PasswordFormData {
  current_password: string
  new_password: string
  confirm_password: string
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Mock user data
  const mockUser = {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    date_of_birth: '1990-05-15',
    address: {
      street: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zip_code: '12345',
      country: 'United States'
    },
    bio: 'Property management professional with over 10 years of experience. I specialize in residential property management and tenant relations.',
    role: 'landlord',
    created_at: '2023-01-15',
    last_login_at: '2024-11-02',
    preferences: {
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      marketing_emails: false,
      language: 'en',
      timezone: 'America/Los_Angeles'
    },
    avatar_url: null
  }

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile
  } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: mockUser.first_name,
      last_name: mockUser.last_name,
      email: mockUser.email,
      phone: mockUser.phone,
      date_of_birth: mockUser.date_of_birth,
      address: mockUser.address,
      bio: mockUser.bio,
      preferences: mockUser.preferences
    }
  })

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
    watch: watchPassword
  } = useForm<PasswordFormData>()

  const newPassword = watchPassword('new_password')

  // Handle avatar upload
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      // In real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Profile updated successfully!')
      
      // Upload avatar if selected
      if (avatarFile) {
        // Simulate avatar upload
        await new Promise(resolve => setTimeout(resolve, 500))
        toast.success('Avatar updated successfully!')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      // In real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Password updated successfully!')
      resetPassword()
    } catch (error) {
      toast.error('Failed to update password')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account information and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: 'profile', name: 'Profile Information', icon: User },
                { id: 'security', name: 'Security', icon: Lock },
                { id: 'preferences', name: 'Preferences', icon: Bell }
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
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Avatar Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : mockUser.avatar_url ? (
                          <img
                            src={mockUser.avatar_url}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white cursor-pointer hover:bg-primary-700 transition-colors">
                        <Camera className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {mockUser.first_name} {mockUser.last_name}
                      </h4>
                      <p className="text-sm text-gray-500 capitalize">{mockUser.role}</p>
                      <div className="mt-2 flex space-x-3">
                        {avatarFile && (
                          <button
                            onClick={handleRemoveAvatar}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                        <span className="text-sm text-gray-500">
                          JPG, GIF or PNG. 5MB max.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Controller
                          name="first_name"
                          control={profileControl}
                          rules={{ required: 'First name is required' }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                        {profileErrors.first_name && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.first_name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Controller
                          name="last_name"
                          control={profileControl}
                          rules={{ required: 'Last name is required' }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                        {profileErrors.last_name && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.last_name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Controller
                          name="email"
                          control={profileControl}
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
                        {profileErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Controller
                          name="phone"
                          control={profileControl}
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
                          Date of Birth
                        </label>
                        <Controller
                          name="date_of_birth"
                          control={profileControl}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="date"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address
                        </label>
                        <Controller
                          name="address.street"
                          control={profileControl}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <Controller
                            name="address.city"
                            control={profileControl}
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
                            State
                          </label>
                          <Controller
                            name="address.state"
                            control={profileControl}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="text"
                                maxLength={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            )}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code
                          </label>
                          <Controller
                            name="address.zip_code"
                            control={profileControl}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <Controller
                      name="bio"
                      control={profileControl}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Tell us about yourself..."
                        />
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isProfileSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isProfileSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password *
                      </label>
                      <div className="relative">
                        <Controller
                          name="current_password"
                          control={passwordControl}
                          rules={{ required: 'Current password is required' }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type={showCurrentPassword ? 'text' : 'password'}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.current_password && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <div className="relative">
                        <Controller
                          name="new_password"
                          control={passwordControl}
                          rules={{ 
                            required: 'New password is required',
                            minLength: {
                              value: 8,
                              message: 'Password must be at least 8 characters'
                            }
                          }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type={showNewPassword ? 'text' : 'password'}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.new_password && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.new_password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <Controller
                          name="confirm_password"
                          control={passwordControl}
                          rules={{ 
                            required: 'Please confirm your password',
                            validate: (value) => value === newPassword || 'Passwords do not match'
                          }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type={showConfirmPassword ? 'text' : 'password'}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirm_password && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirm_password.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isPasswordSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isPasswordSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Account Security */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                        Enable
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Login Sessions</p>
                          <p className="text-sm text-gray-500">Manage your active sessions across devices</p>
                        </div>
                      </div>
                      <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Controller
                        name="preferences.email_notifications"
                        control={profileControl}
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

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <Controller
                        name="preferences.sms_notifications"
                        control={profileControl}
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

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                      </div>
                      <Controller
                        name="preferences.push_notifications"
                        control={profileControl}
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

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Marketing Emails</p>
                        <p className="text-sm text-gray-500">Receive promotional content and updates</p>
                      </div>
                      <Controller
                        name="preferences.marketing_emails"
                        control={profileControl}
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

                {/* Language & Region */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Language & Region</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <Controller
                        name="preferences.language"
                        control={profileControl}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <Controller
                        name="preferences.timezone"
                        control={profileControl}
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
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Account Created</span>
                      <span className="text-sm text-gray-900">{formatDate(mockUser.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Last Login</span>
                      <span className="text-sm text-gray-900">{formatDate(mockUser.last_login_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Account Type</span>
                      <span className="text-sm text-gray-900 capitalize">{mockUser.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Profile