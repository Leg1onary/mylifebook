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

// Daily Check-in
export interface DailyCheckin {
  id: number;
  user_id: number;
  date: string;
  mood_score: number;
  energy_score: number;
  anxiety_score?: number;
  shame_score?: number;
  loneliness_score?: number;
  anger_score?: number;
  summary_text?: string;
  pain_text?: string;
  support_text?: string;
  need_text?: string;
  trigger_happened: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyCheckinCreate {
  date: string;
  mood_score: number;
  energy_score: number;
  anxiety_score?: number;
  shame_score?: number;
  loneliness_score?: number;
  anger_score?: number;
  summary_text?: string;
  pain_text?: string;
  support_text?: string;
  need_text?: string;
  trigger_happened?: boolean;
}

// Trigger Event
export interface TriggerEvent {
  id: number;
  user_id: number;
  happened_at: string;
  situation_text: string;
  first_thought_text?: string;
  body_reaction_text?: string;
  action_urge_text?: string;
  old_law_text?: string;
  intensity_score?: number;
  category_id?: number;
  linked_thought_record_id?: number;
  created_at: string;
  updated_at: string;
}

export interface TriggerCreate {
  situation_text: string;
  first_thought_text?: string;
  body_reaction_text?: string;
  action_urge_text?: string;
  old_law_text?: string;
  intensity_score?: number;
  happened_at?: string;
}

// Thought Record
export interface ThoughtRecord {
  id: number;
  user_id: number;
  trigger_event_id?: number;
  happened_at?: string;
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
  follow_up_text?: string;
  emotion_before_score?: number;
  emotion_after_score?: number;
  distortions?: string[];
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThoughtRecordCreate {
  trigger_event_id?: number;
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
  distortions?: string[];
  is_draft?: boolean;
}

// Experiment
export interface Experiment {
  id: number;
  user_id: number;
  thought_record_id?: number;
  old_law_text: string;
  fear_text: string;
  experiment_action_text: string;
  prediction_text: string;
  fear_before_score: number;
  scheduled_for?: string;
  completed_at?: string;
  actual_result_text?: string;
  came_true_text?: string;
  did_not_come_true_text?: string;
  learning_text?: string;
  fear_after_score?: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ExperimentCreate {
  old_law_text: string;
  fear_text: string;
  experiment_action_text: string;
  prediction_text: string;
  fear_before_score: number;
  scheduled_for?: string;
  thought_record_id?: number;
}

export interface ExperimentUpdate {
  actual_result_text?: string;
  came_true_text?: string;
  did_not_come_true_text?: string;
  learning_text?: string;
  fear_after_score?: number;
  status?: string;
}

// Weekly Review
export interface WeeklyReview {
  id: number;
  user_id: number;
  week_start: string;
  week_end: string;
  summary_text?: string;
  pattern_text?: string;
  learning_text?: string;
  next_focus_text?: string;
  ai_summary_text?: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReviewUpdate {
  summary_text?: string;
  pattern_text?: string;
  learning_text?: string;
  next_focus_text?: string;
}

// Journal
export interface JournalEntry {
  id: number;
  user_id: number;
  entry_date: string;
  title?: string;
  body: string;
  mood?: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryCreate {
  title?: string;
  body: string;
  mood?: number;
  entry_date?: string;
}

// Personal Context
export interface PersonalContext {
  id: number;
  user_id: number;
  core_beliefs?: string[];
  grounding_phrases?: string[];
  important_relationships?: { name: string; role: string }[];
  triggers_summary?: string;
  therapy_goals?: string;
  created_at: string;
  updated_at: string;
}

// Settings
export interface UserSettings {
  timezone: string;
  theme: string;
  ai_enabled: boolean;
  reminder_morning_enabled: boolean;
  reminder_evening_enabled: boolean;
  reminder_morning_time: string;
  reminder_evening_time: string;
  push_token?: string;
}

// Today
export interface TodayData {
  date: string;
  streak: number;
  checkin?: DailyCheckin;
  recent_triggers: TriggerEvent[];
  recent_thoughts: ThoughtRecord[];
  weekly_review?: WeeklyReview;
}
