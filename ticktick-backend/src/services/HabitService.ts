import { ApiError } from '../utils/errors'
import { HabitRepo } from '../models/repositories/HabitRepo'

function calcStreak(dates: string[], today: string) {
  const set = new Set(dates)
  let streak = 0
  let cursor = today
  while (set.has(cursor)) {
    streak += 1
    const d = new Date(`${cursor}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() - 1)
    cursor = d.toISOString().slice(0, 10)
  }
  return streak
}

export const HabitService = {
  async list(userId: number) {
    return HabitRepo.list(userId)
  },

  async create(userId: number, payload: any) {
    return HabitRepo.create(userId, payload)
  },

  async patch(userId: number, id: number, patch: any) {
    const n = await HabitRepo.patch(userId, id, patch)
    if (!n) throw new ApiError(404, 'HABIT_NOT_FOUND')
    return HabitRepo.findById(userId, id)
  },

  async remove(userId: number, id: number) {
    const n = await HabitRepo.remove(userId, id)
    if (!n) throw new ApiError(404, 'HABIT_NOT_FOUND')
    return true
  },

  async log(userId: number, habitId: number, date: string, value: number) {
    const habit = await HabitRepo.findById(userId, habitId)
    if (!habit) throw new ApiError(404, 'HABIT_NOT_FOUND')

    const log = await HabitRepo.upsertLog(habitId, date, value)

    const logs = await HabitRepo.listLogs(habitId, '1970-01-01', date)
    const dates = logs.filter((l: any) => Number(l.value) > 0).map((l: any) => l.log_date)
    const streak = calcStreak(dates, date)

    return { log, streak }
  }
}
