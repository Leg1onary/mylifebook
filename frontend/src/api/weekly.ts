import { apiClient } from './client';
import type { WeeklyReview, WeeklyReviewUpdate } from '@/types';

export const weeklyApi = {
  getCurrent: async (): Promise<WeeklyReview> => {
    const { data } = await apiClient.get('/weekly/current');
    return data;
  },

  getByWeekStart: async (weekStart: string): Promise<WeeklyReview> => {
    const { data } = await apiClient.get(`/weekly/${weekStart}`);
    return data;
  },

  list: async (): Promise<WeeklyReview[]> => {
    const { data } = await apiClient.get('/weekly');
    return data;
  },

  update: async (weekStart: string, payload: WeeklyReviewUpdate): Promise<WeeklyReview> => {
    const { data } = await apiClient.patch(`/weekly/${weekStart}`, payload);
    return data;
  },
};
