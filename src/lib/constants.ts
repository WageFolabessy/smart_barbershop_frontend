/**
 * Application-wide constants
 *
 * Centralized location for all hardcoded values, magic numbers,
 * and configuration that doesn't change at runtime.
 */

export const APP_NAME = 'Smart Barbershop'

/**
 * Authentication & Session
 */
export const AUTH_COOKIE_NAMES = {
    TOKEN: 'auth_token',
    USER_ROLE: 'user_role',
} as const

export const COOKIE_OPTIONS = {
    expires: 7, // days
} as const

/**
 * API Configuration
 */
export const API_CONFIG = {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
} as const

/**
 * Query Configuration
 */
export const QUERY_CONFIG = {
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    CACHE_TIME: 10 * 60 * 1000, // 10 minutes
    RETRY_ATTEMPTS: 2,
} as const

/**
 * Route Paths
 */
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    BOOKING: '/booking',
    HISTORY: '/riwayat',
    GALLERY: '/galeri',
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        SERVICES: '/admin/services',
        USERS: '/admin/users',
    },
    BARBER: {
        DASHBOARD: '/barber/dashboard',
    },
} as const

/**
 * User Roles
 */
export const USER_ROLES = {
    ADMIN: 'admin',
    BARBER: 'barber',
    CUSTOMER: 'customer',
} as const

/**
 * Booking Status
 */
export const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const

/**
 * UI Constants
 */
export const UI = {
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 3000,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const
