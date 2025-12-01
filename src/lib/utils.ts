import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { env } from './env'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date)
}

export function formatTime(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    return input.replace(/[<>'"]/g, '').trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate phone number (Indonesian format)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/
    return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Debounce function
 */
export function debounce<TArgs extends unknown[]>(
    func: (...args: TArgs) => unknown,
    wait: number
): (...args: TArgs) => void {
    let timeout: NodeJS.Timeout | null = null
    return (...args: TArgs) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

/**
 * Build absolute asset URL for images coming from backend (Laravel storage)
 * Accepts absolute URLs and returns as-is; prefixes relative paths with API base URL.
 */
export function assetUrl(path?: string | null): string {
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path
    const clean = path.startsWith('/') ? path : `/${path}`
    return `${env.apiUrl}${clean}`
}

// Safe error message extraction for unknown errors (Axios-like)
interface HttpErrorLike {
    response?: { data?: { message?: unknown } }
    message?: unknown
}

export function getErrorMessage(
    error: unknown,
    fallback = 'Terjadi kesalahan'
): string {
    if (typeof error === 'string') return error
    const e = error as HttpErrorLike
    const maybe = e?.response?.data?.message ?? e?.message
    return typeof maybe === 'string' ? maybe : fallback
}
