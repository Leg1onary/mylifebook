import { api } from './client'
import type { DailyCheckin, DailyCheckinCreate, DailyCheckinUpdate } from '@/types/daily'
import type { PaginatedResponse } from '@/types/common'

export const dailyApi = {
  list: (params?: { from?: string; to?: string; limit?: number }) =>
    api.get<PaginatedResponse<DailyCheckin>>('/checkins', { params }),

  getByDate: (date: string) =>
    api.get<DailyCheckin>(`/checkins/date/${date}`),

  getById: (id: number) =>
    api.get<DailyCheckin>(`/checkins/${id}`),

  create: (data: DailyCheckinCreate) =>
    api.post<DailyCheckin>('/checkins', data),

  update: (id: number, data: DailyCheckinUpdate) =>
    api.patch<DailyCheckin>(`/checkins/${id}`, data),

  delete: (id: number) =>
    api.delete(`/checkins/${id}`),
}
