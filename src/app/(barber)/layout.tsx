import BarberNav from '@/components/barber-nav';
import { Toaster } from '@/components/ui/sonner';

export default function BarberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <BarberNav />
            <main className="container mx-auto p-4 md:p-8">
                {children}
            </main>
            <Toaster />
        </div>
    );
}
