import { apiClient } from './client';

export const insightsApi = {
  moodTrend: async (days = 14) => {
    const { data } = await apiClient.get('/insights/mood-trend', { params: { days } });
    return data;
  },

  triggerCategories: async (days = 14) => {
    const { data } = await apiClient.get('/insights/trigger-categories', { params: { days } });
    return data;
  },

  distortions: async (days = 14) => {
    const { data } = await apiClient.get('/insights/distortions', { params: { days } });
    return data;
  },

  scriptStats: async (days = 14) => {
    const { data } = await apiClient.get('/insights/script-stats', { params: { days } });
    return data;
  },
};
