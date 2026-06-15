import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function GuestGuard() {
  const token = useAuthStore(s => s.token)
  if (token) return <Navigate to='/today' replace />
  return <Outlet />
}
