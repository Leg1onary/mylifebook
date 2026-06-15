import { create } from 'zustand'

interface AppState {
  isOnline: boolean
  setOnline: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: navigator.onLine,
  setOnline: (v) => set({ isOnline: v }),
}))
