'use client';

import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';
import { CreditCard, Scissors, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
    const { data: overview } = useQuery({
        queryKey: ['admin-overview'],
        queryFn: async () => {
            const res = await api.get('/api/admin/dashboard/overview');
            return res.data?.data ?? res.data ?? {};
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
    });

    const { data: revenueRaw } = useQuery({
        queryKey: ['admin-revenue'],
        queryFn: async () => {
            const res = await api.get('/api/admin/dashboard/revenue');
            return res.data?.data ?? res.data?.revenue ?? res.data ?? [];
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
    });

    const { data: popularServicesRaw } = useQuery({
        queryKey: ['admin-popular-services'],
        queryFn: async () => {
            const res = await api.get('/api/admin/dashboard/popular-services');
            return res.data?.data ?? res.data ?? [];
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
    });

    const { data: recentBookings } = useQuery({
        queryKey: ['admin-recent-bookings'],
        queryFn: async () => {
            const res = await api.get('/api/admin/dashboard/recent-bookings');
            return res.data?.data ?? res.data ?? [];
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
    });

    const { data: barberPerformanceRaw } = useQuery({
        queryKey: ['admin-barber-performance'],
        queryFn: async () => {
            const res = await api.get('/api/admin/dashboard/barber-performance');
            return res.data?.data ?? res.data ?? [];
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
    });

    // Mock data fallback for visualization if API returns empty
    const mockRevenueData = [
        { name: 'Jan', total: 0 }, { name: 'Feb', total: 0 }, { name: 'Mar', total: 0 },
        { name: 'Apr', total: 0 }, { name: 'May', total: 0 }, { name: 'Jun', total: 0 },
    ];

    // Helpers (declare before use)
    const safeNumber = (val: any, fallback = 0): number => {
        if (typeof val === 'number') return val;
        if (val && typeof val === 'object') {
            if (typeof (val as any).all === 'number') return (val as any).all;
            const sum = Object.values(val).reduce((acc: number, v: any) => acc + (typeof v === 'number' ? v : 0), 0);
            if (sum > 0) return sum;
        }
        return fallback;
    };

    const safePick = (obj: any, keys: string[], fallback = 0): number => {
        for (const k of keys) {
            const v = obj?.[k];
            const n = safeNumber(v, NaN);
            if (!Number.isNaN(n)) return n;
        }
        return fallback;
    };

    const arrayFrom = (src: any, keys: string[] = []): any[] => {
        if (Array.isArray(src)) return src;
        if (!src || typeof src !== 'object') return [];
        for (const k of keys) {
            const v = (src as any)[k];
            if (Array.isArray(v)) return v;
        }
        // nested common shapes
        const candidates = [
            (src as any)?.data,
            (src as any)?.items,
            (src as any)?.list,
            (src as any)?.results,
            (src as any)?.series?.monthly,
            (src as any)?.monthly,
            (src as any)?.services,
            (src as any)?.barbers,
            (src as any)?.bookings,
        ].filter(Boolean);
        for (const c of candidates) {
            if (Array.isArray(c)) return c as any[];
        }
        // labels+values pair (zip)
        const labels = (src as any)?.labels || (src as any)?.months;
        const values = (src as any)?.values || (src as any)?.totals || (src as any)?.amounts;
        if (Array.isArray(labels) && Array.isArray(values) && labels.length === values.length) {
            return labels.map((l: any, i: number) => ({ name: l, total: values[i] }));
        }
        return [];
    };

    // Build revenue summary from object: { today, this_week, this_month, this_year }
    let revenue: Array<{ name: string; total: number }> = [];
    const revenueObj = (revenueRaw as any)?.revenue || (revenueRaw as any)?.data?.revenue || (revenueRaw as any);
    if (revenueObj && typeof revenueObj === 'object') {
        revenue = [
            { name: 'Hari ini', total: safeNumber(revenueObj.today, 0) },
            { name: 'Minggu ini', total: safeNumber(revenueObj.this_week, 0) },
            { name: 'Bulan ini', total: safeNumber(revenueObj.this_month, 0) },
            { name: 'Tahun ini', total: safeNumber(revenueObj.this_year, 0) },
        ];
    } else {
        const revenueArr = arrayFrom(revenueRaw, ['data', 'items', 'monthly']);
        revenue = revenueArr.map((item: any, idx: number) => ({
            name: item?.name ?? item?.month ?? item?.label ?? `#${idx + 1}`,
            total: item?.total ?? item?.amount ?? item?.value ?? (typeof item === 'number' ? item : 0),
        }));
    }
    const chartData = revenue.length > 0 ? revenue : mockRevenueData;

    const popularArr = arrayFrom(popularServicesRaw, ['data', 'items', 'services', 'popular', 'popular_services']);
    const popularServices = popularArr.map((item: any) => ({
        name: item?.name ?? item?.service_name ?? item?.label ?? '-',
        count: item?.booking_count ?? item?.count ?? item?.total ?? item?.value ?? 0,
    }));
    const topService = popularServices.length > 0 ? popularServices.reduce((max, cur) => (cur.count > max.count ? cur : max), popularServices[0]) : null;

    const performanceArr = arrayFrom(barberPerformanceRaw, ['data', 'items', 'barbers', 'performance', 'barber_performance']);
    const barberPerformance = performanceArr.map((item: any) => ({
        name: item?.barber_name ?? item?.name ?? item?.label ?? '-',
        total_bookings: Number(item?.total_bookings ?? item?.bookings_count ?? item?.count ?? 0) || 0,
        completed_bookings: Number(item?.completed_bookings ?? item?.completed ?? 0) || 0,
    }));

    const recentBookingsArr = arrayFrom(recentBookings, ['data', 'items', 'recent_bookings']);


    let totalRevenue = safePick((overview as any), ['total_revenue', 'revenue_total', 'sum_revenue'], 0);
    if (!totalRevenue && (revenueRaw as any)?.data?.revenue) {
        totalRevenue = safeNumber((revenueRaw as any).data.revenue.this_year, 0);
    }
    if (!totalRevenue && revenue.length) {
        totalRevenue = revenue.reduce((acc: number, r: any) => acc + (Number(r.total) || 0), 0);
    }

    const totalBookings = safeNumber((overview as any)?.total_bookings?.all, safePick((overview as any), ['total_bookings', 'bookings_total', 'this_month_bookings', 'bookings_this_month'], 0));
    const activeUsers = safeNumber((overview as any)?.total_users?.all, safePick((overview as any), ['active_users', 'total_users', 'users_count', 'customers_count'], 0));

    const bookingsStatusObject: any = (overview as any)?.total_bookings;
    const bookingsStatus = bookingsStatusObject && typeof bookingsStatusObject === 'object' ? [
        { name: 'Menunggu', key: 'pending', value: safeNumber(bookingsStatusObject.pending, 0) },
        { name: 'Terkonfirmasi', key: 'confirmed', value: safeNumber(bookingsStatusObject.confirmed, 0) },
        { name: 'Selesai', key: 'completed', value: safeNumber(bookingsStatusObject.completed, 0) },
        { name: 'Dibatalkan', key: 'cancelled', value: safeNumber(bookingsStatusObject.cancelled, 0) },
    ] : [];

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
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Total pendapatan keseluruhan</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Booking Bulan Ini</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBookings}</div>
                        <p className="text-xs text-muted-foreground">Booking bulan ini</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeUsers}</div>
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
                                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
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
                                <Bar dataKey="total" fill="#14b8a6" radius={[4, 4, 0, 0]} />
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
                            {recentBookingsArr.map((booking: any) => (
                                <div key={booking.id} className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{booking.customer_name || '-'}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.service_name || '-'} - {format(new Date(booking.booking_datetime), 'd MMM HH:mm', { locale: id })}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">+{formatCurrency(Number(booking.final_price) || 0)}</div>
                                </div>
                            ))}
                            {recentBookingsArr.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">Belum ada booking terbaru.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Distribusi Status Booking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={bookingsStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={85}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }: { name?: string, percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {bookingsStatus.map((_: any, index: number) => (
                                        <Cell key={`status-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px' }} formatter={(value: number) => `${value} booking`} />
                                <Legend verticalAlign="bottom" height={24} />
                            </PieChart>
                        </ResponsiveContainer>
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
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="total_bookings" fill="#8884d8" radius={[0, 4, 4, 0]} name="Total Booking" />
                                <Bar dataKey="completed_bookings" fill="#10b981" radius={[0, 4, 4, 0]} name="Selesai" />
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
