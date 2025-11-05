import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/context/auth-store'
import { useQuery } from 'react-query'

// Layout Components
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'

// Pages
import Home from '@/pages/Home'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import Dashboard from '@/pages/Dashboard'
import Properties from '@/pages/Properties'
import PropertyDetails from '@/pages/PropertyDetails'
import PropertyForm from '@/pages/PropertyForm'
import Tenants from '@/pages/Tenants'
import TenantDetails from '@/pages/TenantDetails'
import LeaseManagement from '@/pages/LeaseManagement'
import FinancialDashboard from '@/pages/FinancialDashboard'
import MaintenanceRequests from '@/pages/MaintenanceRequests'
import MaintenanceDetails from '@/pages/MaintenanceDetails'
import Reports from '@/pages/Reports'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'
import ErrorBoundary from '@/components/common/ErrorBoundary'

// Loading Component
import LoadingSpinner from '@/components/common/LoadingSpinner'

function App() {
  const { user, token, initializeAuth, logout } = useAuthStore()

  // Check authentication status on app load
  const { data: authData, isLoading, error } = useQuery(
    'auth-check',
    async () => {
      if (!token) return null
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          logout()
          return null
        }
        throw new Error('Authentication check failed')
      }

      return response.json()
    },
    {
      enabled: !!token,
      retry: false,
      staleTime: 0,
    }
  )

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      logout()
    }
  }, [error, logout])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) {
      return <Navigate to="/auth/login" replace />
    }
    return <>{children}</>
  }

  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (user) {
      return <Navigate to="/dashboard" replace />
    }
    return <>{children}</>
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />

          {/* Authentication Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route
              path="login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="reset-password/:token"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />
          </Route>

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Property Management Routes */}
          <Route
            path="/properties"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Properties />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PropertyForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PropertyDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:id/edit"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PropertyForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Tenant Management Routes */}
          <Route
            path="/tenants"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Tenants />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenants/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TenantDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Lease Management Routes */}
          <Route
            path="/leases"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LeaseManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Financial Management Routes */}
          <Route
            path="/financial"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FinancialDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Maintenance Management Routes */}
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MaintenanceRequests />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MaintenanceDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Reports Routes */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* User Profile & Settings Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App