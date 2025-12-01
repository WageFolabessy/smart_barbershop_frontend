import BarberNav from '@/components/barber-nav'
import { Toaster } from '@/components/ui/sonner'

export default function BarberLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-background min-h-screen">
            <BarberNav />
            <main className="container mx-auto p-4 md:p-8">{children}</main>
            <Toaster />
        </div>
    )
}
