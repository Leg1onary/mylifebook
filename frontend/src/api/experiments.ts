import { api } from './client';
import type { Experiment, ExperimentCreate, ExperimentUpdate } from '@/types';

export const experimentsApi = {
  list: async (params?: { status?: string }): Promise<Experiment[]> => {
    const { data } = await api.get('/experiments', { params });
    return data?.items ?? data;
  },

  getById: async (id: number): Promise<{ data: Experiment }> => {
    const { data } = await api.get(`/experiments/${id}`);
    return { data };
  },

  create: async (payload: ExperimentCreate): Promise<Experiment> => {
    const { data } = await api.post('/experiments', payload);
    return data;
  },

  update: async (id: number, payload: ExperimentUpdate): Promise<Experiment> => {
    const { data } = await api.put(`/experiments/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/experiments/${id}`);
  },
};
