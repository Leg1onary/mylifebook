import { api } from './client'
import type { TriggerEvent, TriggerEventCreate, TriggerEventUpdate } from '@/types/trigger'
import type { PaginatedResponse } from '@/types/common'

export const triggersApi = {
  list: (params?: { from?: string; to?: string; limit?: number; category?: string }) =>
    api.get<PaginatedResponse<TriggerEvent>>('/triggers', { params }),

  get: (id: number) =>
    api.get<TriggerEvent>(`/triggers/${id}`),

  create: (data: TriggerEventCreate) =>
    api.post<TriggerEvent>('/triggers', data),

  update: (id: number, data: TriggerEventUpdate) =>
    api.patch<TriggerEvent>(`/triggers/${id}`, data),

  delete: (id: number) =>
    api.delete(`/triggers/${id}`),
}
