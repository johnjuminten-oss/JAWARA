# Compilation Error Fixes

## Phase 1: Critical TypeScript Errors (Blocking Build)
- [ ] Fix `Unexpected any` errors in API routes
- [ ] Fix `Unexpected any` errors in components
- [ ] Fix `Unexpected any` errors in lib files

## Phase 2: React/JSX Issues (Blocking Build)
- [ ] Fix unescaped entities in JSX
- [ ] Replace `<a>` tags with Next.js `<Link>`
- [ ] Fix useEffect dependency arrays

## Phase 3: Code Quality (Warnings)
- [ ] Remove unused imports and variables
- [ ] Fix const vs let declarations
- [ ] Clean up unused function parameters

## Phase 4: Testing
- [ ] Verify build completes successfully
- [ ] Test critical functionality

## Priority Files (Most Errors):
1. ~~`/app/teacher/dashboard/page.tsx` (20+ errors)~~ ✅ FIXED
2. `/lib/dashboard.ts` (15+ errors)
3. `/app/student/dashboard/page.tsx` (8+ errors)
4. `/components/admin/schedule-management.tsx` (6+ errors)
5. `/components/teacher/teacher-calendar-view.tsx` (8+ errors)
