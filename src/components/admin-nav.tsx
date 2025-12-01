'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart3,
    LogOut,
    Scissors,
    User,
    Users,
    Clock,
    Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/useAuthStore'
import { useLogout } from '@/hooks/useLogout'

export default function AdminNav() {
    const pathname = usePathname()
    const { logout } = useLogout()
    const user = useAuthStore((state) => state.user)

    const handleLogout = async () => {
        await logout()
    }

    const navItems = [
        { href: '/admin/dashboard', label: 'Overview', icon: BarChart3 },
        { href: '/admin/services', label: 'Layanan', icon: Scissors },
        { href: '/admin/time-slots', label: 'Slot Waktu', icon: Clock },
        { href: '/admin/users', label: 'Pengguna', icon: Users },
    ]

    return (
        <nav className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
            <div className="w-full px-4 md:px-8">
                <div className="flex h-16 items-center justify-between gap-3">
                    {/* Left: Brand */}
                    <div className="flex min-w-0 items-center gap-2">
                        <Link
                            href="/admin/dashboard"
                            className="text-primary text-lg font-bold tracking-tight whitespace-nowrap md:text-xl"
                        >
                            Smart Barbershop{' '}
                            <span className="text-muted-foreground text-xs font-normal">
                                Admin
                            </span>
                        </Link>
                    </div>

                    {/* Center (Desktop Nav) */}
                    <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`hover:text-primary flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right: User + Logout + Mobile Menu */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Mobile Menu Button */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    aria-label="Buka menu navigasi"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href
                                    return (
                                        <DropdownMenuItem
                                            key={item.href}
                                            asChild
                                        >
                                            <Link
                                                href={item.href}
                                                className={`flex items-center gap-2 ${isActive ? 'text-primary' : ''}`}
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="xs:flex text-muted-foreground hidden max-w-[110px] items-center gap-2 truncate text-sm md:max-w-none">
                            <User className="h-4 w-4 shrink-0" />
                            <span className="truncate">{user?.name}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="gap-1 px-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 md:gap-2 md:px-3"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Keluar</span>
                        </Button>
                    </div>
                </div>
                {/* Mobile inline nav (optional horizontal list) */}
                <div className="scrollbar-hide -mt-2 flex gap-4 overflow-x-auto pb-2 md:hidden">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors ${isActive ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-primary'}`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
