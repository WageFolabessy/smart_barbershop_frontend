import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-primary tracking-tight">Smart Barbershop</h1>
                    <p className="mt-2 text-muted-foreground">
                        Pengalaman Cukur Rambut Premium
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
