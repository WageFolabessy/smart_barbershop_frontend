'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, MoreHorizontal, Plus, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/axios';
import { Service } from '@/types/api';

export default function ServicesPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    // Fetch Services
    const { data: services, isLoading } = useQuery({
        queryKey: ['admin-services'],
        queryFn: async () => {
            const res = await api.get<{ data: Service[] }>('/api/services');
            return res.data.data;
        },
    });

    // Create/Update Mutation
    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingService) {
                await api.put(`/api/admin/services/${editingService.id}`, data);
            } else {
                await api.post('/api/admin/services', data);
            }
        },
        onSuccess: () => {
            toast.success(editingService ? 'Layanan berhasil diperbarui!' : 'Layanan berhasil ditambahkan!');
            setIsDialogOpen(false);
            setEditingService(null);
            queryClient.invalidateQueries({ queryKey: ['admin-services'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Gagal menyimpan layanan');
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/admin/services/${id}`);
        },
        onSuccess: () => {
            toast.success('Layanan berhasil dihapus!');
            queryClient.invalidateQueries({ queryKey: ['admin-services'] });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            base_price: Number(formData.get('base_price')),
            duration_minutes: Number(formData.get('duration_minutes')),
            is_active: true, // Default active
        };
        saveMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Manajemen Layanan</h1>
                    <p className="text-muted-foreground">Tambah, ubah, atau hapus layanan cukur.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setEditingService(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Tambah Layanan
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Layanan</Label>
                                <Input id="name" name="name" defaultValue={editingService?.name} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Input id="description" name="description" defaultValue={editingService?.description || ''} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="base_price">Harga (IDR)</Label>
                                    <Input id="base_price" name="base_price" type="number" defaultValue={editingService?.base_price} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration_minutes">Durasi (Menit)</Label>
                                    <Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={editingService?.duration_minutes} required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={saveMutation.isPending}>
                                    {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead>Durasi</TableHead>
                                <TableHead className="w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : services?.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">{service.name}</TableCell>
                                    <TableCell>{service.description}</TableCell>
                                    <TableCell>{formatCurrency(service.base_price)}</TableCell>
                                    <TableCell>{service.duration_minutes} Menit</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {
                                                    setEditingService(service);
                                                    setIsDialogOpen(true);
                                                }}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => {
                                                    if (confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
                                                        deleteMutation.mutate(service.id);
                                                    }
                                                }}>
                                                    <Trash className="mr-2 h-4 w-4" /> Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
