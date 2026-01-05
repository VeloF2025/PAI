---
name: life-arrow-v1-knowledge
description: |
  Comprehensive project knowledge for Life Arrow V1 healthcare application.
  Auto-generated codebase intelligence covering architecture, services, data models, and patterns.
---

# Life Arrow V1 - Project Knowledge Base

**Project Type**: Healthcare & Life Coaching Platform
**Stack**: React 18.3 + TypeScript + Firebase + Vite
**Generated**: 2025-11-17
**Codebase Size**: ~420 files, ~91,550 LOC

---

## 📋 PROJECT OVERVIEW

### Core Purpose
Life Arrow V1 is a comprehensive personal development and life coaching platform with advanced health monitoring capabilities, including:
- **Body composition scanning** (EPD/EBC analysis)
- **Appointment management** (multi-centre booking system)
- **Client/staff management** (RBAC with centre-specific permissions)
- **Health monitoring** (real-time dashboard with alerting)
- **Treatment planning** (goal-based wellness programs)

### Key Business Domains
1. **Appointments**: Multi-centre scheduling with staff availability
2. **Clients**: Patient/client management with health records
3. **Staff**: Service provider management with qualifications
4. **Centres**: Multi-location treatment facilities
5. **Scans**: Body composition analysis (Delphi scanner integration)
6. **Services**: Offered treatments and consultations
7. **Health Monitoring**: System health tracking and GitHub integration

---

## 🏗️ ARCHITECTURE PATTERNS

### Technology Stack
```json
{
  "frontend": {
    "framework": "React 18.3.1",
    "language": "TypeScript 5.7.2",
    "bundler": "Vite 6.0.5",
    "styling": "Tailwind CSS 3.4.17",
    "routing": "React Router DOM 7.1.4",
    "state": "TanStack Query 5.81.2",
    "forms": "React Hook Form 7.62.0 + Zod 3.24.1"
  },
  "backend": {
    "database": "Firebase Firestore 11.2.0",
    "auth": "Firebase Auth 11.2.0",
    "storage": "Firebase Storage 11.2.0",
    "functions": "Firebase Functions (Cloud Functions)",
    "hosting": "Firebase Hosting"
  },
  "testing": {
    "unit": "Vitest 2.0.0",
    "e2e": "Playwright 1.54.2",
    "coverage": "@vitest/coverage-v8 2.0.0"
  },
  "quality": {
    "linting": "ESLint 9.17.0 + TypeScript-ESLint",
    "formatting": "Prettier 3.5.3",
    "validation": "Zero Tolerance Policy (custom scripts)"
  }
}
```

### Directory Structure
```
src/
├── app/                      # Application core (providers, router)
├── assets/                   # Static assets (images, fonts)
├── components/              # Reusable UI components
│   ├── admin/              # Admin-specific components
│   ├── appointments/       # Appointment UI components
│   ├── auth/               # Authentication components
│   ├── client/             # Client-facing components
│   ├── forms/              # Form components (LoginForm, SignupForm, etc.)
│   ├── layout/             # Layout components (Header, Footer, Sidebar)
│   ├── ui/                 # Base UI primitives (Button, Modal, etc.)
│   └── ...
├── config/                  # Configuration files
├── contexts/                # React Context providers
│   ├── LoadingContext.tsx
│   ├── ToastContext.tsx
│   └── ...
├── debug/                   # Development debugging utilities
├── features/               # Feature-based modules (vertical slices)
│   ├── admin/             # Admin dashboard features
│   ├── appointments/      # Appointment booking & management
│   │   ├── api/          # Appointment services
│   │   ├── components/   # Appointment components
│   │   ├── hooks/        # Appointment hooks
│   │   └── pages/        # Appointment pages
│   ├── auth/              # Authentication features
│   ├── centres/           # Treatment centre management
│   ├── clients/           # Client management
│   │   ├── api/          # Client services (Firestore & HTTP)
│   │   ├── components/   # Client components
│   │   ├── hooks/        # Client hooks
│   │   ├── pages/        # Client pages
│   │   └── services/     # Client business logic
│   ├── scans/             # Scan management (EPD/EBC)
│   │   ├── api/          # Scan services
│   │   ├── components/   # Scan UI components
│   │   ├── services/     # Scan processing
│   │   ├── tests/        # Scan tests
│   │   ├── types/        # Scan TypeScript types
│   │   └── utils/        # Scan utilities
│   ├── services/          # Service catalog management
│   └── staff/             # Staff management
│       ├── api/          # Staff services
│       ├── components/   # Staff components
│       ├── hooks/        # Staff hooks
│       └── pages/        # Staff pages
├── hooks/                  # Global custom hooks
├── lib/                    # Core library functions
│   ├── apiClient.ts       # HTTP client with error handling
│   ├── apiConfig.ts       # API endpoint configuration
│   ├── auth.ts            # Authentication utilities
│   ├── database.ts        # Firestore utilities
│   ├── errorHandler.ts    # Error handling service
│   ├── firebase.ts        # Firebase initialization
│   ├── logger.ts          # Structured logging service
│   ├── permissions.ts     # RBAC permission system
│   ├── queryClient.ts     # TanStack Query configuration
│   ├── schemas/           # Zod validation schemas
│   └── ...
├── monitoring/             # Health monitoring system
│   ├── checks/            # Health check definitions
│   └── types/             # Monitoring types
├── pages/                  # Page components (routes)
│   ├── admin/             # Admin pages (Dashboard, etc.)
│   ├── auth/              # Auth pages (Login, Signup, etc.)
│   ├── client/            # Client dashboard pages
│   ├── debug/             # Debug pages (dev only)
│   └── onboarding/        # User onboarding flow
├── providers/              # Application-wide providers
├── services/              # Service layer (business logic)
│   ├── api/              # API integration services
│   │   ├── authApi.ts    # Auth API service
│   │   ├── clientApi.ts  # Client API service
│   │   ├── dashboardApi.ts # Dashboard API service
│   │   └── staffApi.ts   # Staff API service
│   ├── httpClient.ts     # Base HTTP client service
│   ├── serviceFactory.ts # Service abstraction layer
│   ├── appointmentNotificationService.ts
│   ├── emailNotificationService.ts
│   ├── githubIntegrationService.ts
│   └── ...
├── shared/                 # Shared utilities and components
│   ├── components/        # Shared UI components
│   ├── hooks/             # Shared custom hooks
│   └── utils/             # Shared utilities
├── styles/                 # Global styles
├── types/                  # TypeScript type definitions
│   ├── index.ts           # Main types export
│   └── onboarding/        # Onboarding-specific types
└── utils/                  # Utility functions
    ├── featureFlags.ts    # Feature flag system
    ├── migrationValidation.ts
    ├── performanceMonitor.ts
    └── ...
```

### Architecture Principles
1. **Feature-based organization**: Vertical slices in `features/` directory
2. **Service abstraction layer**: `serviceFactory.ts` for Firestore/HTTP switching
3. **React Query for data**: TanStack Query for server state management
4. **Context for app state**: LoadingContext, ToastContext for UI state
5. **Route-based code splitting**: Lazy loading with React.lazy()
6. **Zero Tolerance Policy**: Automated validation before commits

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Firebase Authentication
- **Provider**: Firebase Auth with Email/Password + Google Sign-In
- **Custom Claims**: Role-based access control (RBAC) via custom claims
- **Email Verification**: Required for staff/admin accounts
- **Session Management**: Automatic token refresh

### User Roles (Hierarchical)
```typescript
export type UserRole = 'super-admin' | 'admin' | 'staff' | 'client';

// Role hierarchy (descending privileges):
// 1. super-admin: System-wide unrestricted access
// 2. admin: Multi-centre management with service restrictions
// 3. staff: Centre-specific operations and self-management
// 4. client: Self-service access only
```

### RBAC Implementation (`lib/permissions.ts`)
```typescript
// Resource Access Scopes
export type ResourceAccessScope = 'own' | 'centre' | 'linked_centres' | 'all';

// Permission checking
function hasResourcePermission(
  role: UserRole,
  permission: string,
  userId: string,
  resourceOwnerId?: string,
  userCentreLinks?: UserCentreLink[],
  resourceCentreId?: string,
  userServiceIds?: string[],
  resourceServiceId?: string
): boolean
```

### Auth Utilities (`lib/auth.ts`)
- `updateUserRole(userId, newRole, permissions)` - Update user role
- `getUserPermissions(userId)` - Get user's effective permissions
- `userHasPermission(userId, permission, context)` - Check permission with resource context
- `syncUserCustomClaims(userId)` - Sync Firebase custom claims
- `getUserCentreLinks(userId)` - Get user-centre associations
- `linkUserToCentre(userId, centreId, linkType, serviceIds)` - Link user to centre

### User-Centre Links (Centre-Specific Permissions)
```typescript
export interface UserCentreLink {
  userId: string;
  centreId: string;
  linkType: 'admin' | 'staff' | 'service_provider' | 'client';
  serviceIds?: string[]; // Services authorized at this centre
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}
```

---

## 🗄️ FIREBASE/FIRESTORE DATA MODELS

### Firestore Collections

#### 1. **users** (Unified User Collection - RBAC Compliant)
```typescript
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole; // 'super-admin' | 'admin' | 'staff' | 'client'
  phone?: string;
  photoUrl?: string;
  centreIds: string[]; // Associated centres
  primaryCentreId?: string;
  permissions?: string[]; // Custom permissions
  isActive: boolean;
  emailVerified: boolean;

  // Centre associations
  centreLinks?: UserCentreLink[];

  // Profile details
  position?: string;
  department?: string;
  specializations?: string[];
  qualifications?: string | string[];

  // Address
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;

  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Security Rules**: Role-based access, self-read, admin-write, email verification checks

#### 2. **appointments**
```typescript
interface Appointment {
  id: string;
  clientId: string;
  centreId: string;
  serviceId: string;
  staffId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';

  // Denormalized data (performance optimization)
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  staffName: string;
  centreName: string;

  // Additional fields
  notes?: string;
  price: number;
  country?: string; // For currency formatting
  reminderSent?: boolean;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  cancellationReason?: string;

  // Audit fields
  createdBy: string;
  lastModifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Security Rules**: Client can read own, staff can read centre appointments, admin can read all

#### 3. **centres**
```typescript
interface Centre {
  id: string;
  name: string;
  address: {
    street: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  adminIds: string[];
  staffIds: string[];
  services: string[]; // Service IDs offered
  equipment: string[];
  operatingHours: {
    [day: string]: {
      open: string; // HH:MM
      close: string; // HH:MM
      closed?: boolean;
    }[];
  };
  timezone: string;
  isActive: boolean;
  phone?: string;
  email?: string;
  description?: string;
  images?: string[];
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Security Rules**: Public read, admin-only write

#### 4. **services**
```typescript
interface Service {
  id: string;
  centreId: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: 'scan' | 'consultation' | 'treatment' | 'wellness';
  requiredEquipment?: string[];
  staffQualifications: string[];
  isActive: boolean;
  centreIds: string[]; // Centres offering this service
  image?: string;
  benefits?: string[];
  prerequisites?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Security Rules**: Public read, admin-only write

#### 5. **scans** (Delphi Scan System)
```typescript
interface Scan {
  id: string;
  fileIdentifier: string;
  clientId: string | null;
  clientName?: string | null;
  personName?: string | null;
  originalFilename: string;
  uploadSource: 'manual' | 'dropbox';
  scanDate: Date | Timestamp;
  scanTime: string;
  status: 'matched' | 'unmatched' | 'processing' | 'error';
  assignmentType?: 'auto' | 'manual';
  rawDataJson: unknown;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

interface EpdResult {
  id: string;
  scanId: string;
  clientId: string;
  analysisVersion: string;
  scores: EpdScores; // Emotional Polarity Distribution
  createdAt: Timestamp;
}

interface EbcResult {
  id: string;
  scanId: string;
  clientId: string;
  analysisVersion: string;
  scores: EbcScores; // Emotional Balance Calculation
  createdAt: Timestamp;
}
```

**Collections**: `delphi_scans`, `epdResults`, `ebcResults`, `unmatched_basket`, `scan_values`
**Security Rules**: Client can read own scans, staff can read/write all scans

#### 6. **notifications**
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'appointment_reminder' | 'scan_ready' | 'payment_due' | 'system' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  expiresAt?: Date;
}
```

**Security Rules**: Users can read/update own notifications

#### 7. **staff_invitations**
```typescript
interface StaffInvitation {
  id: string;
  email: string;
  role: 'staff' | 'admin';
  centreIds: string[];
  serviceIds?: string[];
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string; // Admin user ID
  createdAt: Date;
  expiresAt: Date;
}
```

**Security Rules**: Admin-only create/update, unauthenticated read for signup

#### 8. **audit_logs**
```typescript
interface AuditLog {
  action: string;
  userId: string;
  targetUserId?: string;
  centreId?: string;
  details?: Record<string, unknown>;
  timestamp: Timestamp;
}
```

**Security Rules**: Admin read-only, authenticated create, immutable updates, super-admin delete

---

## 🔄 SERVICE LAYER ARCHITECTURE

### Service Factory Pattern (`services/serviceFactory.ts`)
The service factory provides abstraction between Firestore and HTTP API implementations:

```typescript
// Feature flags control which implementation is used
export const getClientService = () => {
  const useHttpApi = isFeatureEnabled(FeatureFlags.USE_CLIENTS_API);

  if (useHttpApi && apiClient.isAuthenticated()) {
    return clientServiceHttp; // Secure API implementation
  }

  return clientServiceFirestore; // Legacy Firestore implementation
};

// Available factories
export const ServiceFactory = {
  appointment: getAppointmentService,
  client: getClientService,
  staff: getStaffService,
  centre: getCentreService
};
```

### Feature Flags (`utils/featureFlags.ts`)
```typescript
export enum FeatureFlags {
  USE_APPOINTMENTS_API = 'USE_APPOINTMENTS_API',
  USE_CLIENTS_API = 'USE_CLIENTS_API',
  USE_STAFF_API = 'USE_STAFF_API',
  USE_CENTRES_API = 'USE_CENTRES_API',
  USE_SERVICES_API = 'USE_SERVICES_API',
  USE_SCANS_API = 'USE_SCANS_API'
}

export function isFeatureEnabled(flag: FeatureFlags): boolean {
  return import.meta.env[`VITE_${flag}`] === 'true';
}
```

### HTTP Client Pattern (`services/httpClient.ts`)
```typescript
abstract class BaseHttpService {
  protected handleError(error: unknown, context: string): never {
    log.error(`[${context}] API Error:`, error);
    if (isApiError(error)) {
      throw error;
    }
    throw new Error(getErrorMessage(error));
  }

  protected logOperation(operation: string, data?: unknown): void {
    log.info(`[HttpClient] ${operation}`, data, 'HttpClient');
  }
}

export class AppointmentsHttpService extends BaseHttpService {
  async getAll(filters?): Promise<Appointment[]> { /* ... */ }
  async getById(id: string): Promise<Appointment | null> { /* ... */ }
  async create(data): Promise<string> { /* ... */ }
  async update(id: string, data): Promise<void> { /* ... */ }
  async delete(id: string): Promise<void> { /* ... */ }
}
```

### Firestore Service Pattern (`features/clients/api/clientServiceFirestore.ts`)
```typescript
export const clientServiceFirestore = {
  async getAll(searchTerm = '', filterStatus = 'all'): Promise<Client[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'client'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  },

  async getById(id: string): Promise<Client | null> {
    const docRef = doc(db, 'users', id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Client : null;
  },

  async create(data: Partial<Client>, photoFile?: File): Promise<string> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...data,
      role: 'client',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }
};
```

---

## 🎯 REACT QUERY PATTERNS

### Query Client Configuration (`lib/queryClient.ts`)
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Custom Hook Pattern (Data Fetching)
```typescript
// hooks/useDashboardData.ts
export function useDashboardData() {
  const { profile } = useUserProfile();

  return useQuery({
    queryKey: ['dashboard-data', profile?.id],
    queryFn: async () => {
      const service = getClientService();
      const [clients, appointments] = await Promise.all([
        service.getAll(),
        getAppointmentService().getAll()
      ]);
      return { clients, appointments };
    },
    enabled: !!profile,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
```

### Mutation Pattern
```typescript
// hooks/useAppointmentMutations.ts
export function useAppointmentMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Partial<Appointment>) => {
      return getAppointmentService().create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create appointment: ${error.message}`);
    }
  });

  return { createMutation };
}
```

---

## 🧩 COMPONENT PATTERNS

### Component Organization
1. **Feature Components**: Located in `features/{domain}/components/`
2. **Shared Components**: Located in `components/` or `shared/components/`
3. **Page Components**: Located in `pages/`
4. **Layout Components**: Located in `components/layout/`

### Form Pattern (React Hook Form + Zod)
```typescript
// components/forms/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await authService.login(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Modal Pattern
```typescript
// Example from appointment booking
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingData) => void;
}

export function AppointmentCreateModal({ isOpen, onClose, onSubmit }: ModalProps) {
  // Modal implementation with controlled open/close state
}
```

### Protected Route Pattern
```typescript
// components/auth/PermissionProtectedRoute.tsx
export default function PermissionProtectedRoute({
  permission,
  children
}: {
  permission: Permissions;
  children: React.ReactNode;
}) {
  const { profile, loading } = useUserProfile();

  if (loading) return <LoadingSpinner />;

  const hasPermission = checkPermission(profile, permission);

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

---

## 📊 HEALTH MONITORING SYSTEM

### Health Monitoring Configuration (`package.json`)
```json
{
  "healthMonitoring": {
    "enabled": true,
    "checkInterval": 30000,
    "alertThresholds": {
      "pageLoadTime": 1500,
      "apiResponseTime": 200,
      "memoryUsage": 512,
      "buildTime": 30000
    },
    "criticalPaths": ["/", "/login", "/signup", "/appointments"],
    "integrations": {
      "github": {
        "enabled": true,
        "createIssues": true,
        "labels": ["health-monitor", "automated"]
      },
      "dashboard": {
        "enabled": true,
        "path": "/admin/health"
      }
    }
  }
}
```

### Health Check Scripts
- `npm run monitor:start` - Start health monitoring
- `npm run monitor:health` - Run quick health check
- `npm run validate:app` - Validate application health
- `npm run github:sync` - Sync with GitHub issues

---

## 🔨 BUILD & DEPLOYMENT

### Vite Configuration (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3090,
    host: 'localhost',
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2018',
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/*'],
          'vendor-charts': ['recharts', 'd3'],
          'pages-admin': ['/src/pages/admin/'],
          'features': ['/src/features/'],
        }
      }
    }
  }
});
```

### Zero Tolerance Validation
```bash
# Pre-commit validation (MANDATORY)
npm run zero-tolerance-check

# Checks performed:
# ✅ Zero TypeScript compilation errors
# ✅ Zero ESLint errors/warnings
# ✅ Zero console.log statements
# ✅ Zero catch block violations (undefined error refs)
# ✅ Zero bundle size violations (<500KB chunks)
# ✅ Zero void error anti-patterns
```

### Deployment Commands
```bash
# Development
npm run dev              # Start dev server on localhost:3090

# Build
npm run build           # Production build
npm run type-check      # TypeScript validation
npm run lint            # ESLint validation

# Testing
npm test                # Run Vitest tests
npm run test:coverage   # With coverage
npm run test:e2e        # Run Playwright E2E tests

# Firebase
npm run firebase:deploy # Build + deploy to Firebase Hosting
```

---

## 🧪 TESTING STRATEGY

### Unit Testing (Vitest)
```typescript
// Example: Component test
import { render, screen } from '@testing-library/react';
import { StaffCard } from './StaffCard';

test('renders staff name', () => {
  const staff = { id: '1', firstName: 'John', lastName: 'Doe' };
  render(<StaffCard staff={staff} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

### E2E Testing (Playwright)
```typescript
// Example: tests/e2e/auth-flow.spec.ts
test('admin can login successfully', async ({ page }) => {
  await page.goto('http://localhost:3090/login');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin/);
});
```

### Test Commands
```bash
npm test                           # Run all unit tests
npm run test:watch                 # Watch mode
npm run test:ui                    # Vitest UI
npm run test:coverage              # Generate coverage report
npm run test:e2e                   # Run Playwright E2E tests
npm run test:admin-creation        # Run admin creation E2E test
```

---

## 🚀 KEY BUSINESS LOGIC

### Appointment Booking Flow
1. Client selects centre → service → staff → date
2. System checks staff availability via `useAvailableTimeSlots` hook
3. Time slot validation against working hours and existing appointments
4. Appointment creation with denormalized data (clientName, serviceName, etc.)
5. Email notification sent via `emailNotificationService`
6. Calendar event creation (optional)

### Staff Creation & Invitation Flow
1. Admin creates staff invitation via `staffService.createInvitation()`
2. Invitation email sent with unique token
3. Staff signs up using invitation link
4. Email verification required
5. Admin approves staff account
6. Custom claims synced via `syncUserCustomClaims()`
7. Staff account activated with centre/service permissions

### Scan Processing Flow (Delphi Scanner)
1. Scan file uploaded to `delphi_scans` collection
2. Auto-matching algorithm attempts to find client by name/ID
3. If matched: Status = 'matched', clientId populated
4. If unmatched: Added to `unmatched_basket` for manual assignment
5. EPD/EBC analysis generated and stored in `epdResults`/`ebcResults`
6. Client notified when scan is ready
7. Scan results displayed in client dashboard

### RBAC Permission Checking
```typescript
// Example: Check if user can manage appointments
const canManage = await userHasPermission(
  userId,
  Permissions.MANAGE_APPOINTMENTS,
  resourceOwnerId, // Appointment owner
  resourceCentreId, // Appointment centre
  resourceServiceId // Appointment service
);

// Permission resolution:
// 1. Super-admin: Always true
// 2. Admin: True if linked to centre
// 3. Staff: True if linked to centre AND authorized for service
// 4. Client: True if resourceOwnerId === userId (own appointments only)
```

---

## 📦 CRITICAL DEPENDENCIES

### Production Dependencies
```json
{
  "@tanstack/react-query": "^5.81.2",    // Server state management
  "firebase": "^11.2.0",                  // Backend services
  "react": "^18.3.1",                     // UI framework
  "react-router-dom": "^7.1.4",          // Routing
  "react-hook-form": "^7.62.0",          // Form handling
  "zod": "^3.24.1",                       // Schema validation
  "tailwind-merge": "^3.3.1",            // CSS utility merging
  "framer-motion": "^12.18.1",           // Animations
  "recharts": "^2.15.4",                  // Charts
  "date-fns": "^4.1.0",                   // Date utilities
  "lucide-react": "^0.522.0"              // Icons
}
```

### Development Dependencies
```json
{
  "@playwright/test": "^1.54.2",          // E2E testing
  "@vitest/ui": "^2.0.0",                 // Unit testing
  "typescript": "~5.7.2",                 // Type checking
  "vite": "^6.0.5",                       // Build tool
  "eslint": "^9.17.0",                    // Linting
  "prettier": "^3.5.3",                   // Formatting
  "tailwindcss": "^3.4.17"                // CSS framework
}
```

---

## 🔍 LOGGING & ERROR HANDLING

### Structured Logging (`lib/logger.ts`)
```typescript
export const log = {
  info: (message: string, data?: unknown, component?: string) => {
    console.log(`[INFO] [${component}] ${message}`, data);
  },
  error: (message: string, error?: unknown, component?: string) => {
    console.error(`[ERROR] [${component}] ${message}`, error);
  },
  warn: (message: string, data?: unknown, component?: string) => {
    console.warn(`[WARN] [${component}] ${message}`, data);
  }
};

// Usage:
log.info('User logged in', { userId: '123' }, 'AuthService');
log.error('Failed to fetch clients', error, 'ClientService');
```

### Error Handling (`lib/errorHandler.ts`)
```typescript
export const errorHandler = {
  handle: (error: unknown, context?: Record<string, unknown>) => {
    // Log error, show toast, send to monitoring service
  },
  handleSilent: (error: unknown, context?: Record<string, unknown>) => {
    // Log error without user notification
  }
};
```

---

## 🎨 UI/UX PATTERNS

### Tailwind CSS Classes
- **Layout**: `flex`, `grid`, `container`, `mx-auto`
- **Spacing**: `p-4`, `m-6`, `space-y-4`, `gap-2`
- **Typography**: `text-lg`, `font-semibold`, `text-gray-700`
- **Colors**: `bg-blue-500`, `text-white`, `border-gray-200`
- **Responsive**: `sm:`, `md:`, `lg:`, `xl:` breakpoints

### Component Library
- **Buttons**: Primary, secondary, outline, ghost variants
- **Forms**: Input, select, textarea, checkbox, radio
- **Modals**: Dialog, confirmation, full-screen
- **Tables**: Sortable, filterable, paginated
- **Cards**: Info cards, stat cards, action cards
- **Loading**: Spinners, skeletons, progress bars

### Toast Notifications (`contexts/ToastContext.tsx`)
```typescript
import { useToast } from '@/contexts/ToastContext';

const { showToast } = useToast();

showToast('Success message', 'success');
showToast('Error occurred', 'error');
showToast('Warning message', 'warning');
showToast('Info message', 'info');
```

---

## 🔐 SECURITY BEST PRACTICES

### Firestore Security Rules (`firestore.rules`)
- **Principle of Least Privilege**: Users only access what they need
- **Resource-level permissions**: Centre-specific, service-specific access
- **Helper functions**: `isAuthenticated()`, `isAdmin()`, `hasRole()`
- **Audit trails**: All critical operations logged to `audit_logs`

### Input Validation
- **Zod schemas**: All forms validated with Zod
- **TypeScript**: Strict type checking enabled
- **Sanitization**: User input sanitized before Firestore writes

### Authentication Security
- **Email verification**: Required for staff/admin accounts
- **Custom claims**: Role-based access control via Firebase claims
- **Token refresh**: Automatic token refresh on auth state changes
- **Session management**: Secure session handling with Firebase Auth

---

## 📚 COMMON PATTERNS & UTILITIES

### Date Formatting (`lib/timestampUtils.ts`)
```typescript
import { formatDate } from '@/lib/timestampUtils';

formatDate(date, 'yyyy-MM-dd');
formatDate(timestamp, 'PPP'); // Pretty format
```

### API Configuration (`lib/apiConfig.ts`)
```typescript
export const API_ENDPOINTS = {
  appointments: {
    base: '/api/appointments',
    byId: (id: string) => `/api/appointments/${id}`,
    staffAvailability: (staffId: string) => `/api/appointments/availability/${staffId}`,
  },
  clients: {
    base: '/api/clients',
    byId: (id: string) => `/api/clients/${id}`,
  },
  // ... more endpoints
};
```

### Feature Flags (`utils/featureFlags.ts`)
```typescript
import { isFeatureEnabled, FeatureFlags } from '@/utils/featureFlags';

if (isFeatureEnabled(FeatureFlags.USE_CLIENTS_API)) {
  // Use HTTP API
} else {
  // Use Firestore
}
```

---

## 🎯 PROJECT-SPECIFIC GOTCHAS

### 1. **Service Factory Timing Issues**
Always use the factory functions synchronously. The factory returns actual service objects, not promises.

```typescript
// ✅ CORRECT
const service = getClientService();
const clients = await service.getAll();

// ❌ WRONG
const service = await getClientService(); // Factory is not async!
```

### 2. **Firestore Timestamp Handling**
Firestore timestamps need conversion when reading:

```typescript
// Convert Firestore Timestamp to Date
const date = timestamp.toDate();

// Or use timestampUtils
import { convertTimestamp } from '@/lib/timestampUtils';
const date = convertTimestamp(timestamp);
```

### 3. **React Query Cache Invalidation**
Always invalidate related queries after mutations:

```typescript
const mutation = useMutation({
  mutationFn: createClient,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
  }
});
```

### 4. **Route Protection**
Always wrap protected routes with appropriate guards:

```typescript
<Route path="/admin" element={
  <PermissionProtectedRoute permission={Permissions.ACCESS_ADMIN_PANEL}>
    <AdminDashboard />
  </PermissionProtectedRoute>
} />
```

### 5. **Zero Tolerance Policy**
**NEVER** commit without running validation:

```bash
npm run zero-tolerance-check
```

Violations will block commits:
- TypeScript errors
- ESLint warnings
- console.log statements
- Undefined error references in catch blocks
- Bundle size over 500KB

---

## 🔄 MIGRATION STATUS (API Migration)

### Current State
The application is migrating from direct Firestore access to secure HTTP API endpoints.

### Migration Progress
- ✅ Appointments API: Fully implemented
- ✅ Clients API: Read-only implemented (GET)
- ⏳ Clients API: Write operations pending (POST, PUT, DELETE)
- ⏳ Staff API: Not yet implemented
- ⏳ Centres API: Not yet implemented
- ⏳ Services API: Not yet implemented
- ⏳ Scans API: Not yet implemented

### Feature Flag Configuration (.env)
```bash
VITE_USE_APPOINTMENTS_API=true
VITE_USE_CLIENTS_API=true
VITE_USE_STAFF_API=false
VITE_USE_CENTRES_API=false
VITE_USE_SERVICES_API=false
VITE_USE_SCANS_API=false
```

### Migration Pattern
```typescript
// Old: Direct Firestore
const snapshot = await getDocs(collection(db, 'clients'));

// New: HTTP API via service factory
const service = getClientService(); // Returns HTTP or Firestore based on flag
const clients = await service.getAll();
```

---

## 📖 ADDITIONAL RESOURCES

### Documentation Files
- `/docs/API_ARCHITECTURE_SPECIFICATION.md` - API design specification
- `/docs/API_MIGRATION_GUIDE.md` - Migration strategy and patterns
- `/CLAUDE.md` - Claude AI assistant context and guidelines
- `/RULES.md` - Golden guardrails and project rules
- `/package.json` - Full dependency list and scripts

### Scripts Directory
- `/scripts/zero-tolerance-check.js` - Pre-commit validation
- `/scripts/health-monitor.mjs` - Health monitoring service
- `/scripts/validate-app.mjs` - Application validation
- `/scripts/github-workflow-sync.mjs` - GitHub integration

---

## 🏆 BEST PRACTICES FOR THIS PROJECT

1. **Always use service factories** instead of direct Firestore access
2. **Validate with Zod schemas** before submitting forms
3. **Check feature flags** before using API vs Firestore
4. **Use TanStack Query** for all data fetching (never useState for server state)
5. **Run zero-tolerance check** before every commit
6. **Log with structured logger** instead of console.log
7. **Handle errors gracefully** with errorHandler service
8. **Invalidate queries** after mutations
9. **Use TypeScript strict mode** - no 'any' types allowed
10. **Follow RBAC patterns** for all permission checks

---

**Last Updated**: 2025-11-17
**Codebase Version**: Current main branch
**Auto-generated by**: PAI Knowledge Extraction System
