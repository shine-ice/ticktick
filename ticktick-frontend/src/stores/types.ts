export type Task = {
  id: number
  title: string
  list_id?: number
  note?: string
  due_at?: string | null
  start_at?: string | null
  priority?: number
  reminder_at?: string | null
  repeat_rule?: string | null
  is_completed?: number
  updated_at?: string
  subtasks?: any[]
  tagIds?: number[]
}

export type List = {
  id: number
  name: string
  color?: string | null
  sort_order?: number
  is_archived?: number
}

export type Tag = {
  id: number
  name: string
  color?: string | null
}

export type Habit = {
  id: number
  name: string
  schedule: string
  target?: number
  unit?: string | null
}

export type PomodoroSettings = {
  focus_minutes?: number
  break_minutes?: number
  long_break_minutes?: number
  cycles_before_long_break?: number
}

export type SmartList = {
  id: number
  name: string
  query_json?: string
  sort_spec?: string | null
}
