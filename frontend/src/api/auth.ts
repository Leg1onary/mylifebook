import { api } from './client'
import type { TokenResponse, UserOut, LoginPayload, RegisterPayload } from '@/types/auth'

export const authApi = {
  login:    (data: LoginPayload)    => api.post<TokenResponse>('/auth/login', data),
  register: (data: RegisterPayload) => api.post<UserOut>('/auth/register', data),
  logout:   ()                      => api.post('/auth/logout'),
  refresh:  (refresh_token: string) => api.post<TokenResponse>('/auth/refresh', { refresh_token }),
  me:       ()                      => api.get<UserOut>('/auth/me'),
  updateMe: (data: Partial<UserOut>) => api.patch<UserOut>('/auth/me', data),
  deleteMe: ()                      => api.delete('/auth/me'),
}
