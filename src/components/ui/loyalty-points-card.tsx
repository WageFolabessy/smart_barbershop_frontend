'use client'

import { Star, TrendingUp, Gift } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CounterAnimation } from '@/components/ui/counter-animation'
import { cn } from '@/lib/utils'

interface LoyaltyPointsCardProps {
    points?: number
    className?: string
    showDetails?: boolean
}

/**
 * LoyaltyPointsCard Component
 * 
 * Displays detailed loyalty points information in a card format.
 * Used in customer dashboard and profile pages.
 * 
 * @param points - Current loyalty points balance
 * @param className - Additional CSS classes
 * @param showDetails - Whether to show additional details (earning rate, tips)
 */
export function LoyaltyPointsCard({
    points = 0,
    className,
    showDetails = true
}: LoyaltyPointsCardProps) {
    // Safely handle undefined/null points
    const safePoints = points ?? 0
    
    // Calculate equivalent spending (1 point = Rp 10,000)
    const equivalentSpending = safePoints * 10000

    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/20 p-3">
                        <Star className="h-6 w-6 fill-primary text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Poin Loyalitas</CardTitle>
                        <CardDescription>Total poin yang Anda miliki</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                {/* Points Display */}
                <div className="mb-6 text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                        <Star className="h-8 w-8 fill-primary text-primary" />
                        <CounterAnimation
                            value={safePoints}
                            duration={1500}
                            className="text-5xl font-bold tabular-nums text-primary"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Setara dengan belanja{' '}
                        <span className="font-semibold text-foreground">
                            Rp {equivalentSpending.toLocaleString('id-ID')}
                        </span>
                    </p>
                </div>

                {showDetails && (
                    <>
                        <div className="space-y-3 border-t pt-4">
                            {/* Earning Rate */}
                            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                                <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                <div className="flex-1 text-sm">
                                    <p className="font-medium text-foreground mb-1">
                                        Cara Mendapatkan Poin
                                    </p>
                                    <p className="text-muted-foreground">
                                        Dapatkan <span className="font-semibold text-primary">1 poin</span>{' '}
                                        untuk setiap <span className="font-semibold">Rp 10.000</span>{' '}
                                        yang Anda belanjakan
                                    </p>
                                </div>
                            </div>

                            {/* Future Use Hint */}
                            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                                <Gift className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                <div className="flex-1 text-sm">
                                    <p className="font-medium text-foreground mb-1">
                                        Manfaat Poin
                                    </p>
                                    <p className="text-muted-foreground">
                                        Kumpulkan poin Anda untuk mendapatkan benefit eksklusif di masa mendatang
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
