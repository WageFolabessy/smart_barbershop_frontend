'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { getBreadcrumbs } from '@/lib/auth-helpers'

/**
 * Breadcrumb Component
 *
 * Shows the current navigation path to users.
 * Automatically generates breadcrumbs from the current pathname.
 */
export function Breadcrumb() {
    const pathname = usePathname()
    const breadcrumbs = getBreadcrumbs(pathname)

    // Don't show breadcrumbs on root or auth pages
    if (pathname === '/' || pathname === '/login' || pathname === '/register') {
        return null
    }

    return (
        <nav
            aria-label="Breadcrumb"
            className="border-border/40 bg-card/30 mb-6 rounded-lg border px-4 py-2 backdrop-blur-sm"
        >
            <ol className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                    <li key={crumb.href} className="flex items-center gap-2">
                        {index > 0 && (
                            <ChevronRight className="text-muted-foreground h-4 w-4" />
                        )}
                        {crumb.active ? (
                            <span className="text-foreground flex items-center gap-1.5 font-medium">
                                {index === 0 && (
                                    <Home className="h-3.5 w-3.5" />
                                )}
                                {crumb.label}
                            </span>
                        ) : (
                            <Link
                                href={crumb.href}
                                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                            >
                                {index === 0 && (
                                    <Home className="h-3.5 w-3.5" />
                                )}
                                {crumb.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
