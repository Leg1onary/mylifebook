import { api } from './client'
import type { PersonalContext } from '@/types'

export const personalContextApi = {
  get: () =>
    api.get<PersonalContext>('/context'),

  update: (payload: Partial<PersonalContext>) =>
    api.patch<PersonalContext>('/context', payload),

  extractRaw: (rawText: string) =>
    api.post<void>('/context/raw', { raw_text: rawText }),
}
