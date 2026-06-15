import { api } from './client'
import type { ThoughtRecord, ThoughtRecordCreate, ThoughtRecordUpdate } from '@/types/thoughtRecord'
import type { PaginatedResponse } from '@/types/common'

export const thoughtRecordsApi = {
  list: (params?: { from?: string; to?: string; status?: string; limit?: number }) =>
    api.get<PaginatedResponse<ThoughtRecord>>('/thoughts', { params }),

  get: (id: number) =>
    api.get<ThoughtRecord>(`/thoughts/${id}`),

  create: (data: ThoughtRecordCreate) =>
    api.post<ThoughtRecord>('/thoughts', data),

  update: (id: number, data: ThoughtRecordUpdate) =>
    api.patch<ThoughtRecord>(`/thoughts/${id}`, data),

  delete: (id: number) =>
    api.delete(`/thoughts/${id}`),
}
