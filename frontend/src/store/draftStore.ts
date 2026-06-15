import { create } from 'zustand'
import type { ThoughtRecordCreate } from '@/types/thoughtRecord'

interface DraftState {
  thoughtDraft: ThoughtRecordCreate | null
  setThoughtDraft: (data: Partial<ThoughtRecordCreate>) => void
  clearThoughtDraft: () => void
}

export const useDraftStore = create<DraftState>((set, get) => ({
  thoughtDraft: null,
  setThoughtDraft: (data) => set({ thoughtDraft: { ...get().thoughtDraft, ...data } }),
  clearThoughtDraft: () => set({ thoughtDraft: null }),
}))
