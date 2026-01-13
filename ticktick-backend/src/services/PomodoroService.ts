import { PomodoroRepo } from '../models/repositories/PomodoroRepo'

export const PomodoroService = {
  async createSession(userId: number, payload: any) {
    // TODO: validate start/end ordering and user/task ownership
    return PomodoroRepo.insertSession(userId, payload)
  },

  async stats(userId: number, startISO: string, endISO: string) {
    const sessions = await PomodoroRepo.listSessions(userId, startISO, endISO)
    const focusSeconds = sessions.reduce((s: number, r: any) => s + Number(r.focus_seconds || 0), 0)
    const breakSeconds = sessions.reduce((s: number, r: any) => s + Number(r.break_seconds || 0), 0)
    return { focusSeconds, breakSeconds, sessionsCount: sessions.length }
  },

  async getSettings(userId: number) {
    return (await PomodoroRepo.getSettings(userId)) || null
  },

  async updateSettings(userId: number, patch: any) {
    return PomodoroRepo.upsertSettings(userId, patch)
  }
}
