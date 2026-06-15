import { api } from './client'
import type { WeeklyReview, WeeklyReviewUpdate } from '@/types/weekly'
import type { PaginatedResponse } from '@/types/common'

export const weeklyApi = {
  current: () =>
    api.get<WeeklyReview>('/weekly/current'),

  list: (params?: { limit?: number }) =>
    api.get<PaginatedResponse<WeeklyReview>>('/weekly', { params }),

  get: (weekStart: string) =>
    api.get<WeeklyReview>(`/weekly/${weekStart}`),

  update: (weekStart: string, data: WeeklyReviewUpdate) =>
    api.patch<WeeklyReview>(`/weekly/${weekStart}`, data),

  generateInsights: (weekStart: string) =>
    api.post<WeeklyReview>('/ai/weekly-insights', { week_start: weekStart }),
}
