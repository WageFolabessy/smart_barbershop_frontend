/**
 * Server-side authentication helper utilities
 *
 * These functions are designed to work in Next.js middleware and server components.
 * They provide authentication checks and role-based access control.
 */

import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import {
    AUTH_COOKIE_NAMES,
    UserRole,
    PROTECTED_ROUTES,
    PUBLIC_ROUTES,
    ROLE_REDIRECTS,
} from './constants'

/**
 * Extract authentication data from cookies
 */
export function getAuthFromCookies(
    cookies:
        | ReadonlyRequestCookies
        | { get: (name: string) => { value: string } | undefined }
) {
    let token: string | undefined
    let role: string | undefined

    // Handle both Next.js cookies() and middleware cookies
    if ('get' in cookies && typeof cookies.get === 'function') {
        token = cookies.get(AUTH_COOKIE_NAMES.TOKEN)?.value
        role = cookies.get(AUTH_COOKIE_NAMES.USER_ROLE)?.value
    }

    const isAuthenticated = Boolean(token && role)
    const userRole = role as UserRole | undefined

    return {
        isAuthenticated,
        token,
        role: userRole,
    }
}

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.AUTHENTICATED.some((route) =>
        pathname.startsWith(route)
    )
}

/**
 * Check if a route is public (doesn't require auth)
 */
export function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some((route) => pathname === route)
}

/**
 * Check if a route is an auth page (login/register)
 */
export function isAuthPage(pathname: string): boolean {
    return pathname === '/login' || pathname === '/register'
}

/**
 * Validate if a user role has access to a specific route
 */
export function hasRoleAccess(
    userRole: UserRole | undefined,
    pathname: string
): boolean {
    if (!userRole) return false

    // Admin routes
    if (pathname.startsWith('/admin')) {
        return userRole === 'admin'
    }

    // Barber routes
    if (pathname.startsWith('/barber')) {
        return userRole === 'barber'
    }

    // Customer routes - all authenticated users can access
    if (
        pathname.startsWith('/booking') ||
        pathname.startsWith('/riwayat') ||
        pathname.startsWith('/galeri')
    ) {
        return true // Any authenticated user
    }

    return false
}

/**
 * Get the appropriate redirect URL based on user role and current path
 */
export function getRedirectUrl(
    userRole: UserRole | undefined,
    pathname: string,
    isAuthenticated: boolean
): string | null {
    // If not authenticated and trying to access protected route
    if (!isAuthenticated && isProtectedRoute(pathname)) {
        // Include redirect param to return after login
        return `/login?redirect=${encodeURIComponent(pathname)}`
    }

    // If authenticated and on auth page, redirect to role dashboard
    if (isAuthenticated && isAuthPage(pathname)) {
        return userRole ? ROLE_REDIRECTS[userRole] : '/booking'
    }

    // If authenticated but doesn't have role access
    if (isAuthenticated && !hasRoleAccess(userRole, pathname)) {
        // Redirect to appropriate dashboard
        return userRole ? ROLE_REDIRECTS[userRole] : '/login'
    }

    // If trying to access root and authenticated, redirect to dashboard
    if (isAuthenticated && pathname === '/') {
        return userRole ? ROLE_REDIRECTS[userRole] : '/booking'
    }

    // No redirect needed
    return null
}

/**
 * Get user-friendly route name for breadcrumbs
 */
export function getRouteLabel(pathname: string): string {
    const routeLabels: Record<string, string> = {
        '/': 'Beranda',
        '/login': 'Masuk',
        '/register': 'Daftar',
        '/booking': 'Booking',
        '/riwayat': 'Riwayat',
        '/galeri': 'Galeri',
        '/admin/dashboard': 'Dashboard',
        '/admin/services': 'Layanan',
        '/admin/users': 'Pengguna',
        '/admin/time-slots': 'Slot Waktu',
        '/barber/dashboard': 'Dashboard',
        '/barber/queue': 'Antrian',
        '/barber/records': 'Rekam Rambut',
        '/barber/reviews': 'Ulasan',
    }

    return routeLabels[pathname] || pathname
}

/**
 * Generate breadcrumb items from pathname
 */
export function getBreadcrumbs(pathname: string): Array<{
    label: string
    href: string
    active: boolean
}> {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs = []

    // Add home
    breadcrumbs.push({
        label: getRouteLabel('/'),
        href: '/',
        active: pathname === '/',
    })

    // Build breadcrumbs from path segments
    let currentPath = ''
    for (let i = 0; i < paths.length; i++) {
        currentPath += `/${paths[i]}`
        breadcrumbs.push({
            label: getRouteLabel(currentPath),
            href: currentPath,
            active: i === paths.length - 1,
        })
    }

    return breadcrumbs
}
