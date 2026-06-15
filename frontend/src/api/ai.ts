import { apiClient } from './client';

interface ReframeRequest {
  situation: string;
  automatic_thought: string;
  evidence_for?: string;
  evidence_against?: string;
}

interface ReframeResponse {
  alternative_thought: string;
  rationale?: string;
  socratic_questions?: string[];
}

export const aiApi = {
  reframe: async (payload: ReframeRequest): Promise<ReframeResponse> => {
    const { data } = await apiClient.post('/ai/reframe', payload);
    return data;
  },

  weeklyInsights: async (weeklyReviewId: number): Promise<{ summary: string }> => {
    const { data } = await apiClient.post('/ai/weekly-insights', { weekly_review_id: weeklyReviewId });
    return data;
  },
};
