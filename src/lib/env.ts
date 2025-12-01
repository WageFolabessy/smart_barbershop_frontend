/**
 * Environment variables validation and type-safe access
 *
 * This module ensures all required environment variables are present
 * and provides type-safe access to them.
 */

function validateEnv() {
    const missing: string[] = []

    if (!process.env.NEXT_PUBLIC_API_URL) {
        missing.push('NEXT_PUBLIC_API_URL')
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env.local file or environment configuration.'
        )
    }
}

// Only validate in production builds, not during development
// Development has fallback values, so validation is optional
if (process.env.NODE_ENV === 'production') {
    validateEnv()
}

/**
 * Type-safe environment variable access
 * Development fallbacks are provided for convenience
 */
export const env = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'Smart Barbershop',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
} as const
