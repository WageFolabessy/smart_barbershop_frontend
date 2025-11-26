import AdminNav from '@/components/admin-nav';
import { Toaster } from '@/components/ui/sonner';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <AdminNav />
            <main className="container mx-auto p-4 md:p-8">
                {children}
            </main>
            <Toaster />
        </div>
    );
}
