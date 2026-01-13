import { Request, Response } from 'express'
import { z } from 'zod'
import { TaskService } from '../services/TaskService'

export const CalendarController = {
  async tasks(req: Request, res: Response) {
    const userId = req.auth!.userId
    const schema = z.object({ start: z.string().min(1), end: z.string().min(1) })
    const { start, end } = schema.parse({ start: req.query.start, end: req.query.end })
    const items = await TaskService.listByDateRange(userId, start, end)
    return res.json({ items })
  }
}
