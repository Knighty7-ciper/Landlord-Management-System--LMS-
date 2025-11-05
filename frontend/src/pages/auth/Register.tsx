import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react'
import { useAuthStore } from '@/context/auth-store'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { clsx } from 'clsx'

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
  role: 'landlord' | 'property_manager' | 'tenant' | 'maintenance_staff'
  termsAccepted: boolean
}

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RegisterForm>({
    defaultValues: {
      role: 'landlord',
      termsAccepted: false
    }
  })

  const password = watch('password')

  const roleOptions = [
    { value: 'landlord', label: 'Landlord', description: 'Own and manage rental properties' },
    { value: 'property_manager', label: 'Property Manager', description: 'Manage properties for landlords' },
    { value: 'tenant', label: 'Tenant', description: 'Looking for rental properties' },
    { value: 'maintenance_staff', label: 'Maintenance Staff', description: 'Handle property maintenance' }
  ]

  const passwordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const strength = password ? passwordStrength(password) : 0
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role
      })

      // Registration successful - redirect to login
      navigate('/auth/login', {
        state: { 
          message: 'Registration successful! Please check your email to verify your account.',
          type: 'success'
        }
      })
    } catch (error: any) {
      console.error('Registration error:', error)
      // Error handling is done in the auth store with toast notifications
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          Create your account
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Join thousands of property professionals who trust our platform
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            I am a:
          </label>
          <div className="grid grid-cols-1 gap-3">
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none',
                  'border-gray-300 hover:border-gray-400',
                  errors.role ? 'border-red-300' : ''
                )}
              >
                <input
                  {...register('role', { required: 'Please select your role' })}
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  onChange={() => setValue('role', option.value as any)}
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                    <span className="mt-1 flex items-center text-xs text-gray-500">
                      {option.description}
                    </span>
                  </span>
                </span>
                <span
                  className={clsx(
                    'ml-3 flex h-5 w-5 items-center justify-center rounded-full border',
                    'border-gray-300 bg-white',
                    'peer-checked:border-blue-600 peer-checked:bg-blue-600'
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-white opacity-0 peer-checked:opacity-100"></span>
                </span>
              </label>
            ))}
          </div>
          {errors.role && (
            <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First name
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('firstName', {
                  required: 'First name is required',
                  minLength: {
                    value: 2,
                    message: 'First name must be at least 2 characters'
                  }
                })}
                type="text"
                autoComplete="given-name"
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your first name"
              />
            </div>
            {errors.firstName && (
              <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last name
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('lastName', {
                  required: 'Last name is required',
                  minLength: {
                    value: 2,
                    message: 'Last name must be at least 2 characters'
                  }
                })}
                type="text"
                autoComplete="family-name"
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your last name"
              />
            </div>
            {errors.lastName && (
              <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              autoComplete="email"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone number <span className="text-gray-500">(optional)</span>
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('phone', {
                pattern: {
                  value: /^[\+]?[\d\s\-\(\)]{10,}$/,
                  message: 'Invalid phone number'
                }
              })}
              type="tel"
              autoComplete="tel"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="(555) 123-4567"
            />
          </div>
          {errors.phone && (
            <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                validate: {
                  hasUpperCase: (value) =>
                    /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                  hasLowerCase: (value) =>
                    /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
                  hasNumber: (value) =>
                    /\d/.test(value) || 'Password must contain at least one number',
                  hasSpecialChar: (value) =>
                    /[^A-Za-z0-9]/.test(value) || 'Password must contain at least one special character'
                }
              })}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={clsx(
                      'h-1 flex-1 rounded-full',
                      level <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
                    )}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Password strength: {strengthLabels[strength - 1] || 'Very Weak'}
              </p>
            </div>
          )}

          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match'
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-center">
          <input
            {...register('termsAccepted', {
              required: 'You must accept the terms and conditions'
            })}
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="mt-2 text-sm text-red-600">{errors.termsAccepted.message}</p>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              'Create account'
            )}
          </button>
        </div>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Register