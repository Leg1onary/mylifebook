import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token
api.interceptors.request.use(cfg => {
  const token = useAuthStore.getState().token
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-logout on 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  }
)
