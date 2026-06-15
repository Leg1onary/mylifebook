import { api } from './client'
import type { TodaySnapshot } from '@/types/today'

export const todayApi = {
  get: () => api.get<TodaySnapshot>('/today'),
}
