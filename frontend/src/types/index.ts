// =====================================================
// CORE USER TYPES
// =====================================================

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: UserRole
  status: UserStatus
  email_verified: boolean
  phone_verified: boolean
  mfa_enabled: boolean
  avatar_url?: string
  preferences?: Record<string, any>
  last_login_at?: string
  created_at: string
  updated_at: string
}

export type UserRole = 
  | 'super_admin'
  | 'landlord'
  | 'property_manager'
  | 'tenant'
  | 'maintenance_staff'

export type UserStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending_verification'

// =====================================================
// AUTH TYPES
// =====================================================

export interface LoginCredentials {
  email: string
  password: string
  mfa_token?: string
}

export interface RegisterData {
  email: string
  first_name: string
  last_name: string
  password: string
  phone?: string
  role: 'landlord' | 'property_manager' | 'tenant' | 'maintenance_staff'
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
  requires_mfa?: boolean
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetData {
  token: string
  password: string
  confirm_password: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
  confirm_password: string
}

// =====================================================
// PROPERTY TYPES
// =====================================================

export interface Property {
  id: string
  landlord_id: string
  name: string
  property_type: PropertyType
  monthly_rent: number
  deposit_amount?: number
  status: PropertyStatus
  description?: string
  year_built?: number
  square_footage?: number
  bedrooms?: number
  bathrooms?: number
  parking_spaces?: number
  pet_policy: PetPolicy
  smoking_policy: SmokingPolicy
  utilities_included: string[]
  amenities: string[]
  restrictions?: string
  address: PropertyAddress
  details?: PropertyDetails
  images: PropertyImage[]
  units: PropertyUnit[]
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export type PropertyType = 
  | 'SINGLE_FAMILY'
  | 'MULTI_FAMILY'
  | 'APARTMENT'
  | 'CONDO'
  | 'TOWNHOUSE'
  | 'COMMERCIAL'

export type PropertyStatus = 
  | 'available'
  | 'occupied'
  | 'maintenance'
  | 'unavailable'

export type PetPolicy = 
  | 'no_pets'
  | 'cats_allowed'
  | 'dogs_allowed'
  | 'all_pets_allowed'

export type SmokingPolicy = 
  | 'no_smoking'
  | 'smoking_allowed'
  | 'designated_areas'

export interface PropertyAddress {
  id: string
  property_id: string
  street: string
  city: string
  state: string
  zip_code: string
  country: string
  latitude?: number
  longitude?: number
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface PropertyDetails {
  id: string
  property_id: string
  heating_type?: string
  cooling_type?: string
  flooring_types: string[]
  appliances: string[]
  laundry_type?: string
  storage_spaces: string[]
  accessibility_features: string[]
  energy_efficiency_rating?: string
  property_condition: string
  last_renovation_date?: string
  property_features: string[]
  created_at: string
  updated_at: string
}

export interface PropertyImage {
  id: string
  property_id: string
  unit_id?: string
  image_url: string
  thumbnail_url?: string
  original_filename?: string
  file_size?: number
  mime_type?: string
  image_type: ImageType
  is_primary: boolean
  sort_order: number
  uploaded_by?: string
  created_at: string
}

export type ImageType = 
  | 'exterior'
  | 'interior'
  | 'kitchen'
  | 'bathroom'
  | 'bedroom'
  | 'living_area'
  | 'amenity'
  | 'floorplan'

export interface PropertyUnit {
  id: string
  property_id: string
  unit_number?: string
  unit_type?: string
  monthly_rent?: number
  bedrooms?: number
  bathrooms?: number
  square_footage?: number
  floor_level?: number
  status: UnitStatus
  description?: string
  features: string[]
  created_at: string
  updated_at: string
}

export type UnitStatus = 
  | 'available'
  | 'occupied'
  | 'maintenance'
  | 'unavailable'

// =====================================================
// SEARCH & FILTER TYPES
// =====================================================

export interface PropertySearchCriteria {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  property_type?: PropertyType
  status?: PropertyStatus
  min_price?: number
  max_price?: number
  city?: string
  state?: string
  zip_code?: string
  min_bedrooms?: number
  max_bedrooms?: number
  min_bathrooms?: number
  max_bathrooms?: number
  min_square_footage?: number
  max_square_footage?: number
  pet_policy?: PetPolicy
  amenities?: string[]
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface SearchResponse<T> {
  data: T[]
  pagination: PaginationInfo
  filters_applied: Record<string, any>
}

// =====================================================
// FORM TYPES
// =====================================================

export interface CreatePropertyForm {
  name: string
  property_type: PropertyType
  monthly_rent: number
  deposit_amount?: number
  description?: string
  year_built?: number
  square_footage?: number
  bedrooms?: number
  bathrooms?: number
  parking_spaces?: number
  pet_policy: PetPolicy
  smoking_policy: SmokingPolicy
  utilities_included: string[]
  amenities: string[]
  restrictions?: string
  address: {
    street: string
    city: string
    state: string
    zip_code: string
    country?: string
  }
  details?: {
    heating_type?: string
    cooling_type?: string
    flooring_types: string[]
    appliances: string[]
    laundry_type?: string
    storage_spaces: string[]
    accessibility_features: string[]
    energy_efficiency_rating?: string
    property_condition: string
    last_renovation_date?: string
    property_features: string[]
  }
}

export interface UpdatePropertyForm extends Partial<CreatePropertyForm> {
  id: string
}

export interface CreatePropertyUnitForm {
  unit_number?: string
  unit_type?: string
  monthly_rent?: number
  bedrooms?: number
  bathrooms?: number
  square_footage?: number
  floor_level?: number
  description?: string
  features: string[]
}

export interface UpdatePropertyUnitForm extends Partial<CreatePropertyUnitForm> {
  id: string
}

export interface UserProfileForm {
  first_name: string
  last_name: string
  phone?: string
  preferences?: Record<string, any>
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
  correlation_id?: string
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiValidationError extends ApiError {
  errors: ValidationError[]
}

// =====================================================
// AUDIT & LOGGING TYPES
// =====================================================

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type?: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  created_at: string
}

// =====================================================
// DASHBOARD TYPES
// =====================================================

export interface DashboardMetrics {
  total_properties: number
  occupied_units: number
  vacant_units: number
  total_revenue: number
  monthly_revenue: number
  occupancy_rate: number
  maintenance_requests: number
  pending_applications: number
  late_payments: number
}

export interface RevenueData {
  month: string
  revenue: number
  expenses: number
  net_income: number
}

export interface PropertyTypeDistribution {
  property_type: PropertyType
  count: number
  percentage: number
}

export interface RecentActivity {
  id: string
  type: 'payment' | 'maintenance' | 'tenant' | 'property' | 'lease'
  description: string
  timestamp: string
  user_id?: string
  metadata?: Record<string, any>
}

// =====================================================
// FILE UPLOAD TYPES
// =====================================================

export interface FileUploadResponse {
  id: string
  filename: string
  original_filename: string
  file_size: number
  mime_type: string
  image_url: string
  thumbnail_url?: string
  uploaded_at: string
}

export interface ImageUploadOptions {
  property_id: string
  image_type?: ImageType
  is_primary?: boolean
  sort_order?: number
}

// =====================================================
// ERROR BOUNDARY TYPES
// =====================================================

export interface ErrorInfo {
  componentStack: string
}

// =====================================================
// ROUTING TYPES
// =====================================================

export interface RouteParams {
  [key: string]: string
}

export interface NavigationState {
  from?: string
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type OmitFromUnion<T, K extends keyof any> = T extends any ? Omit<T, K> : never

// =====================================================
// FORM VALIDATION TYPES
// =====================================================

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule
}

export interface FormErrors {
  [fieldName: string]: string
}

// =====================================================
// THEME & STYLE TYPES
// =====================================================

export interface ThemeColors {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  surface: string
  text: string
  textSecondary: string
}

export interface ComponentSize {
  sm: string
  md: string
  lg: string
  xl: string
}

export interface Breakpoints {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

// =====================================================
// TENANT TYPES
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

// =====================================================
// LEASE TYPES
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

// =====================================================
// MAINTENANCE TYPES
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

// =====================================================
// PAYMENT TYPES
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

// =====================================================
// REPORT TYPES
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

// =====================================================
// DOCUMENT TYPES
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

// =====================================================
// EXPORT ALL TYPES
// =====================================================

export type {
  User,
  UserRole,
  UserStatus,
  Property,
  PropertyType,
  PropertyStatus,
  PropertyAddress,
  PropertyDetails,
  PropertyImage,
  PropertyUnit,
  ImageType,
  UnitStatus,
  PetPolicy,
  SmokingPolicy,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetData,
  ChangePasswordData,
  PropertySearchCriteria,
  PaginationInfo,
  SearchResponse,
  CreatePropertyForm,
  UpdatePropertyForm,
  CreatePropertyUnitForm,
  UpdatePropertyUnitForm,
  UserProfileForm,
  ApiResponse,
  ApiError,
  ApiValidationError,
  ValidationError,
  AuditLog,
  DashboardMetrics,
  RevenueData,
  PropertyTypeDistribution,
  RecentActivity,
  FileUploadResponse,
  ImageUploadOptions,
  ErrorInfo,
  RouteParams,
  NavigationState,
  Optional,
  RequiredFields,
  DeepPartial,
  OmitFromUnion,
  FieldValidation,
  FormErrors,
  ThemeColors,
  ComponentSize,
  Breakpoints,
  Tenant,
  TenantCreateData,
  TenantSearchCriteria,
  Lease,
  LeaseCreateData,
  LeaseSearchCriteria,
  MaintenanceRequest,
  MaintenanceRequestCreateData,
  MaintenanceRequestSearchCriteria,
  Payment,
  PaymentCreateData,
  PaymentSearchCriteria,
  ReportTemplate,
  ReportParameter,
  ReportData,
  ReportGenerationRequest,
  Document,
  DocumentCreateData
}