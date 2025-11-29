'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarPlus, History, Images, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import { AUTH_COOKIE_NAMES, ROUTES } from '@/lib/constants';

export default function CustomerNav() {
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
        { href: '/booking', label: 'Buat Janji', icon: CalendarPlus },
        { href: '/riwayat', label: 'Riwayat', icon: History },
        { href: '/galeri', label: 'Galeri', icon: Images },
    ];

    return (
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
            <div className="w-full px-4 md:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    {/* Logo - Left */}
                    <div className="flex items-center gap-2">
                        <Link href="/booking" className="text-lg md:text-xl font-bold text-primary tracking-tight">
                            Smart Barbershop
                        </Link>
                    </div>

                    {/* Desktop Nav - Center */}
                    <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
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

                    {/* User Info & Logout - Right */}
                    <div className="flex items-center gap-2 md:gap-3 ml-auto">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="max-w-20 sm:max-w-[120px] md:max-w-none truncate">{user?.name}</span>
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

            {/* Mobile Nav (Bottom Bar) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/95 backdrop-blur p-2 flex justify-around z-50">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-[10px]">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
