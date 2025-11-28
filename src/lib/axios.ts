import axios, { AxiosHeaders } from 'axios';
import { env } from './env';
import { AUTH_COOKIE_NAMES } from './constants';

const api = axios.create({
    baseURL: env.apiUrl,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
});

api.interceptors.request.use(async (config) => {
    // Get token from cookie (set in login/register)
    if (typeof window !== 'undefined') {
        // Dynamic ESM import to avoid SSR issues
        const { default: Cookies } = await import('js-cookie');
        const token = Cookies.get(AUTH_COOKIE_NAMES.TOKEN);
        if (token) {
            // Ensure headers exists
            if (!config.headers) {
                config.headers = new AxiosHeaders();
            }
            // Prefer AxiosHeaders API when available
            if (config.headers instanceof AxiosHeaders) {
                config.headers.set('Authorization', `Bearer ${token}`);
            } else {
                // Fallback for plain header objects
                (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
            }
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if unauthenticated
            if (typeof window !== 'undefined' &&
                !window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
