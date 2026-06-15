import { apiClient } from './client';
import type { PersonalContext } from '@/types';

export const personalContextApi = {
  get: async (): Promise<PersonalContext> => {
    const { data } = await apiClient.get('/context');
    return data;
  },

  update: async (payload: Partial<PersonalContext>): Promise<PersonalContext> => {
    const { data } = await apiClient.patch('/context', payload);
    return data;
  },

  extractRaw: async (rawText: string): Promise<void> => {
    await apiClient.post('/context/raw', { raw_text: rawText });
  },
};
