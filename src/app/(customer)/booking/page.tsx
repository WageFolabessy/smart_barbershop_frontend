'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
    Clock,
    Scissors,
    User as UserIcon,
    CheckCircle2,
    Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, formatCurrency, getErrorMessage } from '@/lib/utils'
import api from '@/lib/axios'
import {
    Service,
    User,
    TimeSlot,
    CheckAvailabilityResponse,
    AvailableBarbersEnvelope,
    CreateBookingRequest,
} from '@/types/api'
import { useAuthStore } from '@/store/useAuthStore'

export default function BookingPage() {
    const queryClient = useQueryClient()
    const router = useRouter()
    const user = useAuthStore((state) => state.user)
    const [step, setStep] = useState(1)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedBarber, setSelectedBarber] = useState<User | null>(null)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
        null
    )

    const getDayKey = (d?: Date) => {
        const dayIndex = d ? d.getDay() : new Date().getDay() // 0=Sun
        const keys = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
        ] as const
        return keys[dayIndex]
    }

    // Fetch Services
    const { data: services, isLoading: isLoadingServices } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const res = await api.get<{ data: Service[] }>('/api/services')
            return res.data.data
        },
    })

    // Fetch Barbers
    const { data: barbers, isLoading: isLoadingBarbers } = useQuery({
        queryKey: ['barbers'],
        queryFn: async () => {
            // Use available-barbers endpoint with current time to get list of barbers
            // This is a workaround since there is no public /users endpoint
            const now = new Date().toISOString()
            try {
                const res = await api.get<AvailableBarbersEnvelope>(
                    '/api/bookings/available-barbers',
                    {
                        params: {
                            datetime: now,
                        },
                    }
                )

                // Map to User type (filling missing fields with placeholders)
                return res.data.available_barbers.map((b) => ({
                    id: Number(b.id),
                    name: b.name,
                    email: '', // Not used in UI
                    role: 'barber' as const,
                    loyalty_points: 0, // Not applicable for barbers
                    created_at: '',
                    updated_at: '',
                }))
            } catch {
                // Return empty array on error - UI will show empty state
                return []
            }
        },
    })

    // Fetch Time Slots
    const { data: timeSlots, isLoading: isLoadingTimeSlots } = useQuery({
        queryKey: ['time-slots'],
        queryFn: async () => {
            const res = await api.get<{ data: TimeSlot[] }>('/api/time-slots')
            return res.data.data
        },
    })

    // Check Availability Mutation
    const checkAvailabilityMutation = useMutation<
        CheckAvailabilityResponse,
        unknown,
        void
    >({
        mutationFn: async () => {
            if (
                !selectedService ||
                !selectedBarber ||
                !date ||
                !selectedTimeSlot
            )
                return { available: false }

            const dateStr = format(date, 'yyyy-MM-dd')
            const dateTime = `${dateStr} ${selectedTimeSlot.start_time}:00`

            const res = await api.post<CheckAvailabilityResponse>(
                '/api/bookings/check-availability',
                {
                    datetime: dateTime,
                    barber_id: selectedBarber.id,
                    service_duration: selectedService.duration_minutes,
                }
            )

            return res.data
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, 'Gagal mengecek ketersediaan'))
        },
    })

    // Create Booking Mutation
    const createBookingMutation = useMutation<void, unknown, void>({
        mutationFn: async () => {
            if (
                !selectedService ||
                !selectedBarber ||
                !date ||
                !selectedTimeSlot
            )
                return

            // Check availability first
            const availabilityCheck =
                await checkAvailabilityMutation.mutateAsync()

            if (!availabilityCheck?.available) {
                throw new Error(
                    'Slot waktu ini sudah tidak tersedia. Silakan pilih waktu lain.'
                )
            }

            // Combine date and time
            const dateStr = format(date, 'yyyy-MM-dd')
            const dateTime = `${dateStr} ${selectedTimeSlot.start_time}:00`

            const payload: CreateBookingRequest = {
                customer_id: Number(user?.id),
                service_id: selectedService.id,
                barber_id: selectedBarber.id,
                time_slot_id: selectedTimeSlot.id,
                booking_datetime: dateTime,
            }

            await api.post('/api/bookings', payload)
        },
        onSuccess: () => {
            toast.success('Janji temu berhasil dibuat!')
            // Pastikan data riwayat segar setelah redirect
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
            router.push('/riwayat')
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, 'Gagal membuat janji temu.'))
            // If availability check failed, go back to step 3
            const msg = getErrorMessage(error)
            if (msg.includes('tidak tersedia')) {
                setStep(3)
                setSelectedTimeSlot(null)
            }
        },
    })

    const handleNext = () => {
        if (step === 1 && selectedService) setStep(2)
        else if (step === 2 && selectedBarber) setStep(3)
        else if (step === 3 && date && selectedTimeSlot) setStep(4)
    }

    const handleBack = () => {
        if (step > 1) setStep(step - 1)
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-primary text-3xl font-bold tracking-tight">
                    Buat Janji Temu
                </h1>
                <p className="text-muted-foreground">
                    Pilih layanan dan kapster favorit Anda.
                </p>
            </div>

            {/* Progress Steps */}
            <div className="relative flex items-center justify-between">
                <div className="bg-muted absolute top-1/2 left-0 -z-10 h-0.5 w-full" />
                {[1, 2, 3, 4].map((s) => (
                    <div
                        key={s}
                        className={cn(
                            'bg-background flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-colors',
                            step >= s
                                ? 'border-primary text-primary'
                                : 'border-muted text-muted-foreground'
                        )}
                    >
                        {s}
                    </div>
                ))}
            </div>

            {/* Step 1: Select Service */}
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <Scissors className="text-primary h-5 w-5" /> Pilih
                        Layanan
                    </h2>
                    {isLoadingServices ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="text-primary animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {services?.map((service) => (
                                <Card
                                    key={service.id}
                                    className={cn(
                                        'hover:border-primary cursor-pointer transition-colors',
                                        selectedService?.id === service.id &&
                                            'border-primary bg-primary/5'
                                    )}
                                    onClick={() => setSelectedService(service)}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between text-lg">
                                            {service.name}
                                            <span className="text-primary">
                                                {formatCurrency(
                                                    service.base_price
                                                )}
                                            </span>
                                        </CardTitle>
                                        <CardDescription>
                                            {service.duration_minutes} Menit
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm">
                                            {service.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Select Barber */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <UserIcon className="text-primary h-5 w-5" /> Pilih
                        Kapster
                    </h2>
                    {isLoadingBarbers ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="text-primary animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {barbers?.map((barber) => (
                                <Card
                                    key={barber.id}
                                    className={cn(
                                        'hover:border-primary cursor-pointer text-center transition-colors',
                                        selectedBarber?.id === barber.id &&
                                            'border-primary bg-primary/5'
                                    )}
                                    onClick={() => setSelectedBarber(barber)}
                                >
                                    <CardContent className="flex flex-col items-center gap-3 pt-6">
                                        <Avatar className="border-primary/20 h-20 w-20 border-2">
                                            <AvatarImage
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.name}`}
                                            />
                                            <AvatarFallback>
                                                {barber.name.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold">
                                                {barber.name}
                                            </h3>
                                            <p className="text-muted-foreground text-xs">
                                                Expert Barber
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Select Date & Time */}
            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <Clock className="text-primary h-5 w-5" /> Pilih Waktu
                    </h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="flex justify-center py-6 md:py-8">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="bg-card origin-center scale-125 rounded-md border"
                                disabled={(date) =>
                                    date <
                                    new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                locale={id}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-muted-foreground font-medium">
                                Slot Tersedia untuk{' '}
                                {date
                                    ? format(date, 'eeee, d MMMM yyyy', {
                                          locale: id,
                                      })
                                    : ''}
                            </h3>
                            {isLoadingTimeSlots ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="text-primary animate-spin" />
                                </div>
                            ) : (
                                <div>
                                    {(() => {
                                        const slotsForDay = (
                                            timeSlots || []
                                        ).filter(
                                            (s) =>
                                                s.day_of_week ===
                                                getDayKey(date)
                                        )
                                        const sorted = slotsForDay.sort(
                                            (a, b) =>
                                                (
                                                    a.start_time || ''
                                                ).localeCompare(
                                                    b.start_time || ''
                                                )
                                        )
                                        if (sorted.length === 0) {
                                            return (
                                                <div className="text-muted-foreground flex h-24 items-center justify-center rounded-md border">
                                                    Tidak ada slot untuk hari
                                                    ini. Silakan pilih hari
                                                    lain.
                                                </div>
                                            )
                                        }
                                        return (
                                            <div className="grid grid-cols-3 gap-3">
                                                {sorted.map((slot) => (
                                                    <Button
                                                        key={slot.id}
                                                        variant={
                                                            selectedTimeSlot?.id ===
                                                            slot.id
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        className={cn(
                                                            'relative flex h-auto flex-col gap-1 py-3',
                                                            slot.is_peak_hour &&
                                                                'border-primary/50'
                                                        )}
                                                        onClick={() =>
                                                            setSelectedTimeSlot(
                                                                slot
                                                            )
                                                        }
                                                    >
                                                        <span className="font-bold">
                                                            {slot.start_time?.substring(
                                                                0,
                                                                5
                                                            ) || 'N/A'}
                                                        </span>
                                                        {slot.label && (
                                                            <Badge
                                                                variant="secondary"
                                                                className={cn(
                                                                    'relative h-auto w-[90px] overflow-hidden px-1.5 py-0.5 text-[10px]',
                                                                    slot.is_peak_hour
                                                                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                                                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                                )}
                                                                title={
                                                                    slot.label
                                                                }
                                                            >
                                                                <span
                                                                    className={cn(
                                                                        'inline-block whitespace-nowrap',
                                                                        slot
                                                                            .label
                                                                            .length >
                                                                            12 &&
                                                                            'animate-marquee'
                                                                    )}
                                                                >
                                                                    {slot.label}
                                                                </span>
                                                            </Badge>
                                                        )}
                                                    </Button>
                                                ))}
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <CheckCircle2 className="text-primary h-5 w-5" />{' '}
                        Konfirmasi Pesanan
                    </h2>
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Layanan
                                </span>
                                <span className="font-bold">
                                    {selectedService?.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Kapster
                                </span>
                                <span className="font-bold">
                                    {selectedBarber?.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Waktu
                                </span>
                                <span className="font-bold">
                                    {date &&
                                        format(date, 'eeee, d MMMM yyyy', {
                                            locale: id,
                                        })}
                                    ,{' '}
                                    {selectedTimeSlot?.start_time?.substring(
                                        0,
                                        5
                                    )}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between text-lg">
                                <span className="font-bold">
                                    Total Estimasi
                                </span>
                                <span className="text-primary font-bold">
                                    {selectedService &&
                                        selectedTimeSlot &&
                                        formatCurrency(
                                            selectedService.base_price *
                                                selectedTimeSlot.price_multiplier
                                        )}
                                </span>
                            </div>
                            {/* Points to be earned */}
                            {selectedService && selectedTimeSlot && (
                                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary">⭐</span>
                                        <span className="font-medium">
                                            Poin yang Didapat
                                        </span>
                                    </div>
                                    <span className="text-primary font-bold">
                                        +
                                        {Math.floor(
                                            (selectedService.base_price *
                                                selectedTimeSlot.price_multiplier) /
                                                10000
                                        )}{' '}
                                        poin
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="flex justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 1}
                >
                    Kembali
                </Button>
                {step < 4 ? (
                    <Button
                        onClick={handleNext}
                        disabled={
                            (step === 1 && !selectedService) ||
                            (step === 2 && !selectedBarber) ||
                            (step === 3 && (!date || !selectedTimeSlot))
                        }
                    >
                        Lanjut
                    </Button>
                ) : (
                    <Button
                        onClick={() => createBookingMutation.mutate()}
                        disabled={createBookingMutation.isPending}
                    >
                        {createBookingMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Konfirmasi Booking
                    </Button>
                )}
            </div>
        </div>
    )
}
