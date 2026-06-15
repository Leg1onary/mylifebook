export interface EmotionEntry {
  tag: string
  intensity: number
}

export interface ThoughtRecord {
  id: number
  status: 'draft' | 'complete'
  situation: string | null
  auto_thought: string | null
  meaning: string | null
  emotions: EmotionEntry[]
  body_response: string | null
  old_law: string | null
  evidence_for: string | null
  evidence_against: string | null
  distortions: string[]
  new_perspective: string | null
  new_action: string | null
  ai_reframe: string | null
  followup_text: string | null
  followup_emotion_after: EmotionEntry[]
  linked_trigger_id: number | null
  created_at: string
  updated_at: string
}

export type ThoughtRecordCreate = Partial<Omit<ThoughtRecord, 'id' | 'created_at' | 'updated_at'>>
export type ThoughtRecordUpdate = ThoughtRecordCreate
