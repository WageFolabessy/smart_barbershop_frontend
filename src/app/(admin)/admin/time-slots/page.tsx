'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Clock,
    Search,
    MoreHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import api from '@/lib/axios'
import {
    TimeSlot,
    DayOfWeek,
    StoreTimeSlotRequest,
    UpdateTimeSlotRequest,
} from '@/types/api'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Schema
const timeSlotSchema = z.object({
    day_of_week: z.enum([
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
    ]),
    start_time: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:MM'),
    end_time: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:MM'),
    price_multiplier: z.number().min(0.1).max(5),
    label: z.string().max(255).optional().nullable(),
    is_active: z.boolean().default(true),
})

type TimeSlotFormValues = z.infer<typeof timeSlotSchema>

const DAYS = [
    { value: 'monday', label: 'Senin' },
    { value: 'tuesday', label: 'Selasa' },
    { value: 'wednesday', label: 'Rabu' },
    { value: 'thursday', label: 'Kamis' },
    { value: 'friday', label: 'Jumat' },
    { value: 'saturday', label: 'Sabtu' },
    { value: 'sunday', label: 'Minggu' },
]

export default function TimeSlotsPage() {
    const queryClient = useQueryClient()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingSlot, setDeletingSlot] = useState<TimeSlot | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch Time Slots
    const { data: timeSlots = [], isLoading } = useQuery<TimeSlot[]>({
        queryKey: ['time-slots'],
        queryFn: async () => {
            const res = await api.get<{ data: TimeSlot[] }>('/api/time-slots')
            return res.data.data
        },
    })

    // Form
    const form = useForm<TimeSlotFormValues>({
        resolver: zodResolver(timeSlotSchema) as Resolver<TimeSlotFormValues>,
        defaultValues: {
            day_of_week: 'monday',
            start_time: '09:00',
            end_time: '10:00',
            price_multiplier: 1.0,
            label: '',
            is_active: true,
        },
    })

    // Reset form when dialog opens/closes
    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open)
        if (!open) {
            setEditingSlot(null)
            form.reset({
                day_of_week: 'monday',
                start_time: '09:00',
                end_time: '10:00',
                price_multiplier: 1.0,
                label: '',
                is_active: true,
            })
        }
    }

    // Edit Handler
    const handleEdit = (slot: TimeSlot) => {
        setEditingSlot(slot)
        form.reset({
            day_of_week: slot.day_of_week as DayOfWeek,
            start_time: slot.start_time.substring(0, 5),
            end_time: slot.end_time.substring(0, 5),
            price_multiplier: slot.price_multiplier,
            label: slot.label,
            is_active: slot.is_active,
        })
        setIsDialogOpen(true)
    }

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data: StoreTimeSlotRequest) => {
            await api.post('/api/admin/time-slots', data)
        },
        onSuccess: () => {
            toast.success('Slot waktu berhasil dibuat!')
            queryClient.invalidateQueries({ queryKey: ['time-slots'] })
            handleOpenChange(false)
        },
        onError: (error: unknown) => {
            const message = (() => {
                if (typeof error === 'string') return error
                if (error && typeof error === 'object') {
                    const errObj = error as {
                        response?: { data?: { message?: string } }
                        message?: string
                    }
                    return errObj.response?.data?.message || errObj.message
                }
                return undefined
            })()
            toast.error(message || 'Gagal membuat slot waktu')
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (data: UpdateTimeSlotRequest) => {
            if (!editingSlot) return
            await api.put(`/api/admin/time-slots/${editingSlot.id}`, data)
        },
        onSuccess: () => {
            toast.success('Slot waktu berhasil diperbarui!')
            queryClient.invalidateQueries({ queryKey: ['time-slots'] })
            handleOpenChange(false)
        },
        onError: (error: unknown) => {
            const message = (() => {
                if (typeof error === 'string') return error
                if (error && typeof error === 'object') {
                    const errObj = error as {
                        response?: { data?: { message?: string } }
                        message?: string
                    }
                    return errObj.response?.data?.message || errObj.message
                }
                return undefined
            })()
            toast.error(message || 'Gagal memperbarui slot waktu')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/admin/time-slots/${id}`)
        },
        onSuccess: () => {
            toast.success('Slot waktu berhasil dihapus!')
            queryClient.invalidateQueries({ queryKey: ['time-slots'] })
            setIsDeleteDialogOpen(false)
            setDeletingSlot(null)
        },
        onError: (error: unknown) => {
            const message = (() => {
                if (typeof error === 'string') return error
                if (error && typeof error === 'object') {
                    const errObj = error as {
                        response?: { data?: { message?: string } }
                        message?: string
                    }
                    return errObj.response?.data?.message || errObj.message
                }
                return undefined
            })()
            toast.error(message || 'Gagal menghapus slot waktu')
        },
    })

    const handleDelete = (slot: TimeSlot) => {
        setDeletingSlot(slot)
        setIsDeleteDialogOpen(true)
    }

    const onSubmit = (data: TimeSlotFormValues) => {
        const payload: StoreTimeSlotRequest = {
            day_of_week: data.day_of_week,
            start_time: data.start_time,
            end_time: data.end_time,
            price_multiplier: data.price_multiplier,
            label: data.label ?? null,
            is_active: data.is_active,
        }
        if (editingSlot) {
            updateMutation.mutate(payload)
        } else {
            createMutation.mutate(payload)
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-primary text-3xl font-bold tracking-tight">
                        Manajemen Slot Waktu
                    </h1>
                    <p className="text-muted-foreground">
                        Atur jadwal operasional dan harga dinamis.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Tambah Slot
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingSlot
                                    ? 'Edit Slot Waktu'
                                    : 'Tambah Slot Waktu'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingSlot
                                    ? 'Ubah detail slot waktu yang sudah ada.'
                                    : 'Buat slot waktu baru untuk jadwal layanan.'}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="day_of_week"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hari</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih hari" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {DAYS.map((day) => (
                                                        <SelectItem
                                                            key={day.value}
                                                            value={day.value}
                                                        >
                                                            {day.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="start_time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Jam Mulai</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Clock className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                                                        <Input
                                                            className="pl-9"
                                                            placeholder="09:00"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="end_time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Jam Selesai
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Clock className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                                                        <Input
                                                            className="pl-9"
                                                            placeholder="10:00"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price_multiplier"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Multiplier Harga
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        min="0.1"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target
                                                                    .valueAsNumber
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    1.0 = Normal, 1.5 = +50%
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="label"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Label (Opsional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Contoh: Happy Hour"
                                                        {...field}
                                                        value={
                                                            field.value || ''
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>
                                                    Status Aktif
                                                </FormLabel>
                                                <FormDescription>
                                                    Slot ini dapat dibooking
                                                    oleh pelanggan.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {isPending
                                            ? 'Menyimpan...'
                                            : editingSlot
                                              ? 'Perbarui'
                                              : 'Buat Slot'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Slot Waktu</CardTitle>
                    <CardDescription>
                        Total {timeSlots.length} slot waktu terdaftar.
                    </CardDescription>
                    <div className="pt-4">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                            <Input
                                placeholder="Cari hari, label, atau jam..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="text-primary animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hari</TableHead>
                                    <TableHead>Waktu</TableHead>
                                    <TableHead>Multiplier</TableHead>
                                    <TableHead>Label</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px] text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(Array.isArray(timeSlots)
                                    ? timeSlots.filter((slot: TimeSlot) => {
                                          const dayLabel =
                                              DAYS.find(
                                                  (d) =>
                                                      d.value ===
                                                      slot.day_of_week
                                              )?.label || slot.day_of_week
                                          const term = searchQuery.toLowerCase()
                                          return (
                                              dayLabel
                                                  .toLowerCase()
                                                  .includes(term) ||
                                              (slot.label || '')
                                                  .toLowerCase()
                                                  .includes(term) ||
                                              slot.start_time
                                                  .substring(0, 5)
                                                  .includes(term) ||
                                              slot.end_time
                                                  .substring(0, 5)
                                                  .includes(term)
                                          )
                                      })
                                    : []
                                ).map((slot: TimeSlot) => (
                                    <TableRow key={slot.id}>
                                        <TableCell className="font-medium">
                                            {DAYS.find(
                                                (d) =>
                                                    d.value === slot.day_of_week
                                            )?.label || slot.day_of_week}
                                        </TableCell>
                                        <TableCell>
                                            {slot.start_time.substring(0, 5)} -{' '}
                                            {slot.end_time.substring(0, 5)}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={
                                                    slot.price_multiplier > 1
                                                        ? 'font-bold text-red-500'
                                                        : slot.price_multiplier <
                                                            1
                                                          ? 'font-bold text-green-500'
                                                          : ''
                                                }
                                            >
                                                {slot.price_multiplier}x
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {slot.label || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${slot.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                                            >
                                                {slot.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label="Menu tindakan"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleEdit(slot)
                                                        }
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />{' '}
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() =>
                                                            handleDelete(slot)
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />{' '}
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!timeSlots || timeSlots.length === 0) && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-muted-foreground py-8 text-center"
                                        >
                                            Belum ada slot waktu yang dibuat.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!isLoading &&
                                    Array.isArray(timeSlots) &&
                                    timeSlots.length > 0 &&
                                    timeSlots.filter((slot) => {
                                        const dayLabel =
                                            DAYS.find(
                                                (d) =>
                                                    d.value === slot.day_of_week
                                            )?.label || slot.day_of_week
                                        const term = searchQuery.toLowerCase()
                                        return (
                                            dayLabel
                                                .toLowerCase()
                                                .includes(term) ||
                                            (slot.label || '')
                                                .toLowerCase()
                                                .includes(term) ||
                                            slot.start_time
                                                .substring(0, 5)
                                                .includes(term) ||
                                            slot.end_time
                                                .substring(0, 5)
                                                .includes(term)
                                        )
                                    }).length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-muted-foreground py-8 text-center"
                                            >
                                                Tidak ada slot waktu yang cocok
                                                dengan pencarian.
                                            </TableCell>
                                        </TableRow>
                                    )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Slot waktu{' '}
                            <strong>
                                {deletingSlot
                                    ? `${DAYS.find((d) => d.value === deletingSlot.day_of_week)?.label} ${deletingSlot.start_time.substring(0, 5)}-${deletingSlot.end_time.substring(0, 5)}`
                                    : ''}
                            </strong>{' '}
                            akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                if (deletingSlot) {
                                    deleteMutation.mutate(deletingSlot.id)
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {deleteMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {deleteMutation.isPending
                                ? 'Menghapus...'
                                : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
