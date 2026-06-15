import { api } from './client';
import type { PersonalContext, PersonalContextUpdate } from '@/types';

export const personalContextApi = {
  /** GET /personal-context */
  get: () =>
    api.get<PersonalContext>('/personal-context'),

  /** PATCH /personal-context — partial update */
  update: (payload: PersonalContextUpdate) =>
    api.patch<PersonalContext>('/personal-context', payload),

  /**
   * POST /personal-context/raw
   * Freeform text → AI extracts structured fields and merges into profile
   */
  extract: (text: string) =>
    api.post<PersonalContext>('/personal-context/raw', { text }),
};
