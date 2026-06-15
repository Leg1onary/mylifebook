export interface WeeklyReview {
  id: number
  week_start: string
  week_end: string
  checkins_count: number
  triggers_count: number
  tr_count: number
  experiments_count: number
  avg_mood: number | null
  avg_anxiety: number | null
  avg_shame: number | null
  avg_loneliness: number | null
  top_old_laws: { law: string; count: number }[]
  top_trigger_categories: { category: string; count: number }[]
  ai_summary: string | null
  guided_q1: string | null
  guided_q2: string | null
  guided_q3: string | null
  guided_q4: string | null
  guided_q5: string | null
  guided_q6: string | null
  conclusion: string | null
  next_week_focus: string | null
  created_at: string
  updated_at: string
}

export type WeeklyReviewUpdate = Partial<Pick<WeeklyReview,
  'guided_q1' | 'guided_q2' | 'guided_q3' | 'guided_q4' | 'guided_q5' | 'guided_q6' |
  'conclusion' | 'next_week_focus'
>>
