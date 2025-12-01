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
import { LoginRequest, LoginResponse } from '@/types/api'
import { useAuthStore } from '@/store/useAuthStore'

const loginSchema = z.object({
    email: z.string().email({ message: 'Email tidak valid' }),
    password: z.string().min(1, { message: 'Kata sandi diperlukan' }),
})

export default function LoginPage() {
    const router = useRouter()
    const login = useAuthStore((state) => state.login)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true)
        setError(null)

        try {
            await api.get('/sanctum/csrf-cookie')

            const response = await api.post(
                '/api/auth/login',
                values as LoginRequest
            )
            const raw = response.data as
                | { data?: LoginResponse }
                | LoginResponse
            const payload: LoginResponse =
                (raw as { data?: LoginResponse }).data ?? (raw as LoginResponse)
            const { user, token } = payload

            // Set cookies for middleware
            Cookies.set(AUTH_COOKIE_NAMES.TOKEN, token, COOKIE_OPTIONS)
            Cookies.set(AUTH_COOKIE_NAMES.USER_ROLE, user.role, COOKIE_OPTIONS)

            login(user, token)

            if (user.role === 'admin') {
                router.push(ROUTES.ADMIN.DASHBOARD)
            } else if (user.role === 'barber') {
                router.push(ROUTES.BARBER.DASHBOARD)
            } else {
                router.push(ROUTES.BOOKING)
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
                    'Terjadi kesalahan saat masuk. Periksa kembali kredensial Anda.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-primary text-center text-2xl">
                    Masuk
                </CardTitle>
                <CardDescription className="text-center">
                    Masukkan email dan kata sandi Anda untuk melanjutkan
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
                                'Masuk'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-muted-foreground text-sm">
                    Belum punya akun?{' '}
                    <Link
                        href="/register"
                        className="text-primary hover:underline"
                    >
                        Daftar sekarang
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
