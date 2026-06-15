/**
 * TriggerEvent types — aligned with backend TriggerEventOut schema.
 * Fields match backend/app/schemas/trigger_event.py TriggerEventOut.
 */
export interface TriggerEvent {
  id: number;
  user_id: number;
  description: string;
  category: string | null;
  intensity: number | null;
  old_script_activated: boolean;
  grounding_used: boolean;
  thought_record_id: number | null;
  // Extended fields from TriggerEventOut
  situation: string | null;
  auto_thought: string | null;
  emotion_tags: string[];
  emotion_intensity: number | null;
  body_response: string | null;
  impulse: string | null;
  old_law: string | null;
  linked_thought_record_id: number | null;
  created_at: string;
}

export interface TriggerEventCreate {
  description: string;
  category?: string | null;
  intensity?: number | null;
  old_script_activated?: boolean;
  grounding_used?: boolean;
  thought_record_id?: number | null;
  situation?: string | null;
  auto_thought?: string | null;
  emotion_tags?: string[];
  emotion_intensity?: number | null;
  body_response?: string | null;
  impulse?: string | null;
  old_law?: string | null;
  linked_thought_record_id?: number | null;
}

export type TriggerEventUpdate = Partial<TriggerEventCreate>;
