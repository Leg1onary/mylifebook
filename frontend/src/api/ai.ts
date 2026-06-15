import { api } from './client';

/** Full reframe result from POST /ai/reframe/{thought_record_id} */
export interface AIReframeResponse {
  reframe: string;
  cognitive_distortions: string[];
  old_law_spotted: string;
  alternative_thought: string;
  suggested_action: string;
  /** Present only when crisis phrases detected — AI call is skipped */
  crisis?: boolean;
  /** Human-readable crisis message with hotline info */
  message?: string;
}

/** Full weekly summary result from POST /ai/weekly-summary */
export interface AIWeeklySummaryResponse {
  summary: string;
  dominant_patterns: string[];
  progress_signs: string[];
  questions_for_next_week: string[];
}

export const aiApi = {
  /**
   * POST /ai/reframe/{thought_record_id}
   * Full reframe of a saved ThoughtRecord — persists to ai_reframe JSONB.
   */
  reframe: async (thoughtRecordId: number): Promise<AIReframeResponse> => {
    const { data } = await api.post(`/ai/reframe/${thoughtRecordId}`);
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

  /**
   * POST /ai/extract-profile
   * Extract structured PersonalContext from free-form text.
   */
  extractProfile: async (rawText: string) => {
    const { data } = await api.post('/ai/extract-profile', { raw_text: rawText });
    return data;
  },
};
