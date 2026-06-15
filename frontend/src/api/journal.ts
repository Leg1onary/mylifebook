import { apiClient } from './client';
import type { JournalEntry, JournalEntryCreate } from '@/types';

export const journalApi = {
  list: async (): Promise<JournalEntry[]> => {
    const { data } = await apiClient.get('/journal');
    return data;
  },

  getById: async (id: number): Promise<JournalEntry> => {
    const { data } = await apiClient.get(`/journal/${id}`);
    return data;
  },

  create: async (payload: JournalEntryCreate): Promise<JournalEntry> => {
    const { data } = await apiClient.post('/journal', payload);
    return data;
  },

  update: async (id: number, payload: Partial<JournalEntryCreate>): Promise<JournalEntry> => {
    const { data } = await apiClient.patch(`/journal/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/journal/${id}`);
  },
};
