import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: {
        default: 'Smart Barbershop - Premium Cuts',
        template: '%s | Smart Barbershop',
    },
    description:
        'Platform booking online untuk Smart Barbershop. Pilih kapster favorit Anda, jadwalkan janji temu, dan nikmati layanan cukur premium.',
    keywords: [
        'barbershop',
        'cukur rambut',
        'grooming',
        'salon pria',
        'booking online',
        'janji temu',
    ],
    authors: [{ name: 'Smart Barbershop' }],
    creator: 'Smart Barbershop',
    publisher: 'Smart Barbershop',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    ),
    openGraph: {
        title: 'Smart Barbershop - Premium Cuts',
        description:
            'Platform booking online untuk Smart Barbershop. Pilih kapster favorit Anda dan jadwalkan janji temu.',
        url: '/',
        siteName: 'Smart Barbershop',
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Smart Barbershop - Premium Cuts',
        description:
            'Platform booking online untuk Smart Barbershop. Pilih kapster favorit Anda dan jadwalkan janji temu.',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

import { ErrorBoundary } from '@/components/error-boundary'

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="id" className="dark">
            <body
                className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
            >
                <ErrorBoundary>
                    <Providers>{children}</Providers>
                </ErrorBoundary>
            </body>
        </html>
    )
}
