import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuthStore } from '@/context/auth-store'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import toast from 'react-hot-toast'

interface LoginForm {
  email: string
  password: string
  mfaToken?: string
}

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showMfaInput, setShowMfaInput] = useState(false)
  const [pendingCredentials, setPendingCredentials] = useState<{
    email: string
    password: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      if (!showMfaInput) {
        // First login attempt
        const result = await login(data.email, data.password)
        
        if (result?.requiresMfa) {
          setShowMfaInput(true)
          setPendingCredentials({ email: data.email, password: data.password })
          toast.success('Please enter your 6-digit MFA code')
        } else if (result?.success) {
          navigate('/dashboard')
        }
      } else {
        // Second attempt with MFA token
        if (!data.mfaToken) {
          setError('mfaToken', { message: 'MFA token is required' })
          return
        }

        if (pendingCredentials) {
          const result = await login(pendingCredentials.email, pendingCredentials.password, data.mfaToken)
          
          if (result?.success) {
            navigate('/dashboard')
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.message?.includes('MFA')) {
        setError('mfaToken', { message: 'Invalid MFA token' })
      }
    }
  }

  const handleResendMfa = async () => {
    // In a real app, this would trigger MFA code resend
    toast.success('MFA code sent to your email/phone')
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          {showMfaInput ? 'Enter MFA Code' : 'Sign in to your account'}
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          {showMfaInput 
            ? 'Enter the 6-digit code from your authenticator app'
            : 'Welcome back! Please sign in to your account'
          }
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
              disabled={showMfaInput}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        {!showMfaInput && (
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
                  }
                })}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your password"
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
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        )}

        {/* MFA Token Field */}
        {showMfaInput && (
          <div>
            <label htmlFor="mfaToken" className="block text-sm font-medium text-gray-700">
              6-Digit MFA Code
            </label>
            <div className="mt-1">
              <input
                {...register('mfaToken', {
                  required: showMfaInput ? 'MFA token is required' : false,
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: 'MFA token must be 6 digits'
                  }
                })}
                type="text"
                maxLength={6}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center tracking-widest text-lg font-mono"
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </div>
            {errors.mfaToken && (
              <p className="mt-2 text-sm text-red-600">{errors.mfaToken.message}</p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendMfa}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Didn't receive a code?
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMfaInput(false)
                  setPendingCredentials(null)
                }}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Use different account
              </button>
            </div>
          </div>
        )}

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          {!showMfaInput && (
            <div className="text-sm">
              <Link
                to="/auth/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </div>

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
              showMfaInput ? 'Verify Code' : 'Sign in'
            )}
          </button>
        </div>

        {/* Sign up link */}
        {!showMfaInput && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up here
              </Link>
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

export default Login