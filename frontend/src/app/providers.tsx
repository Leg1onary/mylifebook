import { ReactNode, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { useTheme } from '@/hooks/useTheme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,      // 2 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/** Mounts global side-effects once at app root */
function GlobalEffects() {
  // Syncs navigator.onLine → appStore
  useOfflineStatus()
  // Applies saved theme to <html data-theme> and watches system preference
  useTheme()
  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalEffects />
      {children}
    </QueryClientProvider>
  )
}
