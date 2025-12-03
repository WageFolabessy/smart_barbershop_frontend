'use client'

import { User as UserIcon, Mail, Phone, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoyaltyPointsCard } from '@/components/ui/loyalty-points-card'
import { useAuthStore } from '@/store/useAuthStore'

/**
 * Customer Profile Page
 * 
 * Displays customer information including:
 * - Profile details (name, email, phone, role)
 * - Loyalty points card with full details
 */
export default function ProfilPage() {
    const user = useAuthStore((state) => state.user)

    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Memuat profil...</p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            {/* Page Header */}
            <div className="space-y-2">
                <h1 className="text-primary text-3xl font-bold tracking-tight">
                    Profil Saya
                </h1>
                <p className="text-muted-foreground">
                    Informasi akun dan poin loyalitas Anda
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Information Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 border-2 border-primary/20">
                                <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                    {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{user.name}</CardTitle>
                                <CardDescription>Pelanggan</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Email */}
                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Email
                                </p>
                                <p className="text-sm font-medium break-all">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Nomor Telepon
                                </p>
                                <p className="text-sm font-medium">
                                    {user.phone || 'Tidak ada'}
                                </p>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Role
                                </p>
                                <p className="text-sm font-medium capitalize">
                                    {user.role === 'customer' ? 'Pelanggan' : user.role}
                                </p>
                            </div>
                        </div>

                        {/* User ID */}
                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <UserIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                    User ID
                                </p>
                                <p className="text-sm font-medium font-mono">
                                    #{user.id}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loyalty Points Card */}
                <LoyaltyPointsCard
                    points={user.loyalty_points}
                    showDetails={true}
                />
            </div>
        </div>
    )
}
