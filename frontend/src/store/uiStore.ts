import { create } from 'zustand'

interface UIState {
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  hideToast: () => void
  sosOpen: boolean
  openSOS: () => void
  closeSOS: () => void
}

export const useUIStore = create<UIState>((set) => ({
  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },
  hideToast: () => set({ toast: null }),
  sosOpen: false,
  openSOS: () => set({ sosOpen: true }),
  closeSOS: () => set({ sosOpen: false }),
}))
