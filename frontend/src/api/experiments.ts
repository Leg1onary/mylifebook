import { api } from './client'
import type { Experiment, ExperimentCreate, ExperimentUpdate } from '@/types/experiment'
import type { PaginatedResponse } from '@/types/common'

export const experimentsApi = {
  list: (params?: { status?: string }) =>
    api.get<PaginatedResponse<Experiment>>('/experiments', { params }),

  get: (id: number) =>
    api.get<Experiment>(`/experiments/${id}`),

  create: (data: ExperimentCreate) =>
    api.post<Experiment>('/experiments', data),

  update: (id: number, data: ExperimentUpdate) =>
    api.patch<Experiment>(`/experiments/${id}`, data),

  delete: (id: number) =>
    api.delete(`/experiments/${id}`),
}
