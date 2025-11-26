'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, Camera, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { Booking, Review } from '@/types/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function BarberDashboard() {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Fetch Bookings
    const { data: bookings, isLoading: isLoadingBookings } = useQuery({
        queryKey: ['barber-bookings'],
        queryFn: async () => {
            const res = await api.get<{ data: Booking[] }>('/api/bookings');
            return res.data.data;
        },
    });

    // Fetch Reviews
    const { data: reviews, isLoading: isLoadingReviews } = useQuery({
        queryKey: ['barber-reviews', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const res = await api.get<{ data: Review[] }>(`/api/barbers/${user.id}/reviews`);
            return res.data.data;
        },
        enabled: !!user?.id,
    });

    // Upload Mutation
    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            await api.post('/api/hair-records', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        },
        onSuccess: () => {
            toast.success('Hasil cukur berhasil diupload!');
            setIsUploadOpen(false);
            queryClient.invalidateQueries({ queryKey: ['barber-bookings'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal mengupload hasil.');
        },
    });

    const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedBooking) return;

        const form = e.currentTarget;
        const formData = new FormData(form);
        formData.append('booking_id', selectedBooking.id.toString());
        formData.append('customer_id', selectedBooking.customer.id.toString());

        uploadMutation.mutate(formData);
    };

    const today = new Date();
    const todayBookings = bookings?.filter(b => {
        const d = new Date(b.booking_datetime);
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear() &&
            b.status !== 'cancelled';
    }) || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard Kapster</h1>
                <p className="text-muted-foreground">Antrian dan jadwal Anda hari ini.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Antrian Hari Ini ({format(today, 'eeee, d MMMM yyyy', { locale: id })})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingBookings ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                        ) : todayBookings.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Tidak ada jadwal untuk hari ini.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todayBookings.map((booking) => (
                                    <div key={booking.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-card/50 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 p-3 rounded-full text-primary font-bold text-lg w-16 h-16 flex items-center justify-center border border-primary/20">
                                                {format(new Date(booking.booking_datetime), 'HH:mm')}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{booking.customer.name}</h3>
                                                <p className="text-muted-foreground">{booking.service.name}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline" className={booking.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                                                        {booking.status === 'completed' ? 'Selesai' : 'Menunggu'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <Dialog open={isUploadOpen && selectedBooking?.id === booking.id} onOpenChange={(open) => {
                                            setIsUploadOpen(open);
                                            if (open) setSelectedBooking(booking);
                                            else setSelectedBooking(null);
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="gap-2">
                                                    <Camera className="h-4 w-4" />
                                                    Upload Hasil
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[500px]">
                                                <DialogHeader>
                                                    <DialogTitle>Upload Hasil Cukur</DialogTitle>
                                                    <DialogDescription>
                                                        Simpan foto sebelum dan sesudah untuk riwayat pelanggan.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form onSubmit={handleUpload} className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="before">Foto Before</Label>
                                                            <Input id="before" name="photos[before]" type="file" accept="image/*" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="after">Foto After</Label>
                                                            <Input id="after" name="photos[after]" type="file" accept="image/*" required />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="hair_type">Jenis Rambut</Label>
                                                        <Input id="hair_type" name="hair_type" placeholder="Contoh: Ikal, Lurus, Berminyak" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="notes">Catatan Perawatan</Label>
                                                        <Textarea id="notes" name="treatment_notes" placeholder="Catatan teknis cukuran..." />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="recommendations">Saran untuk Pelanggan</Label>
                                                        <Textarea id="recommendations" name="barber_recommendations" placeholder="Saran styling atau produk..." />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit" disabled={uploadMutation.isPending}>
                                                            {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Simpan
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Ulasan Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingReviews ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                        ) : !reviews || reviews.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Belum ada ulasan dari pelanggan.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-4 border rounded-lg bg-card/50 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold">{review.customer.name}</div>
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-muted-foreground/20'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground italic">"{review.comment || 'Tidak ada komentar'}"</p>
                                        <p className="text-xs text-muted-foreground pt-2 border-t mt-2">
                                            {format(new Date(review.created_at), 'd MMMM yyyy', { locale: id })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
