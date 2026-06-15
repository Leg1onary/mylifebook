import { api } from './client';
import type { WeeklyReview, WeeklyReviewUpdate } from '@/types';

export const weeklyApi = {
  getCurrent: async (): Promise<WeeklyReview> => {
    const { data } = await api.get('/weekly-reviews/current');
    return data;
  },

  getByWeekStart: async (weekStart: string): Promise<{ data: WeeklyReview }> => {
    const { data } = await api.get(`/weekly-reviews/${weekStart}`);
    return { data };
  },

  list: async (): Promise<WeeklyReview[]> => {
    const { data } = await api.get('/weekly-reviews');
    return data?.items ?? data;
  },

  update: async (weekStart: string, payload: WeeklyReviewUpdate): Promise<{ data: WeeklyReview }> => {
    const { data } = await api.post('/weekly-reviews', { week_start: weekStart, ...payload });
    return { data };
  },
};
