import { api } from './client';

interface ReframeResponse {
  alternative_thought: string;
  rationale?: string;
  socratic_questions?: string[];
}

interface WeeklySummaryResponse {
  summary: string;
}

export const aiApi = {
  /**
   * Trigger AI reframe for an already-saved ThoughtRecord.
   * Endpoint: POST /ai/reframe/{thought_record_id}
   */
  reframe: async (thoughtRecordId: number): Promise<ReframeResponse> => {
    const { data } = await api.post(`/ai/reframe/${thoughtRecordId}`);
    return data;
  },

  /**
   * Generate AI weekly summary.
   * Endpoint: POST /ai/weekly-summary
   */
  weeklySummary: async (weeklyReviewId: number): Promise<WeeklySummaryResponse> => {
    const { data } = await api.post('/ai/weekly-summary', { weekly_review_id: weeklyReviewId });
    return data;
  },

  /**
   * Extract structured profile from raw personal context text.
   * Endpoint: POST /ai/extract-profile
   */
  extractProfile: async (rawText: string): Promise<{ extracted_json: Record<string, unknown> }> => {
    const { data } = await api.post('/ai/extract-profile', { raw_text: rawText });
    return data;
  },
};
