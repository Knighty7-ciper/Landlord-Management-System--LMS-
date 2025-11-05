/**
 * Integration Tests for Frontend
 * Tests complete user flows and API integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import App from '../App'
import { useAuthStore } from '../context/auth-store'
import * as apiService from '../services/api'

// Mock API responses
const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'landlord',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    mfa_enabled: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockProperties = [
  {
    id: '1',
    name: 'Test Property',
    property_type: 'APARTMENT',
    monthly_rent: 1500,
    status: 'available',
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 1200,
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip_code: '12345'
    },
    units_total: 10,
    units_occupied: 8,
    created_at: '2024-01-01T00:00:00Z'
  }
]

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock API service
vi.mock('../services/api', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  propertyService: {
    getProperties: vi.fn(),
  },
}))

describe('Frontend Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Authentication Flow', () => {
    it('should navigate to login when accessing protected route without authentication', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Try to access protected route
      window.history.pushState({}, 'Test', '/dashboard')
      fireEvent(window, new PopStateEvent('popstate'))

      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
      })
    })

    it('should successfully log in user', async () => {
      const mockLoginResponse = {
        access_token: 'fake-jwt-token',
        refresh_token: 'fake-refresh-token',
        user: mockUsers[0],
        success: true
      }

      vi.mocked(apiService.authService.login).mockResolvedValue(mockLoginResponse)

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Navigate to login page
      window.history.pushState({}, 'Test', '/auth/login')
      fireEvent(window, new PopStateEvent('popstate'))

      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
      })

      // Fill login form
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(apiService.authService.login).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          undefined
        )
      })
    })

    it('should handle login with MFA', async () => {
      const mockLoginResponse = {
        requires_mfa: true,
        success: false
      }

      vi.mocked(apiService.authService.login).mockResolvedValue(mockLoginResponse)

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      window.history.pushState({}, 'Test', '/auth/login')
      fireEvent(window, new PopStateEvent('popstate'))

      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/enter mfa code/i)).toBeInTheDocument()
      })

      const mfaInput = screen.getByLabelText(/6-digit mfa code/i)
      const verifyButton = screen.getByRole('button', { name: /verify code/i })

      fireEvent.change(mfaInput, { target: { value: '123456' } })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(apiService.authService.login).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          '123456'
        )
      })
    })
  })

  describe('Registration Flow', () => {
    it('should successfully register a new user', async () => {
      const mockRegisterResponse = {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.'
      }

      vi.mocked(apiService.authService.register).mockResolvedValue(mockRegisterResponse)

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      window.history.pushState({}, 'Test', '/auth/register')
      fireEvent(window, new PopStateEvent('popstate'))

      await waitFor(() => {
        expect(screen.getByText(/create your account/i)).toBeInTheDocument()
      })

      // Fill registration form
      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const landlordRadio = screen.getByLabelText(/landlord/i)
      const termsCheckbox = screen.getByLabelText(/i agree to the/i)
      const registerButton = screen.getByRole('button', { name: /create account/i })

      fireEvent.change(firstNameInput, { target: { value: 'John' } })
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePass123!' } })
      fireEvent.click(landlordRadio)
      fireEvent.click(termsCheckbox)
      fireEvent.click(registerButton)

      await waitFor(() => {
        expect(apiService.authService.register).toHaveBeenCalledWith({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!',
          role: 'landlord'
        })
      })
    })
  })

  describe('Dashboard Functionality', () => {
    it('should display dashboard with user data when authenticated', async () => {
      // Mock authenticated state
      const { setAuthState } = useAuthStore.getState()
      setAuthState({
        user: mockUsers[0],
        token: 'fake-jwt-token',
        isAuthenticated: true
      })

      // Mock API responses
      vi.mocked(apiService.authService.getCurrentUser).mockResolvedValue({
        user: mockUsers[0]
      })

      vi.mocked(apiService.propertyService.getProperties).mockResolvedValue({
        data: mockProperties,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_next: false,
          has_prev: false
        }
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      window.history.pushState({}, 'Test', '/dashboard')
      fireEvent(window, new PopStateEvent('popstate'))

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
        expect(screen.getByText('12')).toBeInTheDocument() // Total properties
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })
    })
  })

  describe('Property Management', () => {
    it('should display properties list when authenticated', async () => {
      // Mock authenticated state
      const { setAuthState } = useAuthStore.getState()
      setAuthState({
        user: mockUsers[0],
        token: 'fake-jwt-token',
        isAuthenticated: true
      })

      // Mock API response
      vi.mocked(apiService.propertyService.getProperties).mockResolvedValue({
        data: mockProperties,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_next: false,
          has_prev: false
        }
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      window.history.pushState({}, 'Test', '/properties')
      fireEvent(window, new PopstateEvent('popstate'))

      await waitFor(() => {
        expect(screen.getByText(/properties/i)).toBeInTheDocument()
        expect(screen.getByText('Test Property')).toBeInTheDocument()
        expect(screen.getByText(/test city/i)).toBeInTheDocument()
      })
    })

    it('should filter properties by search term', async () => {
      // Mock authenticated state
      const { setAuthState } = useAuthStore.getState()
      setAuthState({
        user: mockUsers[0],
        token: 'fake-jwt-token',
        isAuthenticated: true
      })

      // Mock API response
      vi.mocked(apiService.propertyService.getProperties).mockResolvedValue({
        data: mockProperties,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_next: false,
          has_prev: false
        }
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      window.history.pushState({}, 'Test', '/properties')
      fireEvent(window, new PopstateEvent('popstate'))

      await waitFor(() => {
        expect(screen.getByText(/properties/i)).toBeInTheDocument()
      })

      // Search for properties
      const searchInput = screen.getByPlaceholderText(/search properties/i)
      fireEvent.change(searchInput, { target: { value: 'Test' } })

      await waitFor(() => {
        expect(apiService.propertyService.getProperties).toHaveBeenCalledWith({
          search: 'Test'
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock API error
      vi.mocked(apiService.authService.login).mockRejectedValue(
        new Error('Invalid credentials')
      )

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      window.history.pushState({}, 'Test', '/auth/login')
      fireEvent(window, new PopstateEvent('popstate'))

      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should show loading states during API calls', async () => {
      // Mock slow API response
      vi.mocked(apiService.authService.login).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      window.history.pushState({}, 'Test', '/auth/login')
      fireEvent(window, new PopstateEvent('popstate'))

      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(loginButton)

      // Check for loading spinner
      await waitFor(() => {
        expect(screen.getByRole('button', { disabled: true })).toBeInTheDocument()
      })
    })
  })
})