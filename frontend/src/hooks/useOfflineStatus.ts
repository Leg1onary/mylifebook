import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

/**
 * Syncs navigator.onLine events into the Zustand appStore.
 * Mount once at app level (in providers or App.tsx).
 * Anywhere else: just read `useAppStore(s => s.isOnline)`.
 */
export function useOfflineStatus() {
  const { isOnline, setOnline } = useAppStore()

  useEffect(() => {
    const handleOnline  = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  return isOnline
}
