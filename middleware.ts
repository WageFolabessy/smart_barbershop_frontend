/**
 * Next.js Middleware for Authentication and Authorization
 *
 * This middleware runs on Edge Runtime before every request.
 * It handles:
 * - Route protection (auth required)
 * - Role-based access control (admin/barber/customer)
 * - Redirect logic (unauthenticated users, wrong roles, etc.)
 * - Auto-redirect authenticated users from auth pages
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
    getAuthFromCookies,
    getRedirectUrl,
    isPublicRoute,
    isProtectedRoute,
} from '@/lib/auth-helpers'
import { AUTH_MESSAGES } from '@/lib/constants'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for static files, API routes, and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // Extract auth data from cookies
    const cookieStore = request.cookies
    const { isAuthenticated, role } = getAuthFromCookies(cookieStore)

    // Determine if redirect is needed
    const redirectUrl = getRedirectUrl(role, pathname, isAuthenticated)

    if (redirectUrl) {
        const url = request.nextUrl.clone()
        url.pathname = redirectUrl

        // Add appropriate message as URL param for toast notification
        if (!isAuthenticated && isProtectedRoute(pathname)) {
            url.searchParams.set('message', AUTH_MESSAGES.LOGIN_REQUIRED)
            url.searchParams.set('type', 'info')
        } else if (isAuthenticated && !isPublicRoute(pathname)) {
            url.searchParams.set('message', AUTH_MESSAGES.PERMISSION_DENIED)
            url.searchParams.set('type', 'error')
        }

        // Create response with redirect
        const response = NextResponse.redirect(url)

        // Set cache headers to prevent caching of auth decisions
        response.headers.set(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate'
        )
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')

        return response
    }

    // Allow request through
    const response = NextResponse.next()

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
}

/**
 * Middleware configuration
 * Specifies which routes the middleware should run on
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (*.svg, *.png, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    ],
}
