'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarPlus, History, Images, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import { AUTH_COOKIE_NAMES, ROUTES } from '@/lib/constants';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function CustomerNav() {
    const pathname = usePathname();
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

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
        { href: '/booking', label: 'Buat Janji', icon: CalendarPlus, match: '/booking' },
        { href: '/riwayat', label: 'Riwayat', icon: History, match: '/riwayat' },
        { href: '/galeri', label: 'Galeri', icon: Images, match: '/galeri' },
    ];

    const isActive = (match: string) => pathname === match;

    return (
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
            <div className="w-full px-4 md:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    {/* Logo - Left */}
                    <div className="flex items-center gap-2">
                        <Link href="/booking" className="text-lg md:text-xl font-bold text-primary tracking-tight">
                            Smart Barbershop <span className="text-xs text-muted-foreground font-normal">Pelanggan</span>
                        </Link>
                    </div>

                    {/* Desktop Nav - Center */}
                    <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive(item.match) ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right: Mobile menu + user */}
                    <div className="flex items-center gap-2 md:gap-3 ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buka menu">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <DropdownMenuItem key={item.href} asChild>
                                            <Link href={item.href} className={`flex items-center gap-2 ${isActive(item.match) ? 'text-primary' : ''}`}>
                                                <Icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
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
            {/* Mobile inline nav */}
            <div className="md:hidden flex gap-4 pb-2 overflow-x-auto scrollbar-hide -mt-2 px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap border transition-colors ${isActive(item.match) ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-primary'}`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
