'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarPlus, History, Images, LogOut, Menu, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/hooks/useLogout'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ClientOnly } from '@/components/common/client-only'
import { LoyaltyPointsBadge } from '@/components/ui/loyalty-points-badge'
import { useAuthStore } from '@/store/useAuthStore'

export default function CustomerNav() {
    const pathname = usePathname()
    const { logout } = useLogout()
    const user = useAuthStore((state) => state.user)

    const handleLogout = async () => {
        await logout()
    }

    const navItems = [
        {
            href: '/booking',
            label: 'Buat Janji',
            icon: CalendarPlus,
            match: '/booking',
        },
        {
            href: '/riwayat',
            label: 'Riwayat',
            icon: History,
            match: '/riwayat',
        },
        { href: '/galeri', label: 'Galeri', icon: Images, match: '/galeri' },
        { href: '/profil', label: 'Profil', icon: UserIcon, match: '/profil' },
    ]

    const isActive = (match: string) => pathname === match

    return (
        <nav className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
            <div className="w-full px-4 md:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    {/* Logo - Left */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/booking"
                            className="text-primary text-lg font-bold tracking-tight md:text-xl"
                        >
                            Smart Barbershop{' '}
                            <span className="text-muted-foreground text-xs font-normal">
                                Pelanggan
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav - Center */}
                    <div className="absolute left-1/2 hidden -translate-x-1/2 transform items-center gap-6 md:flex">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`hover:text-primary flex items-center gap-2 text-sm font-medium transition-colors ${isActive(item.match) ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right: Loyalty Points + Mobile menu + user */}
                    <div className="ml-auto flex items-center gap-2 md:gap-3">
                        {/* Loyalty Points Badge */}
                        {user && (
                            <LoyaltyPointsBadge
                                points={user.loyalty_points}
                                size="sm"
                                className="hidden md:inline-flex"
                            />
                        )}
                        <ClientOnly>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden"
                                        aria-label="Buka menu"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    {navItems.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <DropdownMenuItem
                                                key={item.href}
                                                asChild
                                            >
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center gap-2 ${isActive(item.match) ? 'text-primary' : ''}`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </ClientOnly>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="gap-1 px-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 md:gap-2 md:px-3"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Keluar</span>
                        </Button>
                    </div>
                </div>
            </div>
            {/* Mobile inline nav */}
            <div className="scrollbar-hide -mt-2 flex gap-4 overflow-x-auto px-4 pb-2 md:hidden">
                {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors ${isActive(item.match) ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-primary'}`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {item.label}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
