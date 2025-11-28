'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';
import { CreditCard, Scissors, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/axios';
import {
    DashboardOverview,
    DashboardRevenueEnvelope,
    DashboardRevenueSummary,
    DashboardPopularServicesEnvelope,
    DashboardPopularService,
    DashboardBarberPerformanceEnvelope,
    DashboardBarberPerformance,
    DashboardRecentBookingsEnvelope,
    DashboardRecentBooking,
} from '@/types/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
    const { data: overview } = useQuery<DashboardOverview | Record<string, unknown>>({
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

    const { data: revenueRaw } = useQuery<DashboardRevenueEnvelope | DashboardRevenueSummary | Record<string, unknown>>({
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

    const { data: popularServicesRaw } = useQuery<DashboardPopularServicesEnvelope | DashboardPopularService[] | Record<string, unknown>>({
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

    const { data: recentBookings } = useQuery<DashboardRecentBookingsEnvelope | DashboardRecentBooking[] | Record<string, unknown>>({
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

    const { data: barberPerformanceRaw } = useQuery<DashboardBarberPerformanceEnvelope | DashboardBarberPerformance[] | Record<string, unknown>>({
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

    // Helpers (declare before use) - type-safe
    const isRecord = (val: unknown): val is Record<string, unknown> => !!val && typeof val === 'object' && !Array.isArray(val);

    const safeNumber = (val: unknown, fallback = 0): number => {
        if (typeof val === 'number' && !Number.isNaN(val)) return val;
        if (isRecord(val)) {
            const allVal = val['all'];
            if (typeof allVal === 'number') return allVal;
            const sum = Object.values(val).reduce((acc: number, v: unknown) => acc + (typeof v === 'number' ? v : 0), 0);
            if (sum > 0) return sum;
        }
        return fallback;
    };

    const safePick = (obj: unknown, keys: string[], fallback = 0): number => {
        if (!isRecord(obj)) return fallback;
        for (const k of keys) {
            const v = obj[k];
            const n = safeNumber(v, NaN);
            if (!Number.isNaN(n)) return n;
        }
        return fallback;
    };

    const arrayFrom = (src: unknown, keys: string[] = []): unknown[] => {
        if (Array.isArray(src)) return src;
        if (!isRecord(src)) return [];
        for (const k of keys) {
            const v = src[k];
            if (Array.isArray(v)) return v as unknown[];
        }
        const candidates: unknown[] = [];
        const pushIfArray = (v: unknown) => { if (Array.isArray(v)) candidates.push(v); };
        pushIfArray(src['data']);
        pushIfArray(src['items']);
        pushIfArray(src['list']);
        pushIfArray(src['results']);
        const series = src['series'];
        if (isRecord(series)) pushIfArray(series['monthly']);
        pushIfArray(src['monthly']);
        pushIfArray(src['services']);
        pushIfArray(src['barbers']);
        pushIfArray(src['bookings']);
        if (candidates.length > 0) return candidates[0] as unknown[];
        const labels = (src['labels'] as unknown) || (src['months'] as unknown);
        const values = (src['values'] as unknown) || (src['totals'] as unknown) || (src['amounts'] as unknown);
        if (Array.isArray(labels) && Array.isArray(values) && labels.length === values.length) {
            return labels.map((l, i) => ({ name: String(l), total: typeof values[i] === 'number' ? values[i] : 0 }));
        }
        return [];
    };

    type RevenueChartItem = { name: string; total: number };
    type PopularServiceItem = { name: string; count: number };
    type BarberPerformanceItem = { name: string; total_bookings: number; completed_bookings: number };
    type RecentBookingItem = { id: number; customer_name: string; service_name: string; booking_datetime: string; final_price: number };

    const normalizeRevenue = (raw: unknown): RevenueChartItem[] => {
        const env = isRecord(raw) && isRecord(raw['data']) ? (raw['data'] as Record<string, unknown>) : (isRecord(raw) ? raw : undefined);
        const revenueObj = env && (isRecord(env['revenue']) ? (env['revenue'] as Record<string, unknown>) : isRecord(env) ? env : undefined);
        if (revenueObj) {
            return [
                { name: 'Hari ini', total: safeNumber(revenueObj['today'], 0) },
                { name: 'Minggu ini', total: safeNumber(revenueObj['this_week'], 0) },
                { name: 'Bulan ini', total: safeNumber(revenueObj['this_month'], 0) },
                { name: 'Tahun ini', total: safeNumber(revenueObj['this_year'], 0) },
            ];
        }
        const revenueArr = arrayFrom(raw, ['data', 'items', 'monthly']);
        return revenueArr.map((item, idx) => {
            if (isRecord(item)) {
                const name = typeof item['name'] === 'string' ? (item['name'] as string)
                    : typeof item['month'] === 'string' ? (item['month'] as string)
                        : typeof item['label'] === 'string' ? (item['label'] as string) : `#${idx + 1}`;
                const total = safeNumber(item['total'] ?? item['amount'] ?? item['value'] ?? 0, 0);
                return { name, total };
            }
            return { name: `#${idx + 1}`, total: typeof item === 'number' ? item : 0 };
        });
    };

    const normalizePopularServices = (raw: unknown): PopularServiceItem[] => {
        const arr = arrayFrom(raw, ['data', 'items', 'services', 'popular', 'popular_services']);
        return arr.map((item) => {
            if (isRecord(item)) {
                const name = typeof item['name'] === 'string' ? (item['name'] as string)
                    : typeof item['service_name'] === 'string' ? (item['service_name'] as string)
                        : typeof item['label'] === 'string' ? (item['label'] as string) : '-';
                const count = safeNumber(item['booking_count'] ?? item['count'] ?? item['total'] ?? item['value'] ?? 0, 0);
                return { name, count };
            }
            return { name: '-', count: 0 };
        });
    };

    const normalizeBarberPerformance = (raw: unknown): BarberPerformanceItem[] => {
        const arr = arrayFrom(raw, ['data', 'items', 'barbers', 'performance', 'barber_performance']);
        return arr.map((item) => {
            if (isRecord(item)) {
                const name = typeof item['barber_name'] === 'string' ? (item['barber_name'] as string)
                    : typeof item['name'] === 'string' ? (item['name'] as string)
                        : typeof item['label'] === 'string' ? (item['label'] as string) : '-';
                const total_bookings = safeNumber(item['total_bookings'] ?? item['bookings_count'] ?? item['count'] ?? 0, 0);
                const completed_bookings = safeNumber(item['completed_bookings'] ?? item['completed'] ?? 0, 0);
                return { name, total_bookings, completed_bookings };
            }
            return { name: '-', total_bookings: 0, completed_bookings: 0 };
        });
    };

    const normalizeRecentBookings = (raw: unknown): RecentBookingItem[] => {
        const arr = arrayFrom(raw, ['data', 'items', 'recent_bookings']);
        return arr.map((item) => {
            if (isRecord(item)) {
                const id = typeof item['id'] === 'number' ? (item['id'] as number) : 0;
                const customer_name = typeof item['customer_name'] === 'string' ? (item['customer_name'] as string) : '-';
                const service_name = typeof item['service_name'] === 'string' ? (item['service_name'] as string) : '-';
                const booking_datetime = typeof item['booking_datetime'] === 'string' ? (item['booking_datetime'] as string) : new Date().toISOString();
                const final_price = safeNumber(item['final_price'] ?? 0, 0);
                return { id, customer_name, service_name, booking_datetime, final_price };
            }
            return { id: 0, customer_name: '-', service_name: '-', booking_datetime: new Date().toISOString(), final_price: 0 };
        });
    };

    // Build revenue summary from object: { today, this_week, this_month, this_year }
    const chartData: RevenueChartItem[] = (() => {
        const normalized = normalizeRevenue(revenueRaw);
        return normalized.length > 0 ? normalized : mockRevenueData;
    })();

    const popularServices: PopularServiceItem[] = normalizePopularServices(popularServicesRaw);
    const topService: PopularServiceItem | null = popularServices.length > 0 ? popularServices.reduce((max, cur) => (cur.count > max.count ? cur : max), popularServices[0]) : null;

    const barberPerformance: BarberPerformanceItem[] = normalizeBarberPerformance(barberPerformanceRaw);

    const recentBookingsArr: RecentBookingItem[] = normalizeRecentBookings(recentBookings);


    let totalRevenue = safePick(overview, ['total_revenue', 'revenue_total', 'sum_revenue'], 0);
    const revenueEnvelope = isRecord(revenueRaw) && isRecord(revenueRaw['data']) ? (revenueRaw['data'] as Record<string, unknown>) : undefined;
    if (!totalRevenue && revenueEnvelope && isRecord(revenueEnvelope['revenue'])) {
        totalRevenue = safeNumber((revenueEnvelope['revenue'] as Record<string, unknown>)['this_year'], 0);
    }
    if (!totalRevenue && chartData.length) {
        totalRevenue = chartData.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
    }

    const totalBookings = isRecord(overview) ? safeNumber(overview['total_bookings'] && isRecord(overview['total_bookings']) ? (overview['total_bookings'] as Record<string, unknown>)['all'] : overview['total_bookings'], safePick(overview, ['total_bookings', 'bookings_total', 'this_month_bookings', 'bookings_this_month'], 0)) : 0;
    const activeUsers = isRecord(overview) ? safeNumber(overview['total_users'] && isRecord(overview['total_users']) ? (overview['total_users'] as Record<string, unknown>)['all'] : overview['total_users'], safePick(overview, ['active_users', 'total_users', 'users_count', 'customers_count'], 0)) : 0;

    const bookingsStatusObject = isRecord(overview) && isRecord(overview['total_bookings']) ? (overview['total_bookings'] as Record<string, unknown>) : undefined;
    const bookingsStatus = bookingsStatusObject ? [
        { name: 'Menunggu', key: 'pending', value: safeNumber(bookingsStatusObject['pending'], 0) },
        { name: 'Terkonfirmasi', key: 'confirmed', value: safeNumber(bookingsStatusObject['confirmed'], 0) },
        { name: 'Selesai', key: 'completed', value: safeNumber(bookingsStatusObject['completed'], 0) },
        { name: 'Dibatalkan', key: 'cancelled', value: safeNumber(bookingsStatusObject['cancelled'], 0) },
    ] : [];

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 640);
        handler();
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
        const shorten = (value: string, max: number) => value.length > max ? value.slice(0, max - 1) + '…' : value;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Dashboard Overview</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Ringkasan performa bisnis Anda.</p>
            </div>

            {/* Summary cards: switch from horizontal scroll to pure grid to prevent horizontal overflow on 430px width */}
            <div className="grid grid-cols-2 max-[380px]:grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                        <ResponsiveContainer width="100%" height={isMobile ? 240 : 350}>
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
                            {recentBookingsArr.map((booking: RecentBookingItem) => (
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
                        <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                            <PieChart>
                                <Pie
                                    data={bookingsStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={!isMobile}
                                    outerRadius={isMobile ? 70 : 85}
                                    dataKey="value"
                                    nameKey="name"
                                    label={isMobile ? false : ({ name, percent }: { name?: string, percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {bookingsStatus.map((_, index) => (
                                        <Cell key={`status-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload || !payload.length) return null;
                                        const item = payload[0];
                                        const fill = (item && (item.payload as any))?.fill || item.color || '#fff';
                                        const name = item.name || '';
                                        const value = item.value as number;
                                        return (
                                            <div style={{ background:'#1f1f1f', border:`1px solid ${fill}`, borderRadius:8, padding:'6px 10px', minWidth:140 }}>
                                                <div style={{ color: fill, fontSize:12, fontWeight:600 }}>{name}</div>
                                                <div style={{ color:'#e5e5e5', fontSize:11 }}>{value} booking</div>
                                            </div>
                                        );
                                    }}
                                />
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
                        <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                            <BarChart data={Array.isArray(barberPerformance) ? barberPerformance : []} layout="vertical" margin={{ top: 5, right: 20, left: isMobile ? 70 : 30, bottom: 5 }}>
                                <XAxis type="number" tick={{ fontSize: isMobile ? 10 : 12 }} />
                                <YAxis dataKey="name" type="category" width={isMobile ? 110 : 140} tickFormatter={(v: string) => isMobile ? shorten(v, 12) : v} tick={{ fontSize: isMobile ? 10 : 12 }} />
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
                        <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                            <PieChart>
                                <Pie
                                    data={popularServices}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={isMobile ? 70 : 80}
                                    innerRadius={isMobile ? 40 : undefined}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="name"
                                    label={({ name, percent }: { name?: string, percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {(Array.isArray(popularServices) ? popularServices : []).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload || !payload.length) return null;
                                        const item = payload[0];
                                        const fill = (item && (item.payload as any))?.fill || item.color || '#fff';
                                        const name = item.name || '';
                                        const value = item.value as number;
                                        return (
                                            <div style={{ background:'#1f1f1f', border:`1px solid ${fill}`, borderRadius:8, padding:'6px 10px', minWidth:140 }}>
                                                <div style={{ color: fill, fontSize:12, fontWeight:600 }}>{name}</div>
                                                <div style={{ color:'#e5e5e5', fontSize:11 }}>{value}x</div>
                                            </div>
                                        );
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
