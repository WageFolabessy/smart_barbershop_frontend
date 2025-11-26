'use client';

import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CreditCard, Scissors, Users, Calendar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/axios';

export default function AdminDashboard() {
    const { data: overview } = useQuery({
        queryKey: ['admin-overview'],
        queryFn: async () => {
            const res = await api.get('/api/admin/dashboard/overview');
            return res.data;
        },
    });

    const { data: revenue } = useQuery({
        queryKey: ['admin-revenue'],
        queryFn: async () => {
            const res = await api.get('/api/admin/dashboard/revenue');
            return res.data.data; // Assuming data is array of { month: string, revenue: number }
        },
    });

    // Mock data if API fails or returns empty (for visualization)
    const mockRevenueData = [
        { name: 'Jan', total: 1500000 },
        { name: 'Feb', total: 2300000 },
        { name: 'Mar', total: 3200000 },
        { name: 'Apr', total: 4500000 },
        { name: 'May', total: 5100000 },
        { name: 'Jun', total: 6000000 },
    ];

    const chartData = revenue && revenue.length > 0 ? revenue : mockRevenueData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard Overview</h1>
                <p className="text-muted-foreground">Ringkasan performa bisnis Anda.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(overview?.total_revenue || 12500000)}</div>
                        <p className="text-xs text-muted-foreground">+20.1% dari bulan lalu</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Booking Bulan Ini</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview?.total_bookings || 345}</div>
                        <p className="text-xs text-muted-foreground">+15% dari bulan lalu</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview?.active_users || 120}</div>
                        <p className="text-xs text-muted-foreground">+12 sejak bulan lalu</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Layanan Populer</CardTitle>
                        <Scissors className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Gentleman Cut</div>
                        <p className="text-xs text-muted-foreground">45% dari total booking</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Pendapatan Bulanan</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `Rp${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Bar dataKey="total" fill="oklch(0.79 0.16 80)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Booking Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Mock recent bookings */}
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Pelanggan #{i}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Gentleman Cut - Kapster A
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">+{formatCurrency(50000)}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
