'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, LogOut, Scissors, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import { AUTH_COOKIE_NAMES, ROUTES } from '@/lib/constants';

export default function AdminNav() {
    const pathname = usePathname();
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

    const navItems = [
        { href: '/admin/dashboard', label: 'Overview', icon: BarChart3 },
        { href: '/admin/services', label: 'Layanan', icon: Scissors },
        { href: '/admin/users', label: 'Pengguna', icon: Users },
    ];

    return (
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/admin/dashboard" className="text-xl font-bold text-primary tracking-tight">
                        Smart Barbershop <span className="text-xs text-muted-foreground font-normal">Admin</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{user?.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} title="Keluar">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}
