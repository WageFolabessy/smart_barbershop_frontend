# Agent Guidelines - Frontend (Next.js 16 + TypeScript)

## Build/Lint/Test Commands

- **Dev**: `npm run dev` (runs on http://localhost:3000)
- **Build**: `npm run build` (MUST pass before pushing)
- **Lint**: `npm run lint` (MUST pass before pushing)
- **Format**: `npm run format` (auto-format with Prettier)

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS v4, shadcn/ui (Radix components)
- TanStack Query, Zustand, Axios, React Hook Form + Zod

## Code Style

### Imports

- Use `@/*` alias for src imports (e.g., `import { api } from '@/lib/axios'`)
- Order: React/Next → 3rd party libs → local components → hooks → utils → types
- Dynamic imports for browser-only code: `const Cookies = await import('js-cookie')`

### Formatting (Prettier)

- No semicolons, single quotes, 4-space indentation, trailing commas ES5
- Run `npm run format` before committing
- Auto-format on save recommended

### TypeScript

- **Strict mode enabled**. NO `any` types.
- Define types in `src/types/` (e.g., `api.ts` for API responses)
- Use Zod schemas for runtime validation (forms, API data)
- Compiler flags: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

### Naming Conventions

- **Files/Folders**: `kebab-case` (e.g., `user-profile.tsx`, `use-logout.ts`)
- **Components**: `PascalCase` (e.g., `UserProfile`, `BookingCard`)
- **Functions/Variables**: `camelCase` (e.g., `handleSubmit`, `userData`)
- **Interfaces/Types**: `PascalCase` (e.g., `User`, `BookingRequest`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `AUTH_COOKIE_NAMES`, `ROUTES`)

### Component Structure

- Use `'use client'` directive for client components (state, effects, browser APIs)
- Wrap browser API usage in `ClientOnly` component to avoid hydration errors
- Extract complex logic to custom hooks in `src/hooks/`
- Use `src/lib/utils.ts` for shared utility functions

### UI Components (shadcn/ui)

- Base components in `src/components/ui/` (Button, Input, Dialog, etc.)
- **DO NOT** modify shadcn components directly unless for global styling
- Add new components: `npx shadcn@latest add [component-name]`
- Compose custom components using shadcn primitives

### Error Handling

- Always use try-catch for async operations
- Show user-friendly errors via `sonner` toast (already set up)
- Never expose raw API errors to users
- Example:
    ```typescript
    try {
        await api.post('/api/endpoint')
        toast.success('Operasi berhasil')
    } catch (error) {
        console.error('Error:', error)
        toast.error('Terjadi kesalahan. Silakan coba lagi.')
    }
    ```

### State Management

- **Global state**: Zustand (`src/store/useAuthStore.ts`)
- **Server state**: TanStack Query (configured in `src/lib/query-client.ts`)
- **Form state**: React Hook Form with Zod validation

### API Integration

- Use pre-configured Axios instance from `src/lib/axios.ts`
- Auth tokens auto-injected via interceptor
- 401 errors auto-redirect to login

### Authentication & Route Protection

- **Middleware**: `middleware.ts` at root handles auth checks before page loads
- **3-Layer Protection**: Middleware → Layout guards → API interceptor
- **Route Configuration**: Defined in `src/lib/constants.ts` (PROTECTED_ROUTES, ROLE_REDIRECTS)
- **Auth Helpers**: `src/lib/auth-helpers.ts` for server-side auth utilities
- **Role-based Access**:
    - `/admin/*` - Admin only
    - `/barber/*` - Barber only
    - `/booking`, `/riwayat`, `/galeri` - Any authenticated user
- **Server Components**: Layouts use `async/await` with `cookies()` for auth checks
- **Breadcrumbs**: Auto-generated from pathname in protected routes
- **Toast Notifications**: Auth messages passed via URL params and displayed automatically

## Pre-Commit Checklist

1. `npm run format` - Format code
2. `npm run lint` - Check for errors
3. `npm run build` - Ensure production build works
4. Remove `console.log` statements (except intentional logging)
5. Test in browser (check for runtime errors)

## Commit Format

Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`
Examples:

- `feat: implementasi halaman booking dengan validasi form`
- `fix: perbaiki error hydration di komponen navbar`
- `refactor: ekstrak logic autentikasi ke custom hook`
