# Build Error Fixes

## TypeScript/ESLint Errors to Fix

### Critical Errors (Blocking Build)

#### 1. `any` Type Errors
- **app/api/admin/batches/route.ts**: Line 36 - `Record<string, any>` should be properly typed
- **app/api/notifications/[id]/route.ts**: Lines 4, 36 - `ctx: any` parameters need proper typing
- **app/student/dashboard/page.new.tsx**: Lines 57, 62, 63, 100 - Multiple `any` types
- **app/teacher/dashboard/page.tsx**: Lines 11, 25, 39, 46, 53 - Multiple `any` types in interfaces
- **components/admin/admin-broadcast-form.tsx**: Lines 106, 182 - `any` types
- **components/admin/dashboard-content.tsx**: Lines 22, 23, 31 - `any` types
- **components/admin/schedule-management.tsx**: Lines 46, 135, 228 - `any` types
- **components/admin/subject-management.tsx**: Lines 47, 87, 115, 128, 146, 152 - `any` types
- **components/admin/system-settings.tsx**: Line 85 - `any` type
- **components/admin/teacher-assignment.tsx**: Lines 81, 166, 196 - `any` types
- **components/alerts/alert-modal.tsx**: Line 16 - `any` type
- **components/dashboard/broadcast-banner.tsx**: Line 44 - `any` type
- **components/profile/profile-form.tsx**: Line 53 - `any` type
- **components/schedule/event-form.tsx**: Line 43 - `any` type
- **components/student/dashboard-content.tsx**: Lines 48-64 - Multiple `any` types
- **components/student/student-calendar-view.tsx**: Lines 30, 31, 70 - `any` types
- **components/student/teacher-broadcast-banner.tsx**: Lines 64, 87 - `any` types
- **components/teacher/broadcast-form.tsx**: Lines 32, 33, 70, 164, 254 - `any` types
- **components/teacher/dashboard-content.tsx**: Lines 20-23, 38, 40, 78 - `any` types
- **components/teacher/teacher-calendar-view.tsx**: Lines 17, 36, 105, 179-185 - `any` types
- **lib/dashboard.ts**: Lines 33, 38, 40 - `any` types
- **lib/utils.ts**: Line 67 - `any` type

#### 2. React/HTML Issues
- **app/auth/sign-up-success/page.tsx**: Line 15 - Unescaped apostrophe in JSX
- **app/not-found.tsx**: Line 10 - Using `<a>` instead of Next.js `<Link>`
- **components/student/dashboard-content.tsx**: Line 125 - Unescaped apostrophe
- **components/student/student-calendar-view.tsx**: Line 197 - Unescaped apostrophe

#### 3. Unused Variables
- Multiple files have unused variable warnings that should be cleaned up

### Plan

1. **Phase 1**: Fix critical `any` type errors in API routes
2. **Phase 2**: Fix `any` types in dashboard pages
3. **Phase 3**: Fix `any` types in components
4. **Phase 4**: Fix React/HTML issues
5. **Phase 5**: Clean up unused variables
6. **Phase 6**: Test build

### Type Definitions Needed

```typescript
// Common types that should be used instead of `any`
interface DatabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

interface ApiResponse<T> {
  data: T | null
  error: DatabaseError | null
}

interface RouteParams {
  params: {
    id: string
    [key: string]: string | string[]
  }
}

interface UpdateData {
  [key: string]: string | number | boolean | null
}
