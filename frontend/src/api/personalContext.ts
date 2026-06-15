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
   * POST /ai/extract-profile
   * Freeform text → AI extracts structured fields and merges into profile.
   * Field name must be raw_text to match Pydantic ExtractProfileRequest schema.
   */
  extract: (rawText: string) =>
    api.post<PersonalContext>('/ai/extract-profile', { raw_text: rawText }),
};
