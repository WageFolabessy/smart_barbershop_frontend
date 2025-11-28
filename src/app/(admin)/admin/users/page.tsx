'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Pencil, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,

} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

import api from '@/lib/axios';
import { User, StoreUserRequest, UpdateUserRequest } from '@/types/api';

// Schema Validation
const userSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().email('Email tidak valid'),
    phone: z.string().optional().nullable(),
    role: z.enum(['admin', 'barber', 'customer']),
    password: z.string().optional().or(z.literal('')),
    password_confirmation: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.password && data.password !== data.password_confirmation) {
        return false;
    }
    return true;
}, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            role: 'customer',
            password: '',
            password_confirmation: '',
        },
    });

    // Fetch Users
    const { data: users, isLoading, isError, error, refetch } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/api/admin/users');
            const topData = res.data?.data;
            const nestedData = topData?.data;
            const byUsersKey = res.data?.users;
            const list: unknown = Array.isArray(topData)
                ? topData
                : Array.isArray(nestedData)
                    ? nestedData
                    : Array.isArray(byUsersKey)
                        ? byUsersKey
                        : [];
            return list as User[];
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
    });

    // Create User Mutation
    const createUserMutation = useMutation({
        mutationFn: async (data: StoreUserRequest) => {
            await api.post('/api/admin/users', data);
        },
        onSuccess: () => {
            toast.success('Pengguna berhasil dibuat!');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsDialogOpen(false);
            form.reset();
        },
        onError: (error: unknown) => {
            const message = (() => {
                if (typeof error === 'string') return error;
                if (error && typeof error === 'object') {
                    const errObj = error as { response?: { data?: { message?: string } }; message?: string };
                    return errObj.response?.data?.message || errObj.message;
                }
                return undefined;
            })();
            toast.error(message || 'Gagal membuat pengguna');
        },
    });

    // Update User Mutation
    const updateUserMutation = useMutation({
        mutationFn: async (data: UpdateUserRequest) => {
            if (!editingUser) return;
            await api.put(`/api/admin/users/${editingUser.id}`, data);
        },
        onSuccess: () => {
            toast.success('Pengguna berhasil diperbarui!');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsDialogOpen(false);
            setEditingUser(null);
            form.reset();
        },
        onError: (error: unknown) => {
            const message = (() => {
                if (typeof error === 'string') return error;
                if (error && typeof error === 'object') {
                    const errObj = error as { response?: { data?: { message?: string } }; message?: string };
                    return errObj.response?.data?.message || errObj.message;
                }
                return undefined;
            })();
            toast.error(message || 'Gagal memperbarui pengguna');
        },
    });

    // Delete User Mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/admin/users/${id}`);
        },
        onSuccess: () => {
            toast.success('Pengguna berhasil dihapus!');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsDeleteDialogOpen(false);
            setDeletingUser(null);
        },
        onError: (error: unknown) => {
            const message = (() => {
                if (typeof error === 'string') return error;
                if (error && typeof error === 'object') {
                    const errObj = error as { response?: { data?: { message?: string } }; message?: string };
                    return errObj.response?.data?.message || errObj.message;
                }
                return undefined;
            })();
            toast.error(message || 'Gagal menghapus pengguna');
        },
    });

    const onSubmit = (data: UserFormValues) => {
        if (editingUser) {
            const payload: UpdateUserRequest = {
                name: data.name,
                email: data.email,
                phone: data.phone || undefined,
                role: data.role,
                ...(data.password ? { password: data.password, password_confirmation: data.password_confirmation || '' } : {}),
            };
            updateUserMutation.mutate(payload);
        } else {
            if (!data.password) {
                form.setError('password', { message: 'Password wajib diisi untuk pengguna baru' });
                return;
            }
            const payload: StoreUserRequest = {
                name: data.name,
                email: data.email,
                phone: data.phone || undefined,
                role: data.role,
                password: data.password,
                password_confirmation: data.password_confirmation || '',
            };
            createUserMutation.mutate(payload);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        form.reset({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            password: '',
            password_confirmation: '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (user: User) => {
        setDeletingUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        form.reset({
            name: '',
            email: '',
            phone: '',
            role: 'customer',
            password: '',
            password_confirmation: '',
        });
        setIsDialogOpen(true);
    };

    const filteredUsers = Array.isArray(users) ? users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];



    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Manajemen Pengguna</h1>
                    <p className="text-muted-foreground">Kelola data pelanggan, kapster, dan admin.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna</CardTitle>
                    <CardDescription>
                        Total {users?.length || 0} pengguna terdaftar.
                    </CardDescription>
                    <div className="pt-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama, email, atau role..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : isError ? (
                        <div className="text-center py-8">
                            <p className="text-red-600">Gagal memuat pengguna.</p>
                            <p className="text-muted-foreground text-sm mt-1">{
                                (() => {
                                    if (!error) return 'Terjadi kesalahan tak terduga.';
                                    if (typeof error === 'string') return error;
                                    const errObj = error as { response?: { data?: { message?: string } } };
                                    if (errObj?.response?.data?.message) return errObj.response.data.message;
                                    const err = error as Error;
                                    return err.message || 'Terjadi kesalahan tak terduga.';
                                })()
                            }</p>
                            <Button variant="outline" className="mt-3" onClick={() => refetch()}>Coba Lagi</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>No. HP</TableHead>
                                    <TableHead className="w-[100px] text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Tidak ada pengguna ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers?.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                        user.role === 'barber' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'}`}>
                                                    {user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell>{user.phone || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" aria-label="Menu tindakan">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(user)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? 'Ubah informasi pengguna di sini.' : 'Isi form untuk menambahkan pengguna baru.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Lengkap</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>No. HP (Opsional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="08123456789" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="customer">Customer</SelectItem>
                                                <SelectItem value="barber">Barber</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password {editingUser && '(Opsional)'}</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="******" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password_confirmation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Konfirmasi Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="******" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                                    {(createUserMutation.isPending || updateUserMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {(createUserMutation.isPending || updateUserMutation.isPending) ? 'Menyimpan...' : (editingUser ? 'Perbarui' : 'Buat Pengguna')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Pengguna <strong>{deletingUser?.name}</strong> akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                if (deletingUser) {
                                    deleteUserMutation.mutate(deletingUser.id);
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {deleteUserMutation.isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
