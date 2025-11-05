# Frontend - Landlord Management System

## Overview

The frontend is a modern React application built with TypeScript, featuring a responsive UI for property management. It integrates with the backend services through the API Gateway and provides a complete user interface for landlords, property managers, and tenants.

## Features

### ✅ Completed in Phase 1B
- **Authentication System**
  - Login/Register with role-based access
  - Multi-factor authentication (MFA) support
  - Password reset functionality
  - Email verification workflow

- **Dashboard**
  - Key metrics and analytics
  - Revenue charts and property distribution
  - Recent activity feed
  - Quick action buttons

- **Property Management**
  - Property listing with grid/list views
  - Advanced search and filtering
  - Property creation forms
  - Image upload support
  - Status management

- **UI Components**
  - Responsive navigation with sidebar
  - Form validation with React Hook Form
  - Loading states and error handling
  - Toast notifications
  - Error boundaries

### 🔄 Coming in Phase 1C
- Tenant management interface
- Lease management system
- Financial dashboard and reporting
- Maintenance request system
- Advanced analytics and charts
- Mobile app support

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Forms**: React Hook Form
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Testing**: Vitest + Testing Library

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd landlord-management-system-build/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:3000`

## Configuration

### Environment Variables

Key environment variables to configure:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Application Settings
VITE_APP_NAME=Landlord Pro
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_MFA=true
VITE_ENABLE_ANALYTICS=false
```

### API Proxy Configuration

The development server is configured to proxy API requests to the API Gateway:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    secure: false,
  },
}
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common UI components
│   ├── dashboard/      # Dashboard components
│   ├── layout/         # Layout components
│   └── property/       # Property management components
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   ├── Home.tsx       # Landing page
│   ├── Dashboard.tsx  # Main dashboard
│   ├── Properties.tsx # Property listing
│   └── ...
├── services/           # API services
│   └── api.ts         # Main API client
├── context/           # React contexts
│   └── auth-store.ts  # Authentication state
├── hooks/             # Custom hooks
├── types/             # TypeScript type definitions
│   └── index.ts       # All type definitions
├── utils/             # Utility functions
├── assets/            # Static assets
├── config/            # Configuration files
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## Development Workflow

### Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Preview Production Build**
   ```bash
   npm run preview
   ```

4. **Run Tests**
   ```bash
   npm run test
   ```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## Authentication Flow

The application uses JWT-based authentication with the following flow:

1. **Login Process**
   - User submits email/password
   - API Gateway validates credentials
   - Returns JWT tokens (access + refresh)
   - User state is updated in Zustand store
   - Redirect to dashboard

2. **Token Management**
   - Access token stored in memory and localStorage
   - Refresh token stored in localStorage
   - Automatic token refresh on expiration
   - Automatic logout on token invalidation

3. **Protected Routes**
   - All main application routes are protected
   - Automatic redirect to login if not authenticated
   - Role-based access control

## State Management

The application uses Zustand for state management:

### Auth Store
```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (email: string, password: string, mfaToken?: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}
```

## API Integration

### HTTP Client Setup
- Axios instance with base configuration
- Automatic token injection
- Response interceptors for error handling
- Request/response logging in development

### Service Layer
```typescript
// Authentication services
authService.login(email, password, mfaToken?)
authService.register(userData)
authService.getCurrentUser()
authService.forgotPassword(email)

// Property services
propertyService.getProperties(criteria)
propertyService.getProperty(id)
propertyService.createProperty(data)
propertyService.uploadImages(propertyId, files)
```

## Component Architecture

### Layout Components
- **MainLayout**: Main application layout with sidebar navigation
- **AuthLayout**: Authentication page layout

### Form Components
- Built with React Hook Form
- Real-time validation
- Error handling and display
- Loading states

### Reusable Components
- **LoadingSpinner**: Consistent loading indicators
- **ErrorBoundary**: Error handling and recovery
- **Modal/Dialog**: Reusable modal components
- **Table**: Data table with sorting/filtering

## Styling

### TailwindCSS Configuration
- Custom color palette
- Responsive breakpoints
- Custom animations
- Component utilities

### CSS Architecture
- Utility-first approach with TailwindCSS
- Component-scoped styles
- Custom CSS for complex animations
- Responsive design patterns

## Testing

### Test Structure
```
src/
├── __tests__/           # Test files
│   ├── components/      # Component tests
│   ├── pages/          # Page tests
│   ├── hooks/          # Hook tests
│   └── utils/          # Utility tests
```

### Testing Utilities
- React Testing Library for component testing
- Vitest for unit tests
- MSW for API mocking
- Jest DOM for DOM assertions

## Performance Optimization

### Bundle Optimization
- Code splitting by route
- Vendor chunk separation
- Tree shaking for unused code
- Lazy loading for large components

### Runtime Optimization
- React Query for caching
- Component memoization
- Debounced search inputs
- Virtualized lists for large datasets

## Security Considerations

### Frontend Security
- XSS prevention with proper data sanitization
- CSRF protection through same-site cookies
- Content Security Policy headers
- Secure token storage

### Authentication
- JWT token validation
- Role-based access control
- MFA implementation
- Session management

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### Build Process
1. TypeScript compilation
2. Vite production build
3. Asset optimization
4. Code splitting

### Environment Setup
- Development: `npm run dev`
- Staging: `npm run build && npm run preview`
- Production: `npm run build`

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
- name: Build Frontend
  run: |
    npm ci
    npm run build
    npm run test
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check `VITE_API_BASE_URL` in `.env`
   - Ensure API Gateway is running
   - Verify network connectivity

2. **Authentication Issues**
   - Clear browser storage
   - Check token expiration
   - Verify API Gateway authentication

3. **Build Errors**
   - Clear `node_modules` and reinstall
   - Check TypeScript errors
   - Verify environment variables

### Debug Mode
Enable debug mode in development:
```env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## Contributing

### Code Style
- Use TypeScript strict mode
- Follow React best practices
- Use Prettier for code formatting
- Follow ESLint rules

### Commit Messages
Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting changes

### Pull Request Process
1. Create feature branch
2. Write tests for new features
3. Ensure all tests pass
4. Update documentation
5. Submit pull request

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

## License

This project is licensed under the MIT License.