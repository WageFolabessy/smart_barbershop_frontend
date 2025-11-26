import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const role = request.cookies.get('user_role')?.value;
    const { pathname } = request.nextUrl;

    // Public routes that don't need auth
    if (pathname.startsWith('/auth') || pathname === '/') {
        if (token) {
            // If already logged in, redirect to appropriate dashboard
            if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            if (role === 'barber') return NextResponse.redirect(new URL('/barber/dashboard', request.url));
            return NextResponse.redirect(new URL('/booking', request.url));
        }
        return NextResponse.next();
    }

    // Protected routes
    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Role-based protection
    if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/booking', request.url)); // Or 403 page
    }

    if (pathname.startsWith('/barber') && role !== 'barber') {
        return NextResponse.redirect(new URL('/booking', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/barber/:path*',
        '/booking/:path*',
        '/riwayat/:path*',
        '/galeri/:path*',
        '/auth/:path*',
    ],
};
