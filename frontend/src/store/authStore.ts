import { create } from 'zustand'
import type { UserOut } from '@/types/auth'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: UserOut | null
  setAuth: (token: string, refreshToken?: string, user?: UserOut) => void
  setUser: (user: UserOut) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token:        localStorage.getItem('mlb-token'),
  refreshToken: localStorage.getItem('mlb-refresh'),
  user:         null,

  setAuth: (token, refreshToken, user) => {
    localStorage.setItem('mlb-token', token)
    if (refreshToken) localStorage.setItem('mlb-refresh', refreshToken)
    set({ token, refreshToken: refreshToken ?? null, user: user ?? null })
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('mlb-token')
    localStorage.removeItem('mlb-refresh')
    set({ token: null, refreshToken: null, user: null })
  },
}))
