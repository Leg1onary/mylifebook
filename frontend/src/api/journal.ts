import { api } from './client'
import type { JournalEntry, JournalEntryCreate, JournalEntryUpdate } from '@/types/journal'
import type { PaginatedResponse } from '@/types/common'

export const journalApi = {
  list: (params?: { since?: string; until?: string; page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<JournalEntry>>('/journal', { params }),

  get: (id: number) =>
    api.get<JournalEntry>(`/journal/${id}`),

  create: (data: JournalEntryCreate) =>
    api.post<JournalEntry>('/journal', data),

  update: (id: number, data: JournalEntryUpdate) =>
    api.patch<JournalEntry>(`/journal/${id}`, data),

  delete: (id: number) =>
    api.delete(`/journal/${id}`),
}
