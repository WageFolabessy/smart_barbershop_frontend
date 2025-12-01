'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Star, MessageSquare } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { Review } from '@/types/api'
import { useAuthStore } from '@/store/useAuthStore'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function BarberReviewsPage() {
    const user = useAuthStore((s) => s.user)
    const { data: reviews, isLoading } = useQuery({
        queryKey: ['barber-reviews', user?.id],
        queryFn: async () => {
            if (!user?.id) return [] as Review[]
            const res = await api.get<{ data: Review[] }>(
                `/api/barbers/${user.id}/reviews`
            )
            return res.data.data
        },
        enabled: !!user?.id,
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-primary text-3xl font-bold tracking-tight">
                    Ulasan
                </h1>
                <p className="text-muted-foreground">
                    Tanggapan pelanggan terhadap layanan Anda.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" /> Ulasan Terbaru
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="text-primary animate-spin" />
                        </div>
                    ) : !reviews || reviews.length === 0 ? (
                        <div className="text-muted-foreground py-12 text-center">
                            Belum ada ulasan dari pelanggan.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="bg-card/50 space-y-2 rounded-lg border p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="font-bold">
                                            {review.customer.name}
                                        </div>
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-muted-foreground/20'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-sm italic">
                                        &ldquo;
                                        {review.comment || 'Tidak ada komentar'}
                                        &rdquo;
                                    </p>
                                    <p className="text-muted-foreground mt-2 border-t pt-2 text-xs">
                                        {format(
                                            new Date(review.created_at),
                                            'd MMMM yyyy',
                                            {
                                                locale: id,
                                            }
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
