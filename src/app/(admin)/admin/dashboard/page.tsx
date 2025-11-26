'use client';

import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { CreditCard, Scissors, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/axios';
import { Booking } from '@/types/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
            return res.data.data;
        },
    });

    const { data: popularServices } = useQuery({
        queryKey: ['admin-popular-services'],
        queryFn: async () => {
            const res = await api.get('/api/admin/dashboard/popular-services');
            return res.data.data;
        },
    });

    const { data: recentBookings } = useQuery({
        queryKey: ['admin-recent-bookings'],
        queryFn: async () => {
            const res = await api.get<{ data: Booking[] }>('/api/admin/dashboard/recent-bookings');
            return res.data.data;
        },
    });

    const { data: barberPerformance } = useQuery({
        queryKey: ['admin-barber-performance'],
        queryFn: async () => {
            const res = await api.get('/api/admin/dashboard/barber-performance');
            return res.data.data;
        },
    });

    // Mock data fallback for visualization if API returns empty
    const mockRevenueData = [
        { name: 'Jan', total: 0 }, { name: 'Feb', total: 0 }, { name: 'Mar', total: 0 },
        { name: 'Apr', total: 0 }, { name: 'May', total: 0 }, { name: 'Jun', total: 0 },
    ];

    const chartData = Array.isArray(revenue) && revenue.length > 0 ? revenue : mockRevenueData;
    const topService = Array.isArray(popularServices) && popularServices.length > 0 ? popularServices[0] : null;

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
                        <div className="text-2xl font-bold">{formatCurrency(overview?.total_revenue || 0)}</div>
                        <p className="text-xs text-muted-foreground">Total pendapatan keseluruhan</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Booking Bulan Ini</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview?.total_bookings || 0}</div>
                        <p className="text-xs text-muted-foreground">Booking bulan ini</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview?.active_users || 0}</div>
                        <p className="text-xs text-muted-foreground">Total pelanggan terdaftar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Layanan Terpopuler</CardTitle>
                        <Scissors className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">{topService?.name || '-'}</div>
                        <p className="text-xs text-muted-foreground">
                            {topService ? `${topService.count} booking` : 'Belum ada data'}
                        </p>
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
                            {(Array.isArray(recentBookings) ? recentBookings : []).map((booking) => (
                                <div key={booking.id} className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{booking.customer.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.service.name} - {format(new Date(booking.booking_datetime), 'd MMM HH:mm', { locale: id })}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">+{formatCurrency(booking.pricing.final_price)}</div>
                                </div>
                            ))}
                            {(!Array.isArray(recentBookings) || recentBookings.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">Belum ada booking terbaru.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Performa Kapster (Booking)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={Array.isArray(barberPerformance) ? barberPerformance : []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px' }}
                                />
                                <Bar dataKey="bookings_count" fill="#8884d8" radius={[0, 4, 4, 0]} name="Total Booking" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Layanan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={popularServices}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="name"
                                    label={({ name, percent }: { name?: string, percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {(Array.isArray(popularServices) ? popularServices : []).map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
