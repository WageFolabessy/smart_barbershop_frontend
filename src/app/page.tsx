import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Scissors } from 'lucide-react'

export default function Home() {
    return (
        <div className="bg-background text-foreground relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-4 right-4 z-20 md:top-8 md:right-8">
                <ThemeToggle />
            </div>

            {/* Background Effects */}
            <div className="from-primary/10 via-background to-background absolute top-0 left-0 z-0 h-full w-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))]" />

            <div className="z-10 max-w-2xl space-y-6 px-4 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="bg-primary/20 border-primary/50 rounded-full border-2 p-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                        <Scissors className="text-primary h-16 w-16" />
                    </div>
                </div>

                <h1 className="bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-5xl font-bold tracking-tighter text-transparent md:text-7xl">
                    Smart Barbershop
                </h1>

                <p className="text-muted-foreground text-xl">
                    Pengalaman Cukur Rambut Premium dengan Sentuhan Teknologi.
                    <br />
                    Booking Mudah. Gaya Maksimal.
                </p>

                <div className="flex justify-center gap-4 pt-8">
                    <Link href="/login">
                        <Button
                            size="lg"
                            className="px-8 py-6 text-lg font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]"
                        >
                            Masuk Sekarang
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-primary/50 hover:bg-primary/10 px-8 py-6 text-lg font-bold"
                        >
                            Daftar Akun
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="text-muted-foreground/50 absolute bottom-8 text-sm">
                &copy; 2025 Smart Barbershop. All rights reserved.
            </div>
        </div>
    )
}
