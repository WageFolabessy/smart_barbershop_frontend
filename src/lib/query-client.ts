import { QueryClient } from '@tanstack/react-query';
import { QUERY_CONFIG } from './constants';

/**
 * Centralized React Query client configuration
 * Provides default options for all queries and mutations
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: QUERY_CONFIG.STALE_TIME,
            gcTime: QUERY_CONFIG.CACHE_TIME,
            retry: QUERY_CONFIG.RETRY_ATTEMPTS,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: false,
        },
    },
});
