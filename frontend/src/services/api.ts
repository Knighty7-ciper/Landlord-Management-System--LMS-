import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/context/auth-store'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout()
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Generic API response type
interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

// Generic API error type
interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// =====================================================
// AUTHENTICATION SERVICES
// =====================================================

export const authService = {
  // Login
  login: async (email: string, password: string, mfaToken?: string) => {
    const response = await api.post('/auth/login', {
      email,
      password,
      mfa_token: mfaToken,
    })
    return response.data
  },

  // Register
  register: async (userData: {
    email: string
    first_name: string
    last_name: string
    password: string
    phone?: string
    role: string
  }) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', {
      token,
      password,
    })
    return response.data
  },

  // Verify email
  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token })
    return response.data
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.data
  },
}

// =====================================================
// PROPERTY SERVICES
// =====================================================

export interface Property {
  id: string
  name: string
  property_type: string
  monthly_rent: number
  deposit_amount?: number
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable'
  description?: string
  year_built?: number
  square_footage?: number
  bedrooms?: number
  bathrooms?: number
  parking_spaces?: number
  pet_policy: string
  smoking_policy: string
  utilities_included: string[]
  amenities: string[]
  address: {
    id: string
    street: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  details?: {
    id: string
    heating_type?: string
    cooling_type?: string
    flooring_types: string[]
    appliances: string[]
    laundry_type?: string
    storage_spaces: string[]
  }
  images: PropertyImage[]
  units: PropertyUnit[]
  created_at: string
  updated_at: string
}

export interface PropertyImage {
  id: string
  image_url: string
  thumbnail_url?: string
  original_filename?: string
  image_type: string
  is_primary: boolean
  sort_order: number
}

export interface PropertyUnit {
  id: string
  unit_number?: string
  unit_type?: string
  monthly_rent?: number
  bedrooms?: number
  bathrooms?: number
  square_footage?: number
  floor_level?: number
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable'
  description?: string
  features: string[]
}

export interface PropertySearchCriteria {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  property_type?: string
  status?: string
  min_price?: number
  max_price?: number
  city?: string
  state?: string
  min_bedrooms?: number
  max_bedrooms?: number
  min_bathrooms?: number
  max_bathrooms?: number
}

export const propertyService = {
  // Get all properties with filtering and pagination
  getProperties: async (criteria: PropertySearchCriteria = {}) => {
    const params = new URLSearchParams()
    
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await api.get(`/properties?${params.toString()}`)
    return response.data
  },

  // Get property by ID
  getProperty: async (id: string) => {
    const response = await api.get(`/properties/${id}`)
    return response.data
  },

  // Create new property
  createProperty: async (propertyData: {
    name: string
    property_type: string
    monthly_rent: number
    deposit_amount?: number
    description?: string
    year_built?: number
    square_footage?: number
    bedrooms?: number
    bathrooms?: number
    parking_spaces?: number
    pet_policy?: string
    smoking_policy?: string
    utilities_included?: string[]
    amenities?: string[]
    address: {
      street: string
      city: string
      state: string
      zip_code: string
      country?: string
    }
  }) => {
    const response = await api.post('/properties', propertyData)
    return response.data
  },

  // Update property
  updateProperty: async (id: string, propertyData: Partial<Property>) => {
    const response = await api.put(`/properties/${id}`, propertyData)
    return response.data
  },

  // Delete property
  deleteProperty: async (id: string) => {
    const response = await api.delete(`/properties/${id}`)
    return response.data
  },

  // Upload property images
  uploadImages: async (propertyId: string, files: File[]) => {
    const formData = new FormData()
    formData.append('property_id', propertyId)
    
    files.forEach((file, index) => {
      formData.append(`images`, file)
      formData.append(`image_types`, 'exterior') // Default type
      formData.append(`is_primary`, (index === 0).toString())
    })

    const response = await api.post(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Delete property image
  deleteImage: async (propertyId: string, imageId: string) => {
    const response = await api.delete(`/properties/${propertyId}/images/${imageId}`)
    return response.data
  },

  // Get property units
  getPropertyUnits: async (propertyId: string) => {
    const response = await api.get(`/properties/${propertyId}/units`)
    return response.data
  },

  // Create property unit
  createPropertyUnit: async (propertyId: string, unitData: {
    unit_number?: string
    unit_type?: string
    monthly_rent?: number
    bedrooms?: number
    bathrooms?: number
    square_footage?: number
    floor_level?: number
    description?: string
    features?: string[]
  }) => {
    const response = await api.post(`/properties/${propertyId}/units`, unitData)
    return response.data
  },
}

// =====================================================
// USER SERVICES
// =====================================================

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: string
  status: string
  email_verified: boolean
  phone_verified: boolean
  mfa_enabled: boolean
  avatar_url?: string
  preferences?: any
  created_at: string
  updated_at: string
}

export const userService = {
  // Get all users (admin only)
  getUsers: async (page = 1, limit = 20, search?: string, role?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    
    if (search) params.append('search', search)
    if (role) params.append('role', role)

    const response = await api.get(`/users?${params.toString()}`)
    return response.data
  },

  // Get user by ID
  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Update user
  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // Update current user
  updateCurrentUser: async (userData: Partial<User>) => {
    const response = await api.put('/users/me', userData)
    return response.data
  },

  // Deactivate user
  deactivateUser: async (id: string) => {
    const response = await api.patch(`/users/${id}/deactivate`)
    return response.data
  },

  // Activate user
  activateUser: async (id: string) => {
    const response = await api.patch(`/users/${id}/activate`)
    return response.data
  },

  // Delete user (soft delete)
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
}

// =====================================================
// MFA SERVICES
// =====================================================

export const mfaService = {
  // Enable MFA
  enableMfa: async () => {
    const response = await api.post('/mfa/enable')
    return response.data
  },

  // Verify MFA setup
  verifyMfaSetup: async (token: string) => {
    const response = await api.post('/mfa/verify-setup', { token })
    return response.data
  },

  // Disable MFA
  disableMfa: async (password: string) => {
    const response = await api.post('/mfa/disable', { password })
    return response.data
  },

  // Generate backup codes
  generateBackupCodes: async () => {
    const response = await api.post('/mfa/backup-codes')
    return response.data
  },
}

// =====================================================
// TENANT SERVICES
// =====================================================

export interface Tenant {
  id: string
  landlord_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  ssn?: string
  employment_status: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student'
  monthly_income?: number
  credit_score?: number
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  background_check_status: 'pending' | 'approved' | 'rejected' | 'not_required'
  application_status: 'pending' | 'approved' | 'rejected' | 'active_tenant'
  lease_id?: string
  current_property_id?: string
  current_unit_id?: string
  move_in_date?: string
  move_out_date?: string
  notes?: string
  status: 'active' | 'inactive' | 'moved_out' | 'evicted'
  created_at: string
  updated_at: string
}

export interface TenantCreateData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  employment_status: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student'
  monthly_income?: number
  credit_score?: number
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  notes?: string
}

export interface TenantSearchCriteria {
  page?: number
  limit?: number
  search?: string
  status?: string
  property_id?: string
  employment_status?: string
  credit_score_min?: number
  credit_score_max?: number
}

export const tenantService = {
  // Get all tenants
  getAll: async (criteria: TenantSearchCriteria = {}) => {
    const params = new URLSearchParams()
    
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await api.get(`/tenants?${params.toString()}`)
    return response.data
  },

  // Get tenant by ID
  getById: async (id: string) => {
    const response = await api.get(`/tenants/${id}`)
    return response.data
  },

  // Create new tenant
  create: async (data: TenantCreateData) => {
    const response = await api.post('/tenants', data)
    return response.data
  },

  // Update tenant
  update: async (id: string, data: Partial<TenantCreateData>) => {
    const response = await api.put(`/tenants/${id}`, data)
    return response.data
  },

  // Delete tenant
  delete: async (id: string) => {
    const response = await api.delete(`/tenants/${id}`)
    return response.data
  },

  // Get tenant documents
  getDocuments: async (tenantId: string) => {
    const response = await api.get(`/tenants/${tenantId}/documents`)
    return response.data
  },

  // Upload tenant document
  uploadDocument: async (tenantId: string, file: File, documentType: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', documentType)
    formData.append('tenant_id', tenantId)

    const response = await api.post(`/tenants/${tenantId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get tenant payment history
  getPaymentHistory: async (tenantId: string) => {
    const response = await api.get(`/tenants/${tenantId}/payments`)
    return response.data
  },

  // Get tenant lease history
  getLeaseHistory: async (tenantId: string) => {
    const response = await api.get(`/tenants/${tenantId}/leases`)
    return response.data
  },
}

// =====================================================
// LEASE SERVICES
// =====================================================

export interface Lease {
  id: string
  property_id: string
  unit_id?: string
  tenant_id: string
  landlord_id: string
  start_date: string
  end_date: string
  monthly_rent: number
  security_deposit: number
  pet_deposit: number
  late_fee_grace_period: number
  late_fee_amount?: number
  rent_due_day: number
  payment_frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
  lease_type: 'fixed_term' | 'month_to_month' | 'week_to_week'
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated' | 'renewed'
  renewal_notice_date?: string
  auto_renewal: boolean
  terms_and_conditions?: string
  special_clauses?: string[]
  utilities_included?: string[]
  parking_included: boolean
  pet_policy?: string
  smoking_policy?: string
  guest_policy?: string
  maintenance_responsibility?: string
  insurance_required: boolean
  lease_document_url?: string
  signatures: {
    tenant_signed: boolean
    landlord_signed: boolean
    tenant_signed_date?: string
    landlord_signed_date?: string
  }
  created_at: string
  updated_at: string
}

export interface LeaseCreateData {
  property_id: string
  unit_id?: string
  tenant_id: string
  start_date: string
  end_date: string
  monthly_rent: number
  security_deposit: number
  pet_deposit?: number
  late_fee_grace_period?: number
  late_fee_amount?: number
  rent_due_day: number
  payment_frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
  lease_type: 'fixed_term' | 'month_to_month' | 'week_to_week'
  auto_renewal: boolean
  terms_and_conditions?: string
  special_clauses?: string[]
  utilities_included?: string[]
  parking_included: boolean
  pet_policy?: string
  smoking_policy?: string
  guest_policy?: string
  maintenance_responsibility?: string
  insurance_required: boolean
}

export interface LeaseSearchCriteria {
  page?: number
  limit?: number
  status?: string
  property_id?: string
  tenant_id?: string
  landlord_id?: string
  expiring_within_days?: number
  start_date_from?: string
  start_date_to?: string
}

export const leaseService = {
  // Get all leases
  getAll: async (criteria: LeaseSearchCriteria = {}) => {
    const params = new URLSearchParams()
    
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await api.get(`/leases?${params.toString()}`)
    return response.data
  },

  // Get lease by ID
  getById: async (id: string) => {
    const response = await api.get(`/leases/${id}`)
    return response.data
  },

  // Create new lease
  create: async (data: LeaseCreateData) => {
    const response = await api.post('/leases', data)
    return response.data
  },

  // Update lease
  update: async (id: string, data: Partial<LeaseCreateData>) => {
    const response = await api.put(`/leases/${id}`, data)
    return response.data
  },

  // Delete lease
  delete: async (id: string) => {
    const response = await api.delete(`/leases/${id}`)
    return response.data
  },

  // Renew lease
  renew: async (id: string, renewalData: {
    end_date: string
    monthly_rent: number
    terms_and_conditions?: string
  }) => {
    const response = await api.post(`/leases/${id}/renew`, renewalData)
    return response.data
  },

  // Terminate lease
  terminate: async (id: string, terminationData: {
    termination_date: string
    reason: string
    notice_period_days: number
  }) => {
    const response = await api.post(`/leases/${id}/terminate`, terminationData)
    return response.data
  },

  // Get expiring leases
  getExpiringLeases: async (days: number = 30) => {
    const response = await api.get(`/leases/expiring?days=${days}`)
    return response.data
  },

  // Generate lease document
  generateDocument: async (id: string) => {
    const response = await api.post(`/leases/${id}/generate-document`)
    return response.data
  },

  // Sign lease (tenant or landlord)
  signLease: async (id: string, signerType: 'tenant' | 'landlord', signature: string) => {
    const response = await api.post(`/leases/${id}/sign`, {
      signer_type: signerType,
      signature: signature
    })
    return response.data
  },
}

// =====================================================
// MAINTENANCE SERVICES
// =====================================================

export interface MaintenanceRequest {
  id: string
  property_id: string
  unit_id?: string
  tenant_id?: string
  landlord_id: string
  maintenance_type: 'routine' | 'urgent' | 'emergency' | 'preventive'
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'painting' | 'flooring' | 'security' | 'landscaping' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  reported_date: string
  scheduled_date?: string
  completed_date?: string
  estimated_cost?: number
  actual_cost?: number
  status: 'reported' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to?: string
  vendor_id?: string
  work_description?: string
  materials_used?: string[]
  before_images?: string[]
  after_images?: string[]
  tenant_access_required: boolean
  tenant_notified: boolean
  landlord_notified: boolean
  warranty_expiration?: string
  follow_up_required: boolean
  follow_up_date?: string
  satisfaction_rating?: number
  satisfaction_feedback?: string
  created_at: string
  updated_at: string
}

export interface MaintenanceRequestCreateData {
  property_id: string
  unit_id?: string
  tenant_id?: string
  maintenance_type: 'routine' | 'urgent' | 'emergency' | 'preventive'
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'painting' | 'flooring' | 'security' | 'landscaping' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  scheduled_date?: string
  estimated_cost?: number
  tenant_access_required: boolean
  photos?: File[]
}

export interface MaintenanceRequestSearchCriteria {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  property_id?: string
  tenant_id?: string
  assigned_to?: string
  date_from?: string
  date_to?: string
}

export const maintenanceService = {
  // Get all maintenance requests
  getAll: async (criteria: MaintenanceRequestSearchCriteria = {}) => {
    const params = new URLSearchParams()
    
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await api.get(`/maintenance/requests?${params.toString()}`)
    return response.data
  },

  // Get maintenance request by ID
  getById: async (id: string) => {
    const response = await api.get(`/maintenance/requests/${id}`)
    return response.data
  },

  // Create new maintenance request
  create: async (data: MaintenanceRequestCreateData) => {
    const formData = new FormData()
    
    // Add form data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'photos' && Array.isArray(value)) {
        // Handle photos separately
        value.forEach((photo, index) => {
          formData.append(`photos`, photo)
        })
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    })

    const response = await api.post('/maintenance/requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Update maintenance request
  update: async (id: string, data: Partial<MaintenanceRequestCreateData>) => {
    const response = await api.put(`/maintenance/requests/${id}`, data)
    return response.data
  },

  // Delete maintenance request
  delete: async (id: string) => {
    const response = await api.delete(`/maintenance/requests/${id}`)
    return response.data
  },

  // Assign vendor
  assignVendor: async (requestId: string, vendorId: string, scheduledDate?: string) => {
    const response = await api.post(`/maintenance/requests/${requestId}/assign`, {
      vendor_id: vendorId,
      scheduled_date: scheduledDate
    })
    return response.data
  },

  // Update status
  updateStatus: async (id: string, status: string, workDescription?: string, actualCost?: number) => {
    const response = await api.patch(`/maintenance/requests/${id}/status`, {
      status,
      work_description: workDescription,
      actual_cost: actualCost
    })
    return response.data
  },

  // Upload photos
  uploadPhotos: async (requestId: string, files: File[], photoType: 'before' | 'after' | 'during' = 'during') => {
    const formData = new FormData()
    
    files.forEach((file, index) => {
      formData.append(`photos`, file)
      formData.append(`photo_types`, photoType)
    })

    const response = await api.post(`/maintenance/requests/${requestId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get vendor recommendations
  getVendorRecommendations: async (category: string, propertyId: string) => {
    const response = await api.get(`/maintenance/vendors/recommendations`, {
      params: { category, property_id: propertyId }
    })
    return response.data
  },

  // Schedule maintenance
  scheduleMaintenance: async (requestId: string, scheduledDate: string, vendorId?: string) => {
    const response = await api.post(`/maintenance/requests/${requestId}/schedule`, {
      scheduled_date: scheduledDate,
      vendor_id: vendorId
    })
    return response.data
  },
}

// =====================================================
// PAYMENT SERVICES
// =====================================================

export interface Payment {
  id: string
  lease_id: string
  tenant_id: string
  landlord_id: string
  property_id: string
  payment_type: 'rent' | 'security_deposit' | 'pet_deposit' | 'late_fee' | 'utility' | 'other'
  amount: number
  due_date: string
  paid_date?: string
  payment_method?: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'ach' | 'online'
  payment_status: 'pending' | 'paid' | 'late' | 'partial' | 'failed' | 'refunded'
  transaction_id?: string
  check_number?: string
  bank_name?: string
  account_number_masked?: string
  late_fee_applied?: number
  payment_discount?: number
  notes?: string
  receipt_number?: string
  payment_plan_id?: string
  recurring_payment_id?: string
  created_at: string
  updated_at: string
}

export interface PaymentCreateData {
  lease_id: string
  payment_type: 'rent' | 'security_deposit' | 'pet_deposit' | 'late_fee' | 'utility' | 'other'
  amount: number
  due_date: string
  payment_method?: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'ach' | 'online'
  check_number?: string
  bank_name?: string
  account_number_masked?: string
  notes?: string
  late_fee_applied?: number
  payment_discount?: number
}

export interface PaymentSearchCriteria {
  page?: number
  limit?: number
  payment_status?: string
  payment_type?: string
  tenant_id?: string
  property_id?: string
  lease_id?: string
  date_from?: string
  date_to?: string
  min_amount?: number
  max_amount?: number
}

export const paymentService = {
  // Get all payments
  getAll: async (criteria: PaymentSearchCriteria = {}) => {
    const params = new URLSearchParams()
    
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await api.get(`/payments?${params.toString()}`)
    return response.data
  },

  // Get payment by ID
  getById: async (id: string) => {
    const response = await api.get(`/payments/${id}`)
    return response.data
  },

  // Create new payment
  create: async (data: PaymentCreateData) => {
    const response = await api.post('/payments', data)
    return response.data
  },

  // Update payment
  update: async (id: string, data: Partial<PaymentCreateData>) => {
    const response = await api.put(`/payments/${id}`, data)
    return response.data
  },

  // Delete payment
  delete: async (id: string) => {
    const response = await api.delete(`/payments/${id}`)
    return response.data
  },

  // Record payment
  recordPayment: async (id: string, paymentData: {
    amount_paid: number
    payment_method: string
    paid_date: string
    transaction_id?: string
    check_number?: string
    notes?: string
  }) => {
    const response = await api.post(`/payments/${id}/record`, paymentData)
    return response.data
  },

  // Get payments by tenant
  getByTenant: async (tenantId: string, limit?: number) => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    
    const response = await api.get(`/payments/tenant/${tenantId}?${params.toString()}`)
    return response.data
  },

  // Get payments by lease
  getByLease: async (leaseId: string) => {
    const response = await api.get(`/payments/lease/${leaseId}`)
    return response.data
  },

  // Generate receipt
  generateReceipt: async (paymentId: string) => {
    const response = await api.post(`/payments/${paymentId}/receipt`)
    return response.data
  },

  // Process refund
  processRefund: async (paymentId: string, refundData: {
    amount: number
    reason: string
    refund_method: string
  }) => {
    const response = await api.post(`/payments/${paymentId}/refund`, refundData)
    return response.data
  },

  // Get outstanding payments
  getOutstanding: async (tenantId?: string) => {
    const params = new URLSearchParams()
    if (tenantId) params.append('tenant_id', tenantId)
    
    const response = await api.get(`/payments/outstanding?${params.toString()}`)
    return response.data
  },

  // Calculate late fees
  calculateLateFees: async (propertyId?: string, tenantId?: string) => {
    const params = new URLSearchParams()
    if (propertyId) params.append('property_id', propertyId)
    if (tenantId) params.append('tenant_id', tenantId)
    
    const response = await api.post(`/payments/calculate-late-fees?${params.toString()}`)
    return response.data
  },
}

// =====================================================
// REPORT SERVICES
// =====================================================

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'financial' | 'property' | 'tenant' | 'maintenance' | 'occupancy' | 'compliance'
  parameters: ReportParameter[]
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
    day_of_week?: number
    day_of_month?: number
    enabled: boolean
  }
  recipients?: string[]
  format: 'pdf' | 'excel' | 'csv' | 'json'
  created_at: string
  updated_at: string
}

export interface ReportParameter {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect'
  required: boolean
  default_value?: any
  options?: { value: string; label: string }[]
  description?: string
}

export interface ReportData {
  generated_at: string
  template_id: string
  parameters: Record<string, any>
  data: any[]
  metadata: {
    total_records: number
    date_range?: {
      start_date: string
      end_date: string
    }
    filters_applied?: Record<string, any>
  }
}

export interface ReportGenerationRequest {
  template_id: string
  parameters: Record<string, any>
  format: 'pdf' | 'excel' | 'csv' | 'json'
  email_recipients?: string[]
}

export const reportService = {
  // Get all report templates
  getTemplates: async () => {
    const response = await api.get('/reports/templates')
    return response.data
  },

  // Get report template by ID
  getTemplate: async (id: string) => {
    const response = await api.get(`/reports/templates/${id}`)
    return response.data
  },

  // Generate report
  generate: async (request: ReportGenerationRequest) => {
    const response = await api.post('/reports/generate', request)
    return response.data
  },

  // Download report
  download: async (reportId: string, format: 'pdf' | 'excel' | 'csv' | 'json') => {
    const response = await api.get(`/reports/${reportId}/download`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  },

  // Get generated reports
  getGeneratedReports: async (templateId?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (templateId) params.append('template_id', templateId)
    if (limit) params.append('limit', limit.toString())
    
    const response = await api.get(`/reports?${params.toString()}`)
    return response.data
  },

  // Export data to PDF
  exportPDF: async (data: any[], filename: string) => {
    const response = await api.post('/reports/export/pdf', {
      data,
      filename
    }, {
      responseType: 'blob'
    })
    return response.data
  },

  // Export data to Excel
  exportExcel: async (data: any[], filename: string) => {
    const response = await api.post('/reports/export/excel', {
      data,
      filename
    }, {
      responseType: 'blob'
    })
    return response.data
  },

  // Get financial summary
  getFinancialSummary: async (dateRange: { start_date: string; end_date: string }, propertyId?: string) => {
    const params = new URLSearchParams({
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    })
    if (propertyId) params.append('property_id', propertyId)
    
    const response = await api.get(`/reports/financial-summary?${params.toString()}`)
    return response.data
  },

  // Get occupancy report
  getOccupancyReport: async (propertyId?: string) => {
    const params = new URLSearchParams()
    if (propertyId) params.append('property_id', propertyId)
    
    const response = await api.get(`/reports/occupancy?${params.toString()}`)
    return response.data
  },

  // Get maintenance report
  getMaintenanceReport: async (dateRange: { start_date: string; end_date: string }, propertyId?: string) => {
    const params = new URLSearchParams({
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    })
    if (propertyId) params.append('property_id', propertyId)
    
    const response = await api.get(`/reports/maintenance?${params.toString()}`)
    return response.data
  },
}

// =====================================================
// DOCUMENT SERVICES
// =====================================================

export interface Document {
  id: string
  entity_type: 'tenant' | 'property' | 'lease' | 'payment' | 'maintenance' | 'user'
  entity_id: string
  document_type: string
  name: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: string
  access_level: 'public' | 'private' | 'restricted'
  tags?: string[]
  expiry_date?: string
  is_digital_signature_required: boolean
  signature_status?: 'pending' | 'signed' | 'declined'
  version: number
  parent_document_id?: string
  created_at: string
  updated_at: string
}

export interface DocumentCreateData {
  entity_type: 'tenant' | 'property' | 'lease' | 'payment' | 'maintenance' | 'user'
  entity_id: string
  document_type: string
  name: string
  access_level: 'public' | 'private' | 'restricted'
  tags?: string[]
  expiry_date?: string
  is_digital_signature_required: boolean
}

export const documentService = {
  // Get all documents
  getAll: async (entityType?: string, entityId?: string, limit = 50) => {
    const params = new URLSearchParams({
      limit: limit.toString()
    })
    
    if (entityType) params.append('entity_type', entityType)
    if (entityId) params.append('entity_id', entityId)
    
    const response = await api.get(`/documents?${params.toString()}`)
    return response.data
  },

  // Get document by ID
  getById: async (id: string) => {
    const response = await api.get(`/documents/${id}`)
    return response.data
  },

  // Upload document
  upload: async (entityType: string, entityId: string, file: File, documentData: {
    document_type: string
    name: string
    access_level: 'public' | 'private' | 'restricted'
    tags?: string[]
    expiry_date?: string
    is_digital_signature_required?: boolean
  }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entity_type', entityType)
    formData.append('entity_id', entityId)
    
    Object.entries(documentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, item))
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Update document
  update: async (id: string, data: Partial<DocumentCreateData>) => {
    const response = await api.put(`/documents/${id}`, data)
    return response.data
  },

  // Delete document
  delete: async (id: string) => {
    const response = await api.delete(`/documents/${id}`)
    return response.data
  },

  // Download document
  download: async (id: string) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Get documents by entity
  getByEntity: async (entityType: string, entityId: string) => {
    const response = await api.get(`/documents/entity/${entityType}/${entityId}`)
    return response.data
  },

  // Request digital signature
  requestSignature: async (documentId: string, signers: string[]) => {
    const response = await api.post(`/documents/${documentId}/request-signature`, {
      signers
    })
    return response.data
  },

  // Sign document
  signDocument: async (documentId: string, signature: string, signerId: string) => {
    const response = await api.post(`/documents/${documentId}/sign`, {
      signature,
      signer_id: signerId
    })
    return response.data
  },

  // Get document status
  getSignatureStatus: async (documentId: string) => {
    const response = await api.get(`/documents/${documentId}/signature-status`)
    return response.data
  },

  // Share document
  shareDocument: async (documentId: string, shareData: {
    email: string
    access_level: 'view' | 'download' | 'sign'
    expiry_date?: string
  }) => {
    const response = await api.post(`/documents/${documentId}/share`, shareData)
    return response.data
  },
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Check if user has required role
export const hasRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole)
}

// Check if user has required permission (role hierarchy)
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    super_admin: 5,
    landlord: 4,
    property_manager: 3,
    maintenance_staff: 2,
    tenant: 1,
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

  return userLevel >= requiredLevel
}

export default api