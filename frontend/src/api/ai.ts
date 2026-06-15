import { api } from './client'
import type { ReframeResponse } from '@/types/ai'

export const aiApi = {
  reframe: (thought_record_id: number) =>
    api.post<ReframeResponse>('/ai/reframe', { thought_record_id }),
}
