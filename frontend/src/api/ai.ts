import { api } from './client';

export interface AIReframeResponse {
  reframe: string;
  saved: boolean;
  crisis?: boolean;
  detail?: string;
  resources?: {
    hotline?: string;
    text?: string;
  };
}

export interface AIWeeklySummaryResponse {
  summary: string;
  saved: boolean;
}

export const aiApi = {
  /**
   * POST /ai/reframe
   * Body: { thought_record_id: number }
   */
  reframe: async (thoughtRecordId: number): Promise<AIReframeResponse> => {
    const { data } = await api.post('/ai/reframe', { thought_record_id: thoughtRecordId });
    return data;
  },

  /**
   * POST /ai/weekly-summary
   * Body: { week_start: 'YYYY-MM-DD' }
   */
  weeklySummary: async (weekStart: string): Promise<AIWeeklySummaryResponse> => {
    const { data } = await api.post('/ai/weekly-summary', { week_start: weekStart });
    return data;
  },
};
