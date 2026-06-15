import { useCallback, useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'mlb-theme'

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', resolved)
}

/**
 * Theme hook — reads from localStorage, applies to <html data-theme>.
 * Also exposes toast helpers from uiStore for convenience.
 */
export function useTheme() {
  const { toast, showToast, hideToast } = useUIStore()

  const getStoredTheme = useCallback((): Theme => {
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system'
  }, [])

  const setTheme = useCallback((theme: Theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(resolveTheme(theme))
  }, [])

  // Apply theme on mount
  useEffect(() => {
    const stored = getStoredTheme()
    applyTheme(resolveTheme(stored))

    if (stored === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = (e: MediaQueryListEvent) =>
        applyTheme(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
  }, [getStoredTheme])

  return {
    theme: getStoredTheme(),
    setTheme,
    toast,
    showToast,
    hideToast,
  }
}
