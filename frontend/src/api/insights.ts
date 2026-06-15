import { api } from './client'

export const insightsApi = {
  moodTrend:         (params?: { from?: string; to?: string }) => api.get('/insights/mood-trend', { params }),
  triggerCategories: (params?: { from?: string; to?: string }) => api.get('/insights/trigger-categories', { params }),
  distortions:       (params?: { from?: string; to?: string }) => api.get('/insights/distortions', { params }),
  scriptStats:       () => api.get('/insights/script-stats'),
}
