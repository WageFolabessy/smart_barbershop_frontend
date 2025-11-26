import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
});

api.interceptors.request.use((config) => {
    // Get token from cookie (set in login/register)
    // We need to handle both server-side and client-side if this file is used in both
    // But js-cookie is client-side only. For server components, we'd need 'next/headers'
    // Since this is mostly used in client components (useQuery), js-cookie is fine.
    // However, to be safe, we check if window is defined.
    if (typeof window !== 'undefined') {
        // Dynamic import to avoid SSR issues with js-cookie if any
        const Cookies = require('js-cookie');
        const token = Cookies.get('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if unauthenticated
            // Route is /login because of (auth) group
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
