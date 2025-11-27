'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,

} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, Loader2, Camera, Star, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import Image from 'next/image';

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

// ... (imports)

export default function BarberDashboard() {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Hair Record Management State
    const [editingRecord, setEditingRecord] = useState<any | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deletingRecord, setDeletingRecord] = useState<any | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Fetch Bookings
    const { data: bookings, isLoading: isLoadingBookings } = useQuery({
        queryKey: ['barber-bookings'],
        queryFn: async () => {
            const res = await api.get<{ data: Booking[] }>('/api/bookings');
            return res.data.data;
        },
    });

    // Fetch Hair Records
    const { data: hairRecords, isLoading: isLoadingRecords } = useQuery({
        queryKey: ['hair-records'],
        queryFn: async () => {
            const res = await api.get<{ data: any[] }>('/api/hair-records');
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
            queryClient.invalidateQueries({ queryKey: ['hair-records'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Gagal mengupload hasil cukur');
        },
    });

    // Edit Hair Record Mutation
    const editRecordMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            if (!editingRecord) return;
            // Use _method=PUT for Laravel FormData handling if needed, or just PUT if backend supports it directly
            // Usually Laravel needs _method=PUT for multipart/form-data on PUT requests
            formData.append('_method', 'PUT');
            await api.post(`/api/hair-records/${editingRecord.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => {
            toast.success('Record berhasil diperbarui!');
            setIsEditOpen(false);
            setEditingRecord(null);
            queryClient.invalidateQueries({ queryKey: ['hair-records'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Gagal memperbarui record');
        },
    });

    // Delete Hair Record Mutation
    const deleteRecordMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/hair-records/${id}`);
        },
        onSuccess: () => {
            toast.success('Record berhasil dihapus!');
            setIsDeleteOpen(false);
            setDeletingRecord(null);
            queryClient.invalidateQueries({ queryKey: ['hair-records'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Gagal menghapus record');
        },
    });

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        editRecordMutation.mutate(formData);
    };

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
                <p className="text-muted-foreground">Kelola antrian, riwayat cukur, dan ulasan.</p>
            </div>

            <Tabs defaultValue="queue" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                    <TabsTrigger value="queue">Antrian Hari Ini</TabsTrigger>
                    <TabsTrigger value="records">Riwayat Cukur</TabsTrigger>
                    <TabsTrigger value="reviews">Ulasan</TabsTrigger>
                </TabsList>

                <TabsContent value="queue" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Antrian Hari Ini ({format(today, 'eeee, d MMMM yyyy', { locale: id })})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* ... (Existing Booking List Logic) ... */}
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
                                            {/* ... (Existing Booking Item UI) ... */}
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
                                                    {/* ... (Existing Upload Form) ... */}
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
                                                            <Label htmlFor="scalp_condition">Kondisi Kulit Kepala</Label>
                                                            <Input id="scalp_condition" name="scalp_condition" placeholder="Contoh: Kering, Berketombe, Normal" />
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
                                                                {uploadMutation.isPending ? 'Menyimpan...' : 'Simpan'}
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
                </TabsContent>

                <TabsContent value="records" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Hasil Cukur</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingRecords ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                            ) : !hairRecords || hairRecords.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    Belum ada data riwayat cukur.
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {hairRecords.map((record) => (
                                        <Card key={record.id} className="overflow-hidden">
                                            <div className="aspect-video relative bg-muted">
                                                {record.photos?.after ? (
                                                    <Image
                                                        src={record.photos.after}
                                                        alt="Hair cut result - After"
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                                                )}
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => {
                                                        setEditingRecord(record);
                                                        setIsEditOpen(true);
                                                    }} aria-label="Edit hair record">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => {
                                                        setDeletingRecord(record);
                                                        setIsDeleteOpen(true);
                                                    }} aria-label="Delete hair record">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-bold">{record.customer?.name || 'Pelanggan'}</h3>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {format(new Date(record.created_at), 'd MMM yyyy', { locale: id })}
                                                </p>
                                                <div className="text-sm space-y-1">
                                                    <p><span className="font-medium">Jenis:</span> {record.hair_type || '-'}</p>
                                                    <p className="truncate"><span className="font-medium">Catatan:</span> {record.treatment_notes || '-'}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Ulasan Terbaru
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* ... (Existing Reviews Logic) ... */}
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
                </TabsContent>
            </Tabs>

            {/* Edit Record Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Hasil Cukur</DialogTitle>
                        <DialogDescription>
                            Perbarui data riwayat cukur pelanggan.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-before">Foto Before (Opsional)</Label>
                                <Input id="edit-before" name="photos[before]" type="file" accept="image/*" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-after">Foto After (Opsional)</Label>
                                <Input id="edit-after" name="photos[after]" type="file" accept="image/*" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-hair_type">Jenis Rambut</Label>
                            <Input id="edit-hair_type" name="hair_type" defaultValue={editingRecord?.hair_type} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-scalp_condition">Kondisi Kulit Kepala</Label>
                            <Input id="edit-scalp_condition" name="scalp_condition" defaultValue={editingRecord?.scalp_condition} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-notes">Catatan Perawatan</Label>
                            <Textarea id="edit-notes" name="treatment_notes" defaultValue={editingRecord?.treatment_notes} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-recommendations">Saran untuk Pelanggan</Label>
                            <Textarea id="edit-recommendations" name="barber_recommendations" defaultValue={editingRecord?.barber_recommendations} />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={editRecordMutation.isPending}>
                                {editRecordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editRecordMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Riwayat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data riwayat cukur ini akan dihapus permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingRecord && deleteRecordMutation.mutate(deletingRecord.id)}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {deleteRecordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
