export interface DailyCheckin {
  id: number
  entry_date: string
  mood: number | null
  energy: number | null
  anxiety: number | null
  shame: number | null
  loneliness: number | null
  anger: number | null
  emotion_tags: string[]
  note_main: string | null
  note_pain: string | null
  note_support: string | null
  note_need: string | null
  had_trigger: boolean
  created_at: string
  updated_at: string
}

export type DailyCheckinCreate = Omit<DailyCheckin, 'id' | 'created_at' | 'updated_at'>
export type DailyCheckinUpdate = Partial<DailyCheckinCreate>
