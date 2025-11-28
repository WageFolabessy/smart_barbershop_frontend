import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />

      <div className="z-10 text-center space-y-6 max-w-2xl px-4">
        <div className="flex justify-center mb-8">
          <div className="bg-primary/20 p-6 rounded-full border-2 border-primary/50 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <Scissors className="h-16 w-16 text-primary" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-white to-white/50">
          Smart Barbershop
        </h1>

        <p className="text-xl text-muted-foreground">
          Pengalaman Cukur Rambut Premium dengan Sentuhan Teknologi.
          <br />
          Booking Mudah. Gaya Maksimal.
        </p>

        <div className="flex gap-4 justify-center pt-8">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 py-6 font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all">
              Masuk Sekarang
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 font-bold border-primary/50 hover:bg-primary/10">
              Daftar Akun
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 text-sm text-muted-foreground/50">
        &copy; 2025 Smart Barbershop. All rights reserved.
      </div>
    </div>
  );
}
