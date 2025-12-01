import CustomerNav from '@/components/customer-nav'
import { Toaster } from '@/components/ui/sonner'

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-background min-h-screen pb-20 md:pb-0">
            <CustomerNav />
            <main className="container mx-auto p-4 md:p-8">{children}</main>
            <Toaster />
        </div>
    )
}
