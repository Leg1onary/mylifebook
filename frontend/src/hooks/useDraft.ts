import { useCallback } from 'react'
import { useDraftStore } from '@/store/draftStore'
import type { ThoughtRecordCreate } from '@/types/thoughtRecord'

/**
 * Convenience hook for the wizard draft state.
 * Components use this instead of importing draftStore directly.
 */
export function useDraft() {
  const { thoughtDraft, setThoughtDraft, clearThoughtDraft } = useDraftStore()

  const updateDraft = useCallback(
    (patch: Partial<ThoughtRecordCreate>) => setThoughtDraft(patch),
    [setThoughtDraft],
  )

  const resetDraft = useCallback(() => clearThoughtDraft(), [clearThoughtDraft])

  const hasDraft = thoughtDraft !== null

  return {
    draft: thoughtDraft,
    hasDraft,
    updateDraft,
    resetDraft,
  }
}
