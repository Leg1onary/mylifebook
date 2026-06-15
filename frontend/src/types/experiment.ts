export interface Experiment {
  id: number
  status: 'planned' | 'active' | 'complete'
  old_law: string
  fear_description: string
  action_plan: string
  forecast: string | null
  fear_before: number | null
  planned_date: string | null
  result: string | null
  what_worked: string | null
  what_didnt: string | null
  conclusion: string | null
  fear_after: number | null
  linked_thought_record_id: number | null
  created_at: string
  updated_at: string
}

export type ExperimentCreate = Omit<Experiment, 'id' | 'status' | 'created_at' | 'updated_at'>
export type ExperimentUpdate = Partial<Experiment>
