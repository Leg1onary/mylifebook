import type { DailyCheckin } from './daily'

export interface TodaySnapshot {
  date: string
  checkin: DailyCheckin | null
  checkin_done: boolean
  active_experiments_count: number
  unfinished_thought_records_count: number
  current_week_focus: string | null
  active_old_law: string | null
  streak_days: number
}
