'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { LoginResponse } from '@/types/api';

const registerSchema = z.object({
    name: z.string().min(2, { message: "Nama minimal 2 karakter" }),
    email: z.string().email({ message: "Email tidak valid" }),
    phone: z.string().min(10, { message: "Nomor telepon tidak valid" }).optional(),
    password: z.string().min(8, { message: "Kata sandi minimal 8 karakter" }),
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Kata sandi tidak cocok",
    path: ["password_confirmation"],
});

export default function RegisterPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            password_confirmation: '',
        },
    });

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        setIsLoading(true);
        setError(null);

        try {
            await api.get('/sanctum/csrf-cookie');

            const response = await api.post<LoginResponse>('/api/auth/register', values);
            const { user, token } = response.data;

            Cookies.set('auth_token', token, { expires: 7 });
            Cookies.set('user_role', user.role, { expires: 7 });

            login(user, token);
            router.push('/booking');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mendaftar.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl text-center text-primary">Daftar Akun</CardTitle>
                <CardDescription className="text-center">
                    Bergabunglah untuk pengalaman cukur terbaik
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Lengkap</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Budi Santoso" {...field} />
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
                                        <Input placeholder="nama@contoh.com" {...field} />
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
                                    <FormLabel>Nomor Telepon (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="08123456789" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kata Sandi</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
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
                                    <FormLabel>Konfirmasi Kata Sandi</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {error && (
                            <div className="text-sm text-destructive text-center">
                                {error}
                            </div>
                        )}
                        <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                'Daftar'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Masuk
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
