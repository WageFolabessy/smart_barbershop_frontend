import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/axios'
import Cookies from 'js-cookie'
import { AUTH_COOKIE_NAMES, ROUTES } from '@/lib/constants'
import { toast } from 'sonner'

export function useLogout() {
    const router = useRouter()
    const logoutStore = useAuthStore((state) => state.logout)

    const logout = async () => {
        try {
            await api.post('/api/auth/logout')
        } catch (error) {
            console.error('Logout error:', error)
            // Continue with local cleanup even if API fails
        } finally {
            Cookies.remove(AUTH_COOKIE_NAMES.TOKEN)
            Cookies.remove(AUTH_COOKIE_NAMES.USER_ROLE)
            logoutStore()
            toast.success('Berhasil keluar')
            router.push(ROUTES.LOGIN)
        }
    }

    return { logout }
}
