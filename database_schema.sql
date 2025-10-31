-- Landlord Management System - Database Schema
-- PostgreSQL 15+ Required
-- Author: MiniMax Agent
-- Date: October 30, 2025

-- ================================================
-- 1. SCHEMA CREATION
-- ================================================

CREATE SCHEMA IF NOT EXISTS lms;
SET search_path TO lms, public;

-- ================================================
-- 2. ENUMS AND TYPES
-- ================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'property_owner', 'property_manager', 'tenant', 'maintenance_staff', 'accounting');
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'condo', 'townhouse', 'commercial', 'mixed_use');
CREATE TYPE property_status AS ENUM ('available', 'occupied', 'maintenance', 'off_market');
CREATE TYPE tenant_status AS ENUM ('active', 'inactive', 'pending', 'eviction_process');
CREATE TYPE lease_status AS ENUM ('draft', 'active', 'expired', 'terminated', 'renewed');
CREATE TYPE payment_type AS ENUM ('rent', 'security_deposit', 'pet_deposit', 'late_fee', 'maintenance', 'utility', 'other');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'overdue');
CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'emergency');
CREATE TYPE maintenance_status AS ENUM ('open', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE work_order_status AS ENUM ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('payment_reminder', 'lease_expiry', 'maintenance_update', 'payment_received', 'system_alert');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push', 'in_app');
CREATE TYPE document_type AS ENUM ('lease', 'application', 'identification', 'income_verification', 'background_check', 'deed', 'permit', 'insurance', 'inspection', 'receipt', 'other');

-- ================================================
-- 3. CORE TABLES
-- ================================================

-- Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'tenant',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    profile_image_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language_preference VARCHAR(10) DEFAULT 'en',
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Properties Table
CREATE TABLE properties (
    property_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    property_name VARCHAR(255) NOT NULL,
    property_type property_type NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    square_footage INTEGER,
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    year_built INTEGER,
    purchase_price DECIMAL(12, 2),
    current_value DECIMAL(12, 2),
    property_status property_status DEFAULT 'available',
    description TEXT,
    amenities TEXT[],
    features TEXT[],
    utilities_included TEXT[],
    parking_spaces INTEGER DEFAULT 0,
    pet_policy TEXT,
    smoking_policy TEXT,
    lease_minimum_months INTEGER DEFAULT 12,
    lease_maximum_months INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Tenants Table
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_email VARCHAR(255),
    emergency_contact_relationship VARCHAR(100),
    employment_status VARCHAR(50),
    employer_name VARCHAR(255),
    employer_contact VARCHAR(255),
    monthly_income DECIMAL(10, 2),
    credit_score INTEGER CHECK (credit_score >= 300 AND credit_score <= 850),
    background_check_status VARCHAR(50) DEFAULT 'pending',
    background_check_date TIMESTAMP,
    background_check_result JSONB,
    move_in_date DATE,
    move_out_date DATE,
    status tenant_status DEFAULT 'active',
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Leases Table
CREATE TABLE leases (
    lease_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    lease_start_date DATE NOT NULL,
    lease_end_date DATE NOT NULL,
    monthly_rent DECIMAL(10, 2) NOT NULL,
    security_deposit DECIMAL(10, 2),
    pet_deposit DECIMAL(10, 2) DEFAULT 0,
    last_rent_increase DATE,
    rent_increase_percentage DECIMAL(5, 2),
    rent_increase_notice_days INTEGER DEFAULT 60,
    lease_terms JSONB NOT NULL DEFAULT '{}',
    renewal_terms JSONB DEFAULT '{}',
    status lease_status DEFAULT 'draft',
    signed_date TIMESTAMP,
    digital_signature TEXT,
    lease_document_url TEXT,
    auto_renewal BOOLEAN DEFAULT false,
    renewal_notice_sent BOOLEAN DEFAULT false,
    termination_notice_given BOOLEAN DEFAULT false,
    early_termination_fee DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Payments Table
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID REFERENCES leases(lease_id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    payment_type payment_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_date DATE NOT NULL,
    due_date DATE NOT NULL,
    late_fee DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(10, 2) GENERATED ALWAYS AS (amount + late_fee - discount_amount) STORED,
    status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_gateway VARCHAR(50),
    gateway_response JSONB,
    receipt_url TEXT,
    reference_number VARCHAR(100),
    notes TEXT,
    processed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Maintenance Requests Table
CREATE TABLE maintenance_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    priority maintenance_priority DEFAULT 'medium',
    status maintenance_status DEFAULT 'open',
    assigned_to UUID REFERENCES users(user_id) ON DELETE SET NULL,
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    scheduled_date TIMESTAMP,
    completed_date TIMESTAMP,
    access_instructions TEXT,
    images TEXT[],
    videos TEXT[],
    tenant_rating INTEGER CHECK (tenant_rating >= 1 AND tenant_rating <= 5),
    tenant_feedback TEXT,
    resolution_summary TEXT,
    recurring_frequency VARCHAR(50),
    next_scheduled_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Work Orders Table
CREATE TABLE work_orders (
    work_order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES maintenance_requests(request_id) ON DELETE SET NULL,
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority maintenance_priority DEFAULT 'medium',
    status work_order_status DEFAULT 'pending',
    estimated_hours DECIMAL(5, 2),
    actual_hours DECIMAL(5, 2),
    labor_cost DECIMAL(10, 2),
    material_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (labor_cost + material_cost) STORED,
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    materials_used JSONB DEFAULT '[]',
    vendor_notes TEXT,
    tenant_notification BOOLEAN DEFAULT false,
    before_images TEXT[],
    after_images TEXT[],
    warranty_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Expenses Table
CREATE TABLE expenses (
    expense_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    vendor_name VARCHAR(255),
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    receipt_number VARCHAR(100),
    tax_deductible BOOLEAN DEFAULT false,
    work_order_id UUID REFERENCES work_orders(work_order_id) ON DELETE SET NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    tags TEXT[],
    approved_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    reimbursement_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Messages Table
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(property_id) ON DELETE SET NULL,
    lease_id UUID REFERENCES leases(lease_id) ON DELETE SET NULL,
    subject VARCHAR(255),
    message_body TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(50) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'sent',
    read_at TIMESTAMP,
    replied_at TIMESTAMP,
    reply_to UUID REFERENCES messages(message_id) ON DELETE SET NULL,
    attachments TEXT[],
    is_broadcast BOOLEAN DEFAULT false,
    recipient_count INTEGER DEFAULT 1,
    read_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type NOT NULL,
    priority VARCHAR(50) DEFAULT 'normal',
    channel notification_channel NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(property_id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE SET NULL,
    lease_id UUID REFERENCES leases(lease_id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type document_type NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    checksum VARCHAR(64),
    version INTEGER DEFAULT 1,
    is_current_version BOOLEAN DEFAULT true,
    previous_version_id UUID REFERENCES documents(document_id) ON DELETE SET NULL,
    tags TEXT[],
    access_level VARCHAR(50) DEFAULT 'private',
    expiration_date DATE,
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    table_name VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- 4. JUNCTION TABLES
-- ================================================

-- User Roles (for future expansion)
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role user_role NOT NULL,
    granted_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    PRIMARY KEY (user_id, role)
);

-- Property Amenities
CREATE TABLE property_amenities (
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    amenity VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (property_id, amenity)
);

-- Tenant Applications
CREATE TABLE tenant_applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    applicant_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    application_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    rejection_reason TEXT,
    background_check_requested BOOLEAN DEFAULT false,
    background_check_completed BOOLEAN DEFAULT false,
    credit_check_requested BOOLEAN DEFAULT false,
    credit_check_completed BOOLEAN DEFAULT false,
    income_verified BOOLEAN DEFAULT false,
    references_checked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods
CREATE TABLE payment_methods (
    method_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    details JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- 5. INDEXES FOR PERFORMANCE
-- ================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Properties indexes
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_location ON properties(city, state);
CREATE INDEX idx_properties_status ON properties(property_status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_coordinates ON properties(latitude, longitude);
CREATE INDEX idx_properties_deleted_at ON properties(deleted_at);

-- Tenants indexes
CREATE INDEX idx_tenants_user_id ON tenants(user_id);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_move_dates ON tenants(move_in_date, move_out_date);
CREATE INDEX idx_tenants_deleted_at ON tenants(deleted_at);

-- Leases indexes
CREATE INDEX idx_leases_property_id ON leases(property_id);
CREATE INDEX idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX idx_leases_dates ON leases(lease_start_date, lease_end_date);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_expiry ON leases(lease_end_date) WHERE status = 'active';
CREATE INDEX idx_leases_deleted_at ON leases(deleted_at);

-- Payments indexes
CREATE INDEX idx_payments_lease_id ON payments(lease_id);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_property_id ON payments(property_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_type ON payments(payment_type);
CREATE INDEX idx_payments_overdue ON payments(due_date, status) WHERE status IN ('pending', 'overdue');
CREATE INDEX idx_payments_deleted_at ON payments(deleted_at);

-- Maintenance requests indexes
CREATE INDEX idx_maint_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX idx_maint_requests_tenant_id ON maintenance_requests(tenant_id);
CREATE INDEX idx_maint_requests_assigned_to ON maintenance_requests(assigned_to);
CREATE INDEX idx_maint_requests_status ON maintenance_requests(status);
CREATE INDEX idx_maint_requests_priority ON maintenance_requests(priority);
CREATE INDEX idx_maint_requests_category ON maintenance_requests(category);
CREATE INDEX idx_maint_requests_created_date ON maintenance_requests(created_at);
CREATE INDEX idx_maint_requests_scheduled ON maintenance_requests(scheduled_date) WHERE status = 'assigned';
CREATE INDEX idx_maint_requests_deleted_at ON maintenance_requests(deleted_at);

-- Work orders indexes
CREATE INDEX idx_work_orders_request_id ON work_orders(request_id);
CREATE INDEX idx_work_orders_property_id ON work_orders(property_id);
CREATE INDEX idx_work_orders_vendor_id ON work_orders(vendor_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_scheduled ON work_orders(scheduled_start, scheduled_end);
CREATE INDEX idx_work_orders_deleted_at ON work_orders(deleted_at);

-- Expenses indexes
CREATE INDEX idx_expenses_property_id ON expenses(property_id);
CREATE INDEX idx_expenses_category ON expenses(category, subcategory);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_vendor ON expenses(vendor_name);
CREATE INDEX idx_expenses_deductible ON expenses(tax_deductible) WHERE tax_deductible = true;
CREATE INDEX idx_expenses_deleted_at ON expenses(deleted_at);

-- Messages indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_property_id ON messages(property_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id, created_at);
CREATE INDEX idx_messages_unread ON messages(recipient_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_deleted_at ON messages(deleted_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL AND status = 'sent';
CREATE INDEX idx_notifications_deleted_at ON notifications(deleted_at);

-- Documents indexes
CREATE INDEX idx_documents_property_id ON documents(property_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_lease_id ON documents(lease_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_documents_deleted_at ON documents(deleted_at);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address);

-- ================================================
-- 6. TRIGGERS FOR UPDATED_AT TIMESTAMP
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 7. AUDIT TRIGGER FUNCTION
-- ================================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields TEXT[] := ARRAY[]::TEXT[];
    old_json JSONB;
    new_json JSONB;
BEGIN
    -- Skip if it's an audit log entry
    IF TG_TABLE_NAME = 'audit_logs' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Determine operation type
    IF TG_OP = 'INSERT' THEN
        old_json := NULL;
        new_json := to_jsonb(NEW);
        -- Get all field names for insert
        SELECT array_agg(column_name) INTO changed_fields
        FROM information_schema.columns 
        WHERE table_schema = TG_TABLE_SCHEMA 
        AND table_name = TG_TABLE_NAME;
    ELSIF TG_OP = 'UPDATE' THEN
        old_json := to_jsonb(OLD);
        new_json := to_jsonb(NEW);
        -- Find changed fields
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(old_json) old_kv
        WHERE old_kv.value IS DISTINCT FROM (new_json -> old_kv.key);
    ELSIF TG_OP = 'DELETE' THEN
        old_json := to_jsonb(OLD);
        new_json := NULL;
        -- Get all field names for delete
        SELECT array_agg(column_name) INTO changed_fields
        FROM information_schema.columns 
        WHERE table_schema = TG_TABLE_SCHEMA 
        AND table_name = TG_TABLE_NAME;
    END IF;
    
    -- Insert audit log entry
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        table_name,
        old_values,
        new_values,
        changed_fields
    ) VALUES (
        COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.user_id, OLD.user_id, NEW.property_id, OLD.property_id, NEW.lease_id, OLD.lease_id),
        TG_TABLE_NAME,
        old_json,
        new_json,
        changed_fields
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- ================================================
-- 8. APPLY AUDIT TRIGGERS
-- ================================================

CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_properties AFTER INSERT OR UPDATE OR DELETE ON properties FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_tenants AFTER INSERT OR UPDATE OR DELETE ON tenants FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_leases AFTER INSERT OR UPDATE OR DELETE ON leases FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_maintenance_requests AFTER INSERT OR UPDATE OR DELETE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_work_orders AFTER INSERT OR UPDATE OR DELETE ON work_orders FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON expenses FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_messages AFTER INSERT OR UPDATE OR DELETE ON messages FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_notifications AFTER INSERT OR UPDATE OR DELETE ON notifications FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON documents FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ================================================
-- 9. VIEWS FOR COMMON QUERIES
-- ================================================

-- Active Leases View
CREATE VIEW active_leases AS
SELECT 
    l.lease_id,
    l.property_id,
    l.tenant_id,
    p.property_name,
    p.address,
    u.first_name || ' ' || u.last_name AS tenant_name,
    l.lease_start_date,
    l.lease_end_date,
    l.monthly_rent,
    l.status,
    CASE 
        WHEN l.lease_end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
        WHEN l.lease_end_date <= CURRENT_DATE THEN 'expired'
        ELSE 'active'
    END AS lease_health
FROM leases l
JOIN properties p ON l.property_id = p.property_id
JOIN tenants t ON l.tenant_id = t.tenant_id
JOIN users u ON t.user_id = u.user_id
WHERE l.status = 'active' 
AND (l.deleted_at IS NULL OR p.deleted_at IS NULL OR t.deleted_at IS NULL);

-- Outstanding Payments View
CREATE VIEW outstanding_payments AS
SELECT 
    p.payment_id,
    p.lease_id,
    p.tenant_id,
    p.property_id,
    p.amount,
    p.due_date,
    p.late_fee,
    p.net_amount,
    p.status,
    u.first_name || ' ' || u.last_name AS tenant_name,
    prop.property_name,
    CASE 
        WHEN p.due_date < CURRENT_DATE THEN 'overdue'
        WHEN p.due_date = CURRENT_DATE THEN 'due_today'
        ELSE 'upcoming'
    END AS payment_status_category
FROM payments p
JOIN tenants t ON p.tenant_id = t.tenant_id
JOIN users u ON t.user_id = u.user_id
JOIN properties prop ON p.property_id = prop.property_id
WHERE p.status IN ('pending', 'overdue')
AND p.deleted_at IS NULL;

-- Maintenance Dashboard View
CREATE VIEW maintenance_dashboard AS
SELECT 
    mr.request_id,
    mr.property_id,
    mr.tenant_id,
    mr.title,
    mr.category,
    mr.priority,
    mr.status,
    mr.scheduled_date,
    mr.estimated_cost,
    p.property_name,
    u.first_name || ' ' || u.last_name AS tenant_name,
    assigned_user.first_name || ' ' || assigned_user.last_name AS assigned_to_name
FROM maintenance_requests mr
JOIN properties p ON mr.property_id = p.property_id
LEFT JOIN tenants t ON mr.tenant_id = t.tenant_id
LEFT JOIN users u ON t.user_id = u.user_id
LEFT JOIN users assigned_user ON mr.assigned_to = assigned_user.user_id
WHERE mr.deleted_at IS NULL
ORDER BY 
    CASE mr.priority 
        WHEN 'emergency' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    mr.created_at;

-- Property Financial Summary View
CREATE VIEW property_financial_summary AS
SELECT 
    p.property_id,
    p.property_name,
    p.address,
    p.monthly_rent AS listed_rent,
    COUNT(DISTINCT l.lease_id) AS total_leases,
    COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.lease_id END) AS active_leases,
    COALESCE(SUM(CASE WHEN pay.status = 'completed' THEN pay.net_amount ELSE 0 END), 0) AS total_collected,
    COALESCE(SUM(CASE WHEN pay.status IN ('pending', 'overdue') THEN pay.net_amount ELSE 0 END), 0) AS outstanding_amount,
    COALESCE(SUM(CASE WHEN exp.tax_deductible THEN exp.amount ELSE 0 END), 0) AS tax_deductible_expenses,
    COALESCE(SUM(exp.amount), 0) AS total_expenses,
    COUNT(DISTINCT mr.request_id) AS maintenance_requests_count,
    COUNT(DISTINCT CASE WHEN mr.status = 'open' THEN mr.request_id END) AS open_maintenance_requests
FROM properties p
LEFT JOIN leases l ON p.property_id = l.property_id
LEFT JOIN payments pay ON l.lease_id = pay.lease_id
LEFT JOIN expenses exp ON p.property_id = exp.property_id
LEFT JOIN maintenance_requests mr ON p.property_id = mr.property_id
WHERE p.deleted_at IS NULL
GROUP BY p.property_id, p.property_name, p.address, p.monthly_rent;

-- ================================================
-- 10. SAMPLE DATA FOR TESTING
-- ================================================

-- Insert sample admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified) 
VALUES ('admin@landlordms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/YsQivlRy', 'System', 'Administrator', 'super_admin', true);

-- Insert sample property owner
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified) 
VALUES ('owner@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/YsQivlRy', 'John', 'Smith', 'property_owner', true);

-- Insert sample tenant user
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified) 
VALUES ('tenant@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/YsQivlRy', 'Jane', 'Doe', 'tenant', true);

-- ================================================
-- 11. SECURITY AND PERMISSIONS
-- ================================================

-- Create roles for database users
DO $$
BEGIN
    -- Application user (read/write access)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'lms_app_user') THEN
        CREATE ROLE lms_app_user LOGIN PASSWORD 'secure_app_password';
    END IF;
    
    -- Read-only user (for reporting)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'lms_readonly_user') THEN
        CREATE ROLE lms_readonly_user LOGIN PASSWORD 'secure_readonly_password';
    END IF;
    
    -- Admin user (full access)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'lms_admin_user') THEN
        CREATE ROLE lms_admin_user LOGIN PASSWORD 'secure_admin_password';
    END IF;
END
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA lms TO lms_app_user, lms_readonly_user, lms_admin_user;
GRANT ALL ON ALL TABLES IN SCHEMA lms TO lms_app_user, lms_admin_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA lms TO lms_app_user, lms_admin_user;
GRANT SELECT ON ALL TABLES IN SCHEMA lms TO lms_readonly_user;

-- ================================================
-- 12. BACKUP AND MAINTENANCE
-- ================================================

-- Create function for data cleanup (run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete old audit logs (keep 2 years)
    DELETE FROM audit_logs WHERE created_at < CURRENT_DATE - INTERVAL '2 years';
    
    -- Delete old notifications (keep 6 months)
    DELETE FROM notifications WHERE created_at < CURRENT_DATE - INTERVAL '6 months';
    
    -- Delete read messages older than 1 year
    DELETE FROM messages WHERE read_at IS NOT NULL AND created_at < CURRENT_DATE - INTERVAL '1 year';
    
    -- Vacuum and analyze tables
    VACUUM ANALYZE;
END;
$$ LANGUAGE plpgsql;

-- Create function for database health check
CREATE OR REPLACE FUNCTION health_check()
RETURNS TABLE (
    table_name TEXT,
    total_records BIGINT,
    dead_tuples BIGINT,
    index_hit_ratio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname || '.' || tablename as table_name,
        n_tup_ins + n_tup_upd + n_tup_del as total_records,
        n_dead_tup as dead_tuples,
        CASE 
            WHEN idx_scan > 0 THEN ROUND((idx_scan::numeric / (seq_scan + idx_scan)::numeric) * 100, 2)
            ELSE 0 
        END as index_hit_ratio
    FROM pg_stat_user_tables
    WHERE schemaname = 'lms'
    ORDER BY n_dead_tup DESC;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- END OF SCHEMA
-- ================================================
