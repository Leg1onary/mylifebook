import { api } from './client'
import type { UserSettings } from '@/types'

export const settingsApi = {
  get: () =>
    api.get<UserSettings>('/settings'),

  update: (payload: Partial<UserSettings>) =>
    api.patch<UserSettings>('/settings', payload),
}
