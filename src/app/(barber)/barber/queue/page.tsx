'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Camera, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/axios'
import { Booking } from '@/types/api'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { toast } from 'sonner'

export default function BarberQueuePage() {
    const queryClient = useQueryClient()
    const user = useAuthStore((s) => s.user)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [isUploadOpen, setIsUploadOpen] = useState(false)

    const getErrorMessage = (error: unknown): string | undefined => {
        if (typeof error === 'string') return error
        if (error && typeof error === 'object') {
            const errObj = error as {
                response?: { data?: { message?: string } }
                message?: string
            }
            return errObj.response?.data?.message || errObj.message
        }
        return undefined
    }

    const { data: bookings, isLoading: isLoadingBookings } = useQuery({
        queryKey: ['barber-bookings', user?.id],
        queryFn: async () => {
            const res = await api.get<{ data: Booking[] }>('/api/bookings')
            return res.data.data.filter((b) =>
                user?.role === 'barber' ? b.barber.id === user.id : true
            )
        },
        enabled: !!user,
        staleTime: 0,
    })

    const statusMutation = useMutation({
        mutationFn: async ({
            bookingId,
            status,
        }: {
            bookingId: number
            status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
        }) => {
            await api.put(`/api/bookings/${bookingId}`, { status })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['barber-bookings', user?.id],
            })
            toast.success('Status booking diperbarui')
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error) || 'Gagal memperbarui status')
        },
    })

    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            await api.post('/api/hair-records', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        },
        onSuccess: () => {
            toast.success('Hasil cukur berhasil diupload!')
            if (selectedBooking && selectedBooking.status === 'confirmed') {
                statusMutation.mutate({
                    bookingId: selectedBooking.id,
                    status: 'completed',
                })
            }
            setIsUploadOpen(false)
            queryClient.invalidateQueries({ queryKey: ['hair-records'] })
        },
        onError: (error: unknown) => {
            toast.error(
                getErrorMessage(error) || 'Gagal mengupload hasil cukur'
            )
        },
    })

    const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedBooking) return
        if (!user || user.role !== 'barber') {
            toast.error('Anda harus login sebagai barber untuk upload hasil.')
            return
        }
        if (selectedBooking.status === 'pending') {
            toast.error(
                'Konfirmasi booking terlebih dahulu sebelum upload hasil.'
            )
            return
        }

        const form = e.currentTarget
        const formData = new FormData(form)
        formData.append('booking_id', selectedBooking.id.toString())
        formData.append('customer_id', selectedBooking.customer.id.toString())
        formData.append('barber_id', user.id.toString())

        uploadMutation.mutate(formData)
    }

    const today = new Date()
    const todayBookings =
        bookings?.filter((b) => {
            const d = new Date(b.booking_datetime)
            return (
                d.getDate() === today.getDate() &&
                d.getMonth() === today.getMonth() &&
                d.getFullYear() === today.getFullYear() &&
                b.status !== 'cancelled'
            )
        }) || []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-primary text-3xl font-bold tracking-tight">
                    Antrian Hari Ini
                </h1>
                <p className="text-muted-foreground">
                    Kelola booking yang berlangsung hari ini.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Antrian (
                        {format(today, 'eeee, d MMMM yyyy', { locale: id })})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingBookings ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="text-primary animate-spin" />
                        </div>
                    ) : todayBookings.length === 0 ? (
                        <div className="text-muted-foreground py-12 text-center">
                            Tidak ada jadwal untuk hari ini.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {todayBookings.map((booking) => {
                                const statusLabel =
                                    booking.status === 'pending'
                                        ? 'Menunggu'
                                        : booking.status === 'confirmed'
                                          ? 'Terkonfirmasi'
                                          : booking.status === 'completed'
                                            ? 'Selesai'
                                            : booking.status
                                const statusClass =
                                    booking.status === 'completed'
                                        ? 'bg-green-500/10 text-green-500'
                                        : booking.status === 'confirmed'
                                          ? 'bg-blue-500/10 text-blue-500'
                                          : 'bg-yellow-500/10 text-yellow-500'
                                return (
                                    <div
                                        key={booking.id}
                                        className="bg-card/50 flex flex-col items-start justify-between gap-4 rounded-lg border p-4 md:flex-row md:items-center"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 text-primary border-primary/20 flex h-16 w-16 items-center justify-center rounded-full border p-3 text-lg font-bold">
                                                {format(
                                                    new Date(
                                                        booking.booking_datetime
                                                    ),
                                                    'HH:mm'
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    {booking.customer.name}
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    {booking.service.name}
                                                </p>
                                                <div className="mt-1 flex gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={statusClass}
                                                    >
                                                        {statusLabel}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex w-full flex-col gap-2 md:w-auto">
                                            <div className="flex flex-wrap gap-2">
                                                {booking.status ===
                                                    'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        disabled={
                                                            statusMutation.isPending
                                                        }
                                                        onClick={() =>
                                                            statusMutation.mutate(
                                                                {
                                                                    bookingId:
                                                                        booking.id,
                                                                    status: 'confirmed',
                                                                }
                                                            )
                                                        }
                                                    >
                                                        {statusMutation.isPending ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            'Konfirmasi'
                                                        )}
                                                    </Button>
                                                )}
                                                {booking.status ===
                                                    'confirmed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        disabled={
                                                            statusMutation.isPending
                                                        }
                                                        onClick={() =>
                                                            statusMutation.mutate(
                                                                {
                                                                    bookingId:
                                                                        booking.id,
                                                                    status: 'completed',
                                                                }
                                                            )
                                                        }
                                                    >
                                                        {statusMutation.isPending ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            'Tandai Selesai'
                                                        )}
                                                    </Button>
                                                )}
                                                {booking.status ===
                                                    'confirmed' && (
                                                    <Dialog
                                                        open={
                                                            isUploadOpen &&
                                                            selectedBooking?.id ===
                                                                booking.id
                                                        }
                                                        onOpenChange={(
                                                            open
                                                        ) => {
                                                            if (open) {
                                                                if (
                                                                    booking.status !==
                                                                    'confirmed'
                                                                ) {
                                                                    toast.error(
                                                                        'Upload hanya tersedia setelah booking terkonfirmasi.'
                                                                    )
                                                                    return
                                                                }
                                                                setSelectedBooking(
                                                                    booking
                                                                )
                                                                setIsUploadOpen(
                                                                    true
                                                                )
                                                            } else {
                                                                setIsUploadOpen(
                                                                    false
                                                                )
                                                                setSelectedBooking(
                                                                    null
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-2"
                                                            >
                                                                <Camera className="h-4 w-4" />{' '}
                                                                Upload Hasil
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[500px]">
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    Upload Hasil
                                                                    Cukur
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    Simpan foto
                                                                    sebelum dan
                                                                    sesudah
                                                                    untuk
                                                                    riwayat
                                                                    pelanggan.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <form
                                                                onSubmit={
                                                                    handleUpload
                                                                }
                                                                className="space-y-4"
                                                            >
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="before">
                                                                            Foto
                                                                            Before
                                                                        </Label>
                                                                        <Input
                                                                            id="before"
                                                                            name="photo_before"
                                                                            type="file"
                                                                            accept="image/*"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="after">
                                                                            Foto
                                                                            After
                                                                        </Label>
                                                                        <Input
                                                                            id="after"
                                                                            name="photo_after"
                                                                            type="file"
                                                                            accept="image/*"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="hair_type">
                                                                        Jenis
                                                                        Rambut
                                                                    </Label>
                                                                    <Input
                                                                        id="hair_type"
                                                                        name="hair_type"
                                                                        placeholder="Contoh: Ikal, Lurus, Berminyak"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="scalp_condition">
                                                                        Kondisi
                                                                        Kulit
                                                                        Kepala
                                                                    </Label>
                                                                    <Input
                                                                        id="scalp_condition"
                                                                        name="scalp_condition"
                                                                        placeholder="Contoh: Kering, Berketombe, Normal"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="notes">
                                                                        Catatan
                                                                        Perawatan
                                                                    </Label>
                                                                    <Textarea
                                                                        id="notes"
                                                                        name="treatment_notes"
                                                                        placeholder="Catatan teknis cukuran..."
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="recommendations">
                                                                        Saran
                                                                        untuk
                                                                        Pelanggan
                                                                    </Label>
                                                                    <Textarea
                                                                        id="recommendations"
                                                                        name="barber_recommendations"
                                                                        placeholder="Saran styling atau produk..."
                                                                    />
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button
                                                                        type="submit"
                                                                        disabled={
                                                                            uploadMutation.isPending
                                                                        }
                                                                    >
                                                                        {uploadMutation.isPending && (
                                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        )}
                                                                        {uploadMutation.isPending
                                                                            ? 'Menyimpan...'
                                                                            : 'Simpan'}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
