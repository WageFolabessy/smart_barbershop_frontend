'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import { AUTH_COOKIE_NAMES, ROUTES } from '@/lib/constants';

export default function BarberNav() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch {
            // Ignore logout errors, clean up local state anyway
        }
        Cookies.remove(AUTH_COOKIE_NAMES.TOKEN);
        Cookies.remove(AUTH_COOKIE_NAMES.USER_ROLE);
        logout();
        router.push(ROUTES.LOGIN);
    };

    return (
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="w-full px-4 md:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/barber/dashboard" className="text-lg md:text-xl font-bold text-primary tracking-tight">
                            Smart Barbershop <span className="text-xs text-muted-foreground font-normal">for Barbers</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 ml-auto">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="max-w-[80px] sm:max-w-[120px] md:max-w-none truncate">{user?.name}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1 md:gap-2 px-2 md:px-3"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Keluar</span>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
