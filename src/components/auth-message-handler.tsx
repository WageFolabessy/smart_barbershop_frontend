'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

/**
 * Auth Message Handler
 *
 * This component reads auth-related messages from URL params
 * (set by middleware) and displays them as toast notifications.
 * It then cleans up the URL params.
 */
export function AuthMessageHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const message = searchParams.get('message')
        const type = searchParams.get('type')

        if (message) {
            // Show toast notification
            if (type === 'error') {
                toast.error(message)
            } else if (type === 'success') {
                toast.success(message)
            } else {
                toast.info(message)
            }

            // Clean up URL params
            const url = new URL(window.location.href)
            url.searchParams.delete('message')
            url.searchParams.delete('type')
            router.replace(url.pathname + url.search, { scroll: false })
        }
    }, [searchParams, router])

    return null
}
