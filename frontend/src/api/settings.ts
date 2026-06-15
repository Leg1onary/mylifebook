import { apiClient } from './client';
import type { UserSettings } from '@/types';

export const settingsApi = {
  get: async (): Promise<UserSettings> => {
    const { data } = await apiClient.get('/settings');
    return data;
  },

  update: async (payload: Partial<UserSettings>): Promise<UserSettings> => {
    const { data } = await apiClient.patch('/settings', payload);
    return data;
  },
};
