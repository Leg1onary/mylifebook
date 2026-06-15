import { apiClient } from './client';
import type { Experiment, ExperimentCreate, ExperimentUpdate } from '@/types';

export const experimentsApi = {
  list: async (params?: { status?: string }): Promise<Experiment[]> => {
    const { data } = await apiClient.get('/experiments', { params });
    return data;
  },

  getById: async (id: number): Promise<Experiment> => {
    const { data } = await apiClient.get(`/experiments/${id}`);
    return data;
  },

  create: async (payload: ExperimentCreate): Promise<Experiment> => {
    const { data } = await apiClient.post('/experiments', payload);
    return data;
  },

  update: async (id: number, payload: ExperimentUpdate): Promise<Experiment> => {
    const { data } = await apiClient.patch(`/experiments/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/experiments/${id}`);
  },
};
