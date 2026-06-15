// Auth
export interface User {
  id: number;
  email: string;
  display_name?: string;
  timezone: string;
  theme: string;
  ai_enabled: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Daily Check-in — matches POST /daily-checkins schema
export interface DailyCheckin {
  id: number;
  date: string;
  mood: number;
  energy: number;
  anxiety?: number;
  shame?: number;
  loneliness?: number;
  anger?: number;
  emotion_tags?: string[];
  note_main?: string;
  note_pain?: string;
  note_support?: string;
  note_need?: string;
  had_trigger: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyCheckinCreate {
  date: string;
  mood: number;
  energy: number;
  anxiety?: number;
  shame?: number;
  loneliness?: number;
  anger?: number;
  emotion_tags?: string[];
  note_main?: string;
  note_pain?: string;
  note_support?: string;
  note_need?: string;
  had_trigger?: boolean;
}

// Trigger Event — matches GET /triggers schema
export interface TriggerEvent {
  id: number;
  created_at: string;
  situation: string;
  auto_thought?: string;
  emotion_tags?: string[];
  emotion_intensity?: number;
  body_response?: string;
  impulse?: string;
  old_law?: string;
  category?: string;
  linked_thought_record_id?: number;
}

export interface TriggerEventCreate {
  situation: string;
  auto_thought?: string;
  emotion_tags?: string[];
  emotion_intensity?: number;
  body_response?: string;
  impulse?: string;
  old_law?: string;
  category?: string;
}

// AI Reframe JSONB — populated by POST /ai/reframe/{id}
export interface AIReframe {
  reframe: string;
  saved?: boolean;
  crisis?: boolean;
  detail?: string;
  resources?: {
    hotline?: string;
    text?: string;
  };
}

// Thought Record — matches GET /thought-records schema
export interface ThoughtRecord {
  id: number;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'complete';
  situation?: string;
  auto_thought?: string;
  meaning?: string;
  emotions?: Array<{ tag: string; intensity: number }>;
  body_response?: string;
  old_law?: string;
  evidence_for?: string;
  evidence_against?: string;
  distortions?: string[];
  new_perspective?: string;
  new_action?: string;
  ai_reframe?: AIReframe | null;
  followup_text?: string;
  followup_emotion_after?: Array<{ tag: string; intensity: number }>;
  linked_trigger_id?: number;
  // wizard-local fields (kept for draft saving compat)
  situation_text?: string;
  automatic_thought_text?: string;
  meaning_text?: string;
  fear_text?: string;
  old_law_text?: string;
  body_reaction_text?: string;
  action_taken_text?: string;
  evidence_for_text?: string;
  evidence_against_text?: string;
  ignored_facts_text?: string;
  balanced_thought_text?: string;
  new_action_text?: string;
  emotion_before_score?: number;
  emotion_after_score?: number;
  trigger_event_id?: number;
  is_draft?: boolean;
}

export interface ThoughtRecordCreate {
  status?: 'draft' | 'complete';
  situation?: string;
  auto_thought?: string;
  linked_trigger_id?: number;
  meaning?: string;
  body_response?: string;
  old_law?: string;
  evidence_for?: string;
  evidence_against?: string;
  distortions?: string[];
  new_perspective?: string;
  new_action?: string;
  emotions?: Array<{ tag: string; intensity: number }>;
}

// Experiment — matches GET /experiments schema
export interface Experiment {
  id: number;
  created_at: string;
  updated_at: string;
  status: 'planned' | 'active' | 'complete';
  old_law: string;
  fear_description: string;
  action_plan: string;
  forecast: string;
  fear_before: number;
  planned_date?: string;
  result?: string;
  what_worked?: string;
  what_didnt?: string;
  conclusion?: string;
  fear_after?: number;
  linked_thought_record_id?: number;
}

export interface ExperimentCreate {
  old_law: string;
  fear_description: string;
  action_plan: string;
  forecast: string;
  fear_before: number;
  planned_date?: string;
  linked_thought_record_id?: number;
}

export interface ExperimentUpdate {
  status?: 'planned' | 'active' | 'complete';
  result?: string;
  what_worked?: string;
  what_didnt?: string;
  conclusion?: string;
  fear_after?: number;
}

// Weekly Review — matches GET /weekly-reviews schema
export interface WeeklyReview {
  id: number;
  week_start: string;
  week_end: string;
  checkins_count?: number;
  triggers_count?: number;
  tr_count?: number;
  experiments_count?: number;
  avg_mood?: number;
  avg_anxiety?: number;
  avg_shame?: number;
  avg_loneliness?: number;
  top_old_laws?: Array<{ law: string; count: number }>;
  top_trigger_categories?: Array<{ category: string; count: number }>;
  ai_summary?: string;
  guided_q1?: string;
  guided_q2?: string;
  guided_q3?: string;
  guided_q4?: string;
  guided_q5?: string;
  guided_q6?: string;
  conclusion?: string;
  next_week_focus?: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReviewUpdate {
  week_start?: string;
  guided_q1?: string;
  guided_q2?: string;
  guided_q3?: string;
  guided_q4?: string;
  guided_q5?: string;
  guided_q6?: string;
  conclusion?: string;
  next_week_focus?: string;
}

// Journal
export interface JournalEntry {
  id: number;
  entry_date: string;
  title?: string;
  body: string;
  mood?: number;
  linked_trigger_id?: number;
  linked_thought_record_id?: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryCreate {
  title?: string;
  body: string;
  mood?: number;
  entry_date?: string;
  linked_trigger_id?: number;
  linked_thought_record_id?: number;
}

// Personal Context — matches backend PersonalContextOut schema exactly
export interface PersonalContext {
  id: number;
  user_id: number;
  old_core_belief?: string | null;
  new_core_belief?: string | null;
  personal_triggers?: string[] | null;
  strengths?: string[] | null;
  grounding_phrases?: string[] | null;
  therapy_goals?: string | null;
  important_relationships?: Array<{ name: string; role?: string; note?: string }> | null;
  ai_context_note?: string | null;
  updated_at: string;
}

export interface PersonalContextUpdate {
  old_core_belief?: string | null;
  new_core_belief?: string | null;
  personal_triggers?: string[] | null;
  strengths?: string[] | null;
  grounding_phrases?: string[] | null;
  therapy_goals?: string | null;
  important_relationships?: Array<{ name: string; role?: string; note?: string }> | null;
  ai_context_note?: string | null;
}

// Settings — matches GET /settings schema
export interface ReminderConfig {
  enabled: boolean;
  time?: string;
  weekday?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  ai_enabled: boolean;
  openrouter_model?: string;
  reminders: {
    morning: ReminderConfig;
    evening: ReminderConfig;
    weekly: ReminderConfig & { weekday?: string };
    experiment_followup: { enabled: boolean };
  };
}

export type UserSettingsUpdate = Partial<UserSettings>;

// Today snapshot — matches GET /today response
export interface TodaySnapshot {
  date: string;
  streak_days: number;
  checkin_done: boolean;
  checkin?: DailyCheckin;
  active_old_law?: string;
  current_week_focus?: string;
  active_experiments_count: number;
  unfinished_thought_records_count: number;
}

/** @deprecated Use TodaySnapshot */
export type TodayData = TodaySnapshot;
