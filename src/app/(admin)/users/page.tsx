'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Manajemen Pengguna</h1>
                <p className="text-muted-foreground">Kelola data pelanggan, kapster, dan admin.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Fitur ini akan segera hadir.</p>
                </CardContent>
            </Card>
        </div>
    );
}
