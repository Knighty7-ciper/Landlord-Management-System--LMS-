import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import toast from 'react-hot-toast'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: 'super_admin' | 'landlord' | 'property_manager' | 'tenant' | 'maintenance_staff'
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
  email_verified: boolean
  phone_verified: boolean
  mfa_enabled: boolean
  avatar_url?: string
  preferences?: any
  last_login_at?: string
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
  // Actions
  initializeAuth: () => void
  login: (email: string, password: string, mfaToken?: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  setToken: (token: string) => void
  clearError: () => void
}

interface RegisterData {
  email: string
  first_name: string
  last_name: string
  password: string
  phone?: string
  role: 'landlord' | 'property_manager' | 'tenant' | 'maintenance_staff'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      initializeAuth: () => {
        const state = get()
        const token = state.token
        
        if (token) {
          // Token exists, check if valid
          checkAuthToken(token).catch(() => {
            set({ token: null, user: null, isAuthenticated: false })
          })
        }
      },

      login: async (email: string, password: string, mfaToken?: string) => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, mfa_token: mfaToken }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Login failed')
          }

          const { access_token, refresh_token, user, requires_mfa } = data

          if (requires_mfa) {
            set({ isLoading: false })
            return { requiresMfa: true }
          }

          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          // Store refresh token securely (in a real app, use httpOnly cookies)
          localStorage.setItem('refresh_token', refresh_token)

          toast.success(`Welcome back, ${user.first_name}!`)
          return { success: true }

        } catch (error: any) {
          const errorMessage = error.message || 'Login failed'
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          toast.error(errorMessage)
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Registration failed')
          }

          set({
            isLoading: false,
            error: null,
          })

          toast.success('Registration successful! Please check your email to verify your account.')
          return { success: true }

        } catch (error: any) {
          const errorMessage = error.message || 'Registration failed'
          set({
            isLoading: false,
            error: errorMessage,
          })
          toast.error(errorMessage)
          throw error
        }
      },

      logout: () => {
        // Clear all auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        })

        // Clear stored tokens
        localStorage.removeItem('refresh_token')

        toast.success('You have been logged out successfully')
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          })
        }
      },

      setToken: (token: string) => {
        set({ token })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)

// Helper function to check token validity
async function checkAuthToken(token: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Invalid token')
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error('Token check failed:', error)
    return null
  }
}