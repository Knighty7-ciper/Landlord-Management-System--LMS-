import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import axios from 'axios'
import toast from 'react-hot-toast'

interface ResetPasswordForm {
  password: string
  confirmPassword: string
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm<ResetPasswordForm>()

  const password = watch('password')

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false)
        return
      }

      try {
        await axios.post('/api/auth/validate-reset-token', { token })
        setIsValidToken(true)
      } catch (error) {
        console.error('Token validation error:', error)
        setIsValidToken(false)
        toast.error('Invalid or expired reset link')
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

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

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setIsLoading(true)

      await axios.post('/api/auth/reset-password', {
        token,
        password: data.password
      })

      toast.success('Password reset successfully!')
      navigate('/auth/login', {
        state: {
          message: 'Your password has been reset successfully. You can now sign in with your new password.',
          type: 'success'
        }
      })
    } catch (error: any) {
      console.error('Reset password error:', error)
      
      if (error.response?.status === 400) {
        setError('root', { message: 'Invalid or expired reset token' })
      } else {
        setError('root', { message: 'Failed to reset password. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <LoadingSpinner size="large" />
        </div>
        <p className="text-sm text-gray-600">Validating reset link...</p>
      </div>
    )
  }

  // Show error state for invalid token
  if (!isValidToken) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Invalid reset link
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            For security reasons, password reset links expire after 24 hours.
          </p>
          
          <Link
            to="/auth/forgot-password"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Request new reset link
          </Link>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <Link
            to="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          Reset your password
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Enter your new password below. Make sure it's strong and unique.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            New password
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
              placeholder="Enter new password"
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
                    className={`h-1 flex-1 rounded-full ${
                      level <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
                    }`}
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
            Confirm new password
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
              placeholder="Confirm new password"
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

        {/* Root Error */}
        {errors.root && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.root.message}</p>
              </div>
            </div>
          </div>
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
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Reset password
              </>
            )}
          </button>
        </div>

        {/* Back to login link */}
        <div className="text-center">
          <Link
            to="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ResetPassword