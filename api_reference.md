# Landlord Management System - API Reference

**Version:** v1  
**Base URL:** `https://api.landlordms.com/v1`

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "success": true,
  "data": {
    "access_token": "jwt_access_token",
    "refresh_token": "jwt_refresh_token",
    "expires_in": 900,
    "user": {
      "user_id": "uuid",
      "email": "user@example.com",
      "role": "property_owner"
    }
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "property_owner"
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "jwt_refresh_token"
}
```

## Properties

### List Properties
```http
GET /properties?page=1&limit=20&status=active&type=residential
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": [
    {
      "property_id": "uuid",
      "property_name": "Sunset Apartments",
      "property_type": "apartment",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "square_footage": 1200,
      "bedrooms": 2,
      "bathrooms": 2.0,
      "monthly_rent": 2500.00,
      "status": "occupied",
      "images": ["url1", "url2"],
      "created_at": "2025-10-30T14:20:25Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_items": 95
  }
}
```

### Create Property
```http
POST /properties
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "property_name": "Downtown Loft",
  "property_type": "apartment",
  "address": "456 Oak Ave",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "square_footage": 800,
  "bedrooms": 1,
  "bathrooms": 1.0,
  "monthly_rent": 3000.00,
  "description": "Modern loft in downtown area"
}
```

### Get Property Details
```http
GET /properties/{property_id}
Authorization: Bearer {access_token}
```

### Update Property
```http
PUT /properties/{property_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "monthly_rent": 3200.00,
  "description": "Updated description"
}
```

### Upload Property Images
```http
POST /properties/{property_id}/images
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [binary data]
category: "exterior" | "interior" | "amenities"
```

## Tenants

### List Tenants
```http
GET /tenants?status=active&property_id={property_id}
Authorization: Bearer {access_token}
```

### Create Tenant
```http
POST /tenants
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "user_id": "uuid",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1234567891",
  "employment_status": "employed",
  "monthly_income": 8000.00
}
```

### Tenant Application
```http
POST /tenants/{tenant_id}/applications
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "property_id": "uuid",
  "application_data": {
    "income_proof": "url",
    "employment_verification": "url",
    "references": [
      {
        "name": "Previous Landlord",
        "phone": "+1234567892",
        "email": "ref@example.com"
      }
    ]
  }
}
```

## Leases

### List Leases
```http
GET /leases?status=active&property_id={property_id}&tenant_id={tenant_id}
Authorization: Bearer {access_token}
```

### Create Lease
```http
POST /leases
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "property_id": "uuid",
  "tenant_id": "uuid",
  "lease_start_date": "2025-11-01",
  "lease_end_date": "2026-10-31",
  "monthly_rent": 2500.00,
  "security_deposit": 2500.00,
  "lease_terms": {
    "pet_policy": "no_pets",
    "smoking_policy": "non_smoking",
    "parking_included": true
  }
}
```

### Sign Lease (Digital Signature)
```http
POST /leases/{lease_id}/sign
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "signature": "base64_encoded_signature",
  "signed_date": "2025-10-30T14:20:25Z"
}
```

### Renew Lease
```http
POST /leases/{lease_id}/renew
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "new_end_date": "2027-10-31",
  "new_monthly_rent": 2750.00,
  "renewal_terms": {
    "rent_increase_notice": "60_days"
  }
}
```

## Payments

### List Payments
```http
GET /payments?status=pending&tenant_id={tenant_id}&start_date=2025-10-01&end_date=2025-10-31
Authorization: Bearer {access_token}
```

### Process Payment
```http
POST /payments/process
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "lease_id": "uuid",
  "payment_type": "rent",
  "amount": 2500.00,
  "payment_method": "card",
  "payment_method_id": "pm_card_visa",
  "due_date": "2025-11-01"
}
```

### Add Payment Method
```http
POST /payments/methods
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "type": "card",
  "card": {
    "number": "4242424242424242",
    "exp_month": 12,
    "exp_year": 2025,
    "cvc": "123"
  }
}
```

### Get Payment History
```http
GET /payments/history?tenant_id={tenant_id}&property_id={property_id}
Authorization: Bearer {access_token}
```

## Maintenance

### List Maintenance Requests
```http
GET /maintenance/requests?status=open&priority=high&property_id={property_id}
Authorization: Bearer {access_token}
```

### Create Maintenance Request
```http
POST /maintenance/requests
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "property_id": "uuid",
  "title": "Leaking faucet",
  "description": "Kitchen faucet has been dripping for 2 days",
  "category": "plumbing",
  "priority": "medium",
  "images": ["url1", "url2"]
}
```

### Update Maintenance Request
```http
PUT /maintenance/requests/{request_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "in_progress",
  "assigned_to": "uuid",
  "estimated_cost": 150.00,
  "scheduled_date": "2025-11-01T10:00:00Z"
}
```

### Create Work Order
```http
POST /maintenance/work-orders
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "request_id": "uuid",
  "property_id": "uuid",
  "vendor_id": "uuid",
  "title": "Fix kitchen faucet",
  "description": "Replace worn washer and seals",
  "estimated_hours": 2.0,
  "labor_cost": 100.00,
  "materials": [
    {
      "item": "Faucet washer set",
      "quantity": 1,
      "cost": 15.00
    }
  ]
}
```

## Messages & Communications

### Send Message
```http
POST /messages
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "recipient_id": "uuid",
  "subject": "Rent Reminder",
  "message_body": "Your rent is due on the 1st of next month",
  "message_type": "payment_reminder",
  "priority": "normal"
}
```

### List Messages
```http
GET /messages?status=unread&conversation_id={conversation_id}
Authorization: Bearer {access_token}
```

### Send Notification
```http
POST /notifications/send
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "user_id": "uuid",
  "title": "Payment Received",
  "message": "Your rent payment of $2500 has been processed",
  "notification_type": "payment_confirmation",
  "channel": "email",
  "metadata": {
    "payment_id": "uuid",
    "amount": 2500.00
  }
}
```

## Reports & Analytics

### Dashboard Data
```http
GET /reports/dashboard?property_id={property_id}&period=monthly
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "total_properties": 25,
    "occupied_units": 23,
    "vacancy_rate": 8.0,
    "monthly_revenue": 57500.00,
    "outstanding_payments": 2500.00,
    "maintenance_requests": {
      "open": 5,
      "in_progress": 3,
      "completed_this_month": 12
    },
    "rent_collection_rate": 96.8
  }
}
```

### Financial Report
```http
GET /reports/financial?start_date=2025-10-01&end_date=2025-10-31&property_id={property_id}
Authorization: Bearer {access_token}
```

### Custom Report
```http
POST /reports/custom
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "report_type": "tenant_retention",
  "parameters": {
    "start_date": "2025-01-01",
    "end_date": "2025-10-31",
    "group_by": "month",
    "metrics": ["retention_rate", "average_tenancy"]
  },
  "format": "json"
}
```

### Export Report
```http
GET /reports/export/{report_id}?format=pdf
Authorization: Bearer {access_token}
```

## File Management

### Upload File
```http
POST /files/upload
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [binary data]
document_type: "lease" | "payment_receipt" | "maintenance_photo"
property_id: "uuid"
tenant_id: "uuid" (optional)
```

### Get File
```http
GET /files/{file_id}
Authorization: Bearer {access_token}
```

### Download File
```http
GET /files/{file_id}/download
Authorization: Bearer {access_token}
```

### Search Files
```http
GET /files/search?document_type=lease&property_id={property_id}&start_date=2025-01-01
Authorization: Bearer {access_token}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2025-10-30T14:20:25Z"
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400): Input validation failed
- `AUTHENTICATION_REQUIRED` (401): Missing or invalid token
- `INSUFFICIENT_PERMISSIONS` (403): User lacks required role
- `RESOURCE_NOT_FOUND` (404): Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_SERVER_ERROR` (500): Server error

## Rate Limiting

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour
- **File uploads**: 50 uploads per hour
- **Rate limit headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Pagination

All list endpoints support pagination:

```http
GET /properties?page=2&limit=20&sort=created_at&order=desc
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current_page": 2,
    "per_page": 20,
    "total_pages": 10,
    "total_items": 200,
    "has_next": true,
    "has_prev": true,
    "next_page": 3,
    "prev_page": 1
  }
}
```

## Filtering and Sorting

### Supported Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Field to sort by
- `order`: Sort order (`asc` or `desc`)
- `status`: Filter by status
- `date_from`: Start date filter
- `date_to`: End date filter
- `search`: Text search

### Example Queries
```http
GET /properties?status=active&city=New York&min_rent=2000&max_rent=3000
GET /maintenance/requests?priority=high&status=open&date_from=2025-10-01
GET /payments?status=overdue&tenant_id={tenant_id}&sort=payment_date&order=desc
```

## Webhooks

### Configure Webhooks
```http
POST /webhooks
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/lms",
  "events": ["payment.completed", "maintenance.request.created", "lease.signed"],
  "secret": "webhook_secret_key"
}
```

### Webhook Payload Example
```json
{
  "event": "payment.completed",
  "timestamp": "2025-10-30T14:20:25Z",
  "data": {
    "payment_id": "uuid",
    "tenant_id": "uuid",
    "amount": 2500.00,
    "status": "completed"
  }
}
```

---

**Note**: All endpoints require authentication except `/auth/login` and `/auth/register`. Include the JWT token in the Authorization header: `Bearer {access_token}`
