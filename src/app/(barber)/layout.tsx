import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import BarberNav from '@/components/barber-nav'
import { Toaster } from '@/components/ui/sonner'
import { Breadcrumb } from '@/components/breadcrumb'
import { getAuthFromCookies } from '@/lib/auth-helpers'

export default async function BarberLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Server-side auth check (double protection with middleware)
    const cookieStore = await cookies()
    const { isAuthenticated, role } = getAuthFromCookies(cookieStore)

    // Redirect if not authenticated or not barber
    if (!isAuthenticated) {
        redirect('/login')
    }

    if (role !== 'barber') {
        redirect('/login')
    }

    return (
        <div className="bg-background min-h-screen">
            <BarberNav />
            <main className="container mx-auto p-4 md:p-8">
                <Breadcrumb />
                {children}
            </main>
            <Toaster />
        </div>
    )
}
