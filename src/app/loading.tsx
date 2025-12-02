import { Loader2 } from 'lucide-react'

/**
 * Loading Component
 *
 * Displayed during route transitions and middleware redirects.
 * Provides better UX than a blank screen.
 */
export default function Loading() {
    return (
        <div className="bg-background flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="text-primary h-12 w-12 animate-spin" />
                <p className="text-muted-foreground text-sm">Memuat...</p>
            </div>
        </div>
    )
}
