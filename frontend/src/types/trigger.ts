export interface TriggerEvent {
  id: number
  user_id: number
  description: string
  category: string | null
  intensity: number | null
  old_script_activated: boolean
  grounding_used: boolean
  thought_record_id: number | null
  situation: string | null
  auto_thought: string | null
  emotion_tags: string[]
  emotion_intensity: number | null
  body_response: string | null
  impulse: string | null
  old_law: string | null
  linked_thought_record_id: number | null
  created_at: string
}

export type TriggerEventCreate = Omit<TriggerEvent, 'id' | 'user_id' | 'created_at'>
export type TriggerEventUpdate = Partial<TriggerEventCreate>
