import { api } from './client';
import type { PersonalContext, PersonalContextUpdate } from '@/types';

export const personalContextApi = {
  /** GET /personal-context */
  get: () =>
    api.get<PersonalContext>('/personal-context'),

  /** PUT /personal-context — partial update */
  update: (payload: PersonalContextUpdate) =>
    api.put<PersonalContext>('/personal-context', payload),

  /** POST /personal-context/extract */
  extract: (rawText: string, merge = false) =>
    api.post<PersonalContext>('/personal-context/extract', { raw_text: rawText, merge }),
};
