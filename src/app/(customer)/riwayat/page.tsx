'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, isPast, startOfDay, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { User, Star, Loader2, Edit, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as DatePicker } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatCurrency, getErrorMessage } from '@/lib/utils';
import api from '@/lib/axios';
import { Booking, Service, User as UserType, TimeSlot, AvailableBarbersEnvelope, CheckAvailabilityResponse, ReviewRequest, UpdateBookingRequest } from '@/types/api';

// Review Schema
const reviewSchema = z.object({
    rating: z.number().min(1, 'Minimal 1 bintang').max(5),
    comment: z.string().max(1000).optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function HistoryPage() {
    const { data: bookings } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const res = await api.get<{ data: Booking[] }>('/api/bookings');
            return res.data.data;
        },
        // Ensure fresh data when arriving on this page
        staleTime: 0,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
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
    const queryClient = useQueryClient();
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

    // Reschedule state
    const [rescheduleService, setRescheduleService] = useState<Service | null>(null);
    const [rescheduleBarber, setRescheduleBarber] = useState<UserType | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
    const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState<TimeSlot | null>(null);

    // Fetch services for reschedule
    const { data: services } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const res = await api.get<{ data: Service[] }>('/api/services');
            return res.data.data;
        },
        enabled: isRescheduleOpen,
    });

    // Fetch barbers for reschedule
    const { data: barbers } = useQuery({
        queryKey: ['barbers'],
        queryFn: async () => {
            const now = new Date().toISOString();
            try {
                const res = await api.get<AvailableBarbersEnvelope>('/api/bookings/available-barbers', {
                    params: { datetime: now }
                });
                return res.data.available_barbers.map(b => ({
                    id: Number(b.id),
                    name: b.name,
                    email: '',
                    role: 'barber' as const,
                    created_at: '',
                    updated_at: ''
                }));
            } catch {
                return [];
            }
        },
        enabled: isRescheduleOpen,
    });

    // Fetch time slots for reschedule
    const { data: timeSlots } = useQuery({
        queryKey: ['time-slots'],
        queryFn: async () => {
            const res = await api.get<{ data: TimeSlot[] }>('/api/time-slots');
            return res.data.data;
        },
        enabled: isRescheduleOpen,
    });

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 5,
            comment: '',
        },
    });

    const reviewMutation = useMutation<void, unknown, ReviewFormValues>({
        mutationFn: async (values) => {
            const payload: ReviewRequest = {
                booking_id: booking.id,
                rating: values.rating,
                comment: values.comment,
            };
            await api.post('/api/reviews', payload);
        },
        onSuccess: () => {
            toast.success('Terima kasih atas ulasan Anda!');
            setIsReviewOpen(false);
            // Invalidate queries if needed
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, 'Gagal mengirim ulasan'));
        },
    });

    // Cancel Booking Mutation
    const cancelMutation = useMutation<void, unknown, void>({
        mutationFn: async () => {
            await api.delete(`/api/bookings/${booking.id}`);
        },
        onSuccess: () => {
            toast.success('Booking berhasil dibatalkan');
            setIsCancelOpen(false);
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, 'Gagal membatalkan booking'));
        },
    });

    // Reschedule Booking Mutation
    const rescheduleMutation = useMutation<void, unknown, void>({
        mutationFn: async () => {
            if (!rescheduleService || !rescheduleBarber || !rescheduleDate || !rescheduleTimeSlot) return;

            // Check if new time is in the past
            const dateStr = format(rescheduleDate, 'yyyy-MM-dd');
            const dateTime = `${dateStr} ${rescheduleTimeSlot.start_time}:00`;
            const newDateTime = new Date(dateTime);

            if (isPast(newDateTime)) {
                throw new Error('Tidak dapat reschedule ke waktu yang sudah lewat');
            }

            // Check availability
            const availRes = await api.post<CheckAvailabilityResponse>('/api/bookings/check-availability', {
                datetime: dateTime,
                barber_id: rescheduleBarber.id,
                service_duration: rescheduleService.duration_minutes,
            });

            if (!availRes.data.available) {
                throw new Error('Slot waktu ini sudah tidak tersedia. Silakan pilih waktu lain.');
            }

            // Perform reschedule
            const payload: UpdateBookingRequest = {
                service_id: rescheduleService.id,
                barber_id: rescheduleBarber.id,
                booking_datetime: dateTime,
            };
            await api.put(`/api/bookings/${booking.id}`, payload);
        },
        onSuccess: () => {
            toast.success('Booking berhasil direschedule!');
            setIsRescheduleOpen(false);
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, 'Gagal reschedule booking'));
        },
    });

    const handleReschedule = () => {
        // Initialize reschedule state with current booking data
        setRescheduleService(booking.service);
        setRescheduleBarber(booking.barber);
        setRescheduleDate(new Date(booking.booking_datetime));
        // Find matching time slot
        const currentTime = format(new Date(booking.booking_datetime), 'HH:mm');
        const matchingSlot = timeSlots?.find(slot => slot.start_time === currentTime);
        setRescheduleTimeSlot(matchingSlot || null);
        setIsRescheduleOpen(true);
    };

    const canReschedule = ['pending', 'confirmed'].includes(booking.status);

    const onSubmit = (data: ReviewFormValues) => {
        reviewMutation.mutate(data);
    };

    return (
        <>
            <Card className="overflow-hidden border border-border/60 bg-background/60 backdrop-blur-sm transition-shadow hover:shadow-lg">
                <CardContent className="p-4 md:p-5">
                    <div className="grid gap-4 md:gap-5">
                        {/* Top row: status + service name */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className={cn("px-2 py-0.5 text-[11px] md:text-xs font-medium rounded-md border", statusColor)}>
                                    {statusLabel}
                                </Badge>
                                <span className="text-[11px] md:text-xs text-muted-foreground">ID #{booking.id}</span>
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold leading-tight tracking-tight">
                                {booking.service?.name || 'Layanan'}
                            </h3>
                        </div>

                        {/* Middle: meta + price/actions in grid */}
                        <div className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>{format(new Date(booking.booking_datetime), 'eeee, d MMMM yyyy • HH:mm', { locale: id })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>{booking.barber?.name || 'Tanpa kapster'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 w-full md:w-56">
                                <div className="flex flex-col pb-1">
                                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Total</span>
                                    <span className="text-2xl font-bold text-primary leading-none">{formatCurrency(booking.pricing.final_price)}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {canReschedule && (
                                        <Button variant="outline" size="sm" className="gap-1" onClick={handleReschedule} aria-label="Reschedule booking">
                                            <Edit className="h-4 w-4" />
                                            <span>Reschedule</span>
                                        </Button>
                                    )}
                                    {canReschedule && (
                                        <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" aria-label="Batalkan booking">
                                                    Batalkan
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Batalkan Booking?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Apakah Anda yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Tidak</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            cancelMutation.mutate();
                                                        }}
                                                        className="bg-red-500 hover:bg-red-600"
                                                    >
                                                        {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ya, Batalkan'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                    {booking.status === 'completed' && (
                                        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-1" aria-label="Beri ulasan">
                                                    <Star className="h-4 w-4" /> Ulasan
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Beri Ulasan Layanan</DialogTitle>
                                                    <DialogDescription>
                                                        Bagaimana pengalaman cukur Anda dengan {booking.barber.name}?
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <Form {...form}>
                                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="rating"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Rating</FormLabel>
                                                                    <FormControl>
                                                                        <div className="flex gap-2">
                                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                                <button
                                                                                    key={star}
                                                                                    type="button"
                                                                                    onClick={() => field.onChange(star)}
                                                                                    className={`focus:outline-none transition-colors ${star <= field.value ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                                                                                >
                                                                                    <Star className="h-8 w-8" fill={star <= field.value ? "currentColor" : "none"} />
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="comment"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Komentar (Opsional)</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea placeholder="Ceritakan pengalaman Anda..." {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <DialogFooter>
                                                            <Button type="submit" disabled={reviewMutation.isPending}>
                                                                {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                Kirim Ulasan
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reschedule Dialog - Outside Card to prevent overlap */}
            <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Reschedule Booking</DialogTitle>
                        <DialogDescription>
                            Ubah detail booking Anda. Kami akan mengecek ketersediaan sebelum menyimpan perubahan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Service Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Layanan</label>
                            <Select value={rescheduleService?.id.toString()} onValueChange={(val) => {
                                const service = services?.find(s => s.id.toString() === val);
                                setRescheduleService(service || null);
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih layanan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services?.map((service) => (
                                        <SelectItem key={service.id} value={service.id.toString()}>
                                            {service.name} - {formatCurrency(service.base_price)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Barber Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Kapster</label>
                            <Select value={rescheduleBarber?.id.toString()} onValueChange={(val) => {
                                const barber = barbers?.find(b => b.id.toString() === val);
                                setRescheduleBarber(barber || null);
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kapster" />
                                </SelectTrigger>
                                <SelectContent>
                                    {barbers?.map((barber) => (
                                        <SelectItem key={barber.id} value={barber.id.toString()}>
                                            {barber.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Picker */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tanggal</label>
                            <DatePicker
                                mode="single"
                                selected={rescheduleDate}
                                onSelect={setRescheduleDate}
                                disabled={(date) => isPast(startOfDay(date)) && !isSameDay(date, new Date())}
                                className="rounded-md border"
                            />
                        </div>

                        {/* Time Slot Selector */}
                        {rescheduleDate && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Pilih Waktu</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {timeSlots?.map((slot) => (
                                        <Button
                                            key={slot.id}
                                            variant={rescheduleTimeSlot?.id === slot.id ? "default" : "outline"}
                                            className={cn(
                                                "relative h-auto py-3 flex flex-col gap-1",
                                                slot.is_peak_hour && "border-primary/50"
                                            )}
                                            onClick={() => setRescheduleTimeSlot(slot)}
                                            aria-label={`Pilih slot waktu ${slot.start_time?.substring(0,5)}${slot.label ? `, ${slot.label}` : ''}`}
                                            disabled={!slot.is_active}
                                            title={!slot.is_active ? 'Slot tidak aktif' : undefined}
                                        >
                                            <span className="font-bold">{slot.start_time?.substring(0, 5) || 'N/A'}</span>
                                            {slot.label && (
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "text-[10px] px-1.5 h-auto py-0.5 w-[90px] overflow-hidden relative",
                                                        slot.is_peak_hour
                                                            ? "bg-primary/20 text-primary hover:bg-primary/30"
                                                            : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                                    )}
                                                    title={slot.label}
                                                >
                                                    <span
                                                        className={cn(
                                                            "inline-block whitespace-nowrap",
                                                            slot.label.length > 12 && "animate-marquee"
                                                        )}
                                                    >
                                                        {slot.label}
                                                    </span>
                                                </Badge>
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {rescheduleService && rescheduleTimeSlot && (
                        <div className="rounded-md border p-3 flex items-center justify-between text-sm">
                            <div className="text-muted-foreground">Total Estimasi</div>
                            <div className="text-right">
                                <div className="font-bold text-primary">
                                    {formatCurrency(rescheduleService.base_price * rescheduleTimeSlot.price_multiplier)}
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        ({formatCurrency(rescheduleService.base_price)} × {rescheduleTimeSlot.price_multiplier}x)
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            onClick={() => rescheduleMutation.mutate()}
                            disabled={!rescheduleService || !rescheduleBarber || !rescheduleDate || !rescheduleTimeSlot || rescheduleMutation.isPending}
                        >
                            {rescheduleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
