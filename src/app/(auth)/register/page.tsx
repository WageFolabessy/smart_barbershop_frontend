'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import Cookies from 'js-cookie'
import { AUTH_COOKIE_NAMES, COOKIE_OPTIONS, ROUTES } from '@/lib/constants'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import api from '@/lib/axios'
import { RegisterRequest, LoginRequest, LoginResponse } from '@/types/api'
import { useAuthStore } from '@/store/useAuthStore'

const registerSchema = z
    .object({
        name: z.string().min(2, { message: 'Nama minimal 2 karakter' }),
        email: z.string().email({ message: 'Email tidak valid' }),
        phone: z
            .string()
            .min(10, { message: 'Nomor telepon tidak valid' })
            .optional(),
        password: z
            .string()
            .min(8, { message: 'Kata sandi minimal 8 karakter' }),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Kata sandi tidak cocok',
        path: ['password_confirmation'],
    })

export default function RegisterPage() {
    const router = useRouter()
    const login = useAuthStore((state) => state.login)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            password_confirmation: '',
        },
    })

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        setIsLoading(true)
        setError(null)

        try {
            await api.get('/sanctum/csrf-cookie')

            const response = await api.post(
                '/api/auth/register',
                values as RegisterRequest
            )
            const raw = response.data as
                | { data?: LoginResponse }
                | LoginResponse
            const payload: LoginResponse | undefined =
                (raw as { data?: LoginResponse }).data ?? (raw as LoginResponse)
            let user = payload?.user
            let token = payload?.token

            // If register doesn't return user/token, try to login
            if (!user || !token) {
                const loginResponse = await api.post('/api/auth/login', {
                    email: values.email,
                    password: values.password,
                } as LoginRequest)
                const loginRaw = loginResponse.data as
                    | { data?: LoginResponse }
                    | LoginResponse
                const loginPayload: LoginResponse =
                    (loginRaw as { data?: LoginResponse }).data ??
                    (loginRaw as LoginResponse)
                user = loginPayload.user
                token = loginPayload.token
            }

            if (user && token) {
                Cookies.set(AUTH_COOKIE_NAMES.TOKEN, token, COOKIE_OPTIONS)
                Cookies.set(
                    AUTH_COOKIE_NAMES.USER_ROLE,
                    user.role,
                    COOKIE_OPTIONS
                )

                login(user, token)
                router.push(ROUTES.BOOKING)
            } else {
                throw new Error(
                    'Gagal masuk otomatis setelah mendaftar. Silakan masuk secara manual.'
                )
            }
        } catch (err: unknown) {
            const message = (() => {
                if (typeof err === 'string') return err
                if (err && typeof err === 'object') {
                    const e = err as {
                        response?: { data?: { message?: string } }
                        message?: string
                    }
                    return e.response?.data?.message || e.message
                }
                return undefined
            })()
            setError(
                message ||
                    'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-primary text-center text-2xl">
                    Daftar Akun
                </CardTitle>
                <CardDescription className="text-center">
                    Bergabunglah untuk pengalaman cukur terbaik
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Lengkap</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Budi Santoso"
                                            {...field}
                                        />
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
                                        <Input
                                            placeholder="nama@contoh.com"
                                            {...field}
                                        />
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
                                    <FormLabel>
                                        Nomor Telepon (Opsional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="08123456789"
                                            {...field}
                                        />
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
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            {...field}
                                        />
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
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {error && (
                            <div className="text-destructive text-center text-sm">
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full font-bold"
                            disabled={isLoading}
                        >
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
                <p className="text-muted-foreground text-sm">
                    Sudah punya akun?{' '}
                    <Link
                        href="/login"
                        className="text-primary hover:underline"
                    >
                        Masuk
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
