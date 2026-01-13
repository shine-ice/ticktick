import { Request, Response } from 'express'
import { z } from 'zod'
import { NaturalLanguageParser } from '../services/NaturalLanguageParser'

export const NlpController = {
  async parse(req: Request, res: Response) {
    const schema = z.object({ text: z.string().min(1), timezone: z.string().min(1) })
    const { text, timezone } = schema.parse(req.body)
    const draft = await NaturalLanguageParser.parse(text, timezone)
    return res.json({ draft })
  }
}
