'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoyaltyPointsBadgeProps {
    points?: number
    className?: string
    showLabel?: boolean
    size?: 'sm' | 'md' | 'lg'
}

/**
 * LoyaltyPointsBadge Component
 * 
 * Displays customer loyalty points with a gold star icon.
 * Used in navigation bars and headers.
 * 
 * @param points - Current loyalty points balance
 * @param className - Additional CSS classes
 * @param showLabel - Whether to show "Poin Loyalitas" label
 * @param size - Badge size variant
 */
export function LoyaltyPointsBadge({
    points = 0,
    className,
    showLabel = false,
    size = 'md'
}: LoyaltyPointsBadgeProps) {
    const sizeClasses = {
        sm: 'text-xs px-2 py-1 gap-1',
        md: 'text-sm px-3 py-1.5 gap-1.5',
        lg: 'text-base px-4 py-2 gap-2'
    }

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 16
    }

    // Safely handle undefined/null points
    const safePoints = points ?? 0

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full',
                'bg-primary/10 dark:bg-primary/20',
                'border border-primary/20',
                'font-semibold text-primary',
                'transition-all duration-300',
                'hover:bg-primary/20 dark:hover:bg-primary/30',
                'hover:scale-105',
                sizeClasses[size],
                className
            )}
            title={
                showLabel
                    ? `Poin Loyalitas: ${safePoints.toLocaleString('id-ID')}`
                    : `${safePoints.toLocaleString('id-ID')} poin`
            }
        >
            <Star
                size={iconSizes[size]}
                className="fill-primary text-primary"
                aria-hidden="true"
            />
            <span className="tabular-nums">
                {safePoints.toLocaleString('id-ID')}
            </span>
            {showLabel && (
                <span className="hidden sm:inline ml-1">Poin</span>
            )}
        </div>
    )
}
