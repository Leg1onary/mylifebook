export interface JournalEntry {
  id: number
  entry_date: string
  title: string | null
  body: string
  mood: number | null
  created_at: string
  updated_at: string
}

export type JournalEntryCreate = Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>
export type JournalEntryUpdate = Partial<JournalEntryCreate>
