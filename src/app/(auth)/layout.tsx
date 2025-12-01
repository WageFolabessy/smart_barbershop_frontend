import React from 'react'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-primary text-4xl font-bold tracking-tight">
                        Smart Barbershop
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Pengalaman Cukur Rambut Premium
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}
