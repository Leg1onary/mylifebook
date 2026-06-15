import { api } from './client';
import type { PersonalContext, PersonalContextUpdate } from '@/types';

export const personalContextApi = {
  get: () =>
    api.get<PersonalContext>('/context'),

  update: (payload: PersonalContextUpdate) =>
    api.patch<PersonalContext>('/context', payload),

  /**
   * @deprecated Используй aiApi.extractProfile вместо этого.
   * Оставлен для backward-compat на случай если где-то ещё вызывается.
   */
  extractRaw: (rawText: string) =>
    api.post<void>('/context/raw', { raw_text: rawText }),
};
