import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import CustomerNav from '@/components/customer-nav'
import { Toaster } from '@/components/ui/sonner'
import { Breadcrumb } from '@/components/breadcrumb'
import { getAuthFromCookies } from '@/lib/auth-helpers'

export default async function CustomerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Server-side auth check (double protection with middleware)
    const cookieStore = await cookies()
    const { isAuthenticated } = getAuthFromCookies(cookieStore)

    // Redirect if not authenticated (any role can access customer routes)
    if (!isAuthenticated) {
        redirect('/login')
    }

    return (
        <div className="bg-background min-h-screen pb-20 md:pb-0">
            <CustomerNav />
            <main className="container mx-auto p-4 md:p-8">
                <Breadcrumb />
                {children}
            </main>
            <Toaster />
        </div>
    )
}
