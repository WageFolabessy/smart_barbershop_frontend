'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Scissors, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/axios';
import { Booking } from '@/types/api';

export default function HistoryPage() {
    const { data: bookings, isLoading } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const res = await api.get<{ data: Booking[] }>('/api/bookings');
            return res.data.data;
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Terkonfirmasi';
            case 'completed': return 'Selesai';
            case 'cancelled': return 'Dibatalkan';
            case 'pending': return 'Menunggu';
            default: return status;
        }
    };

    const upcomingBookings = bookings?.filter(b => ['pending', 'confirmed'].includes(b.status)) || [];
    const pastBookings = bookings?.filter(b => ['completed', 'cancelled'].includes(b.status)) || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Riwayat Booking</h1>
                <p className="text-muted-foreground">Lihat jadwal dan riwayat cukur Anda.</p>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="upcoming">Akan Datang</TabsTrigger>
                    <TabsTrigger value="history">Selesai</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4 mt-4">
                    {upcomingBookings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Tidak ada jadwal booking yang akan datang.
                        </div>
                    ) : (
                        upcomingBookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} statusColor={getStatusColor(booking.status)} statusLabel={getStatusLabel(booking.status)} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4 mt-4">
                    {pastBookings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Belum ada riwayat booking.
                        </div>
                    ) : (
                        pastBookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} statusColor={getStatusColor(booking.status)} statusLabel={getStatusLabel(booking.status)} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function BookingCard({ booking, statusColor, statusLabel }: { booking: Booking, statusColor: string, statusLabel: string }) {
    return (
        <Card className="overflow-hidden border-l-4 border-l-primary">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={statusColor}>
                                {statusLabel}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                ID: #{booking.id}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold">{booking.service.name}</h3>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(booking.booking_datetime), 'eeee, d MMMM yyyy', { locale: id })}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {format(new Date(booking.booking_datetime), 'HH:mm', { locale: id })}
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {booking.barber.name}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between items-end gap-2">
                        <div className="text-xl font-bold text-primary">
                            {formatCurrency(booking.pricing.final_price)}
                        </div>
                        {/* Add actions like Cancel if pending */}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
