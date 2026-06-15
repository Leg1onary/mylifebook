import { api } from './client';

export type InsightsPeriod = '7d' | '30d' | '90d';

export interface InsightPoint {
  date: string;
  value: number;
}

export interface TriggerCategoryPoint {
  category: string;
  count: number;
}

export interface OldLawFrequencyPoint {
  law: string;
  count: number;
}

export interface InsightsResponse {
  period: InsightsPeriod;
  from: string;
  to: string;
  mood_trend: InsightPoint[];
  anxiety_trend: InsightPoint[];
  shame_trend: InsightPoint[];
  loneliness_trend: InsightPoint[];
  trigger_categories: TriggerCategoryPoint[];
  old_laws_frequency: OldLawFrequencyPoint[];
  checkins_streak: number;
  checkins_total: number;
  triggers_total: number;
  tr_total: number;
  experiments_completed: number;
  experiments_active: number;
}

export const insightsApi = {
  /** GET /insights?period=7d|30d|90d */
  get: async (period: InsightsPeriod = '30d'): Promise<InsightsResponse> => {
    const { data } = await api.get('/insights', { params: { period } });
    return data;
  },
};
