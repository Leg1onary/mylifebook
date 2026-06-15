import { useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import type { LoginPayload } from '@/types/auth'

/**
 * Convenience hook — wraps authStore + authApi.
 * Keeps components decoupled from the store internals.
 */
export function useAuth() {
  const { token, user, setAuth, setUser, logout } = useAuthStore()

  const isAuthenticated = Boolean(token)

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authApi.login(payload)
    // authApi.login returns axios response; extract data
    const { access_token } = res.data
    setAuth(access_token)
    // Fetch user profile after login
    const me = await authApi.me()
    setUser(me.data)
  }, [setAuth, setUser])

  const logoutAndClear = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // best-effort — always clear local state
    } finally {
      logout()
    }
  }, [logout])

  const refreshUser = useCallback(async () => {
    const me = await authApi.me()
    setUser(me.data)
  }, [setUser])

  return {
    isAuthenticated,
    user,
    token,
    login,
    logout: logoutAndClear,
    refreshUser,
  }
}
