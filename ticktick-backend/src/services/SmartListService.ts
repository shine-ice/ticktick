import { ApiError } from '../utils/errors'
import { SmartListRepo } from '../models/repositories/SmartListRepo'
import { TaskService } from './TaskService'

export const SmartListService = {
  async list(userId: number) {
    return SmartListRepo.list(userId)
  },

  async create(userId: number, payload: any) {
    return SmartListRepo.create(userId, payload)
  },

  async patch(userId: number, id: number, patch: any) {
    const n = await SmartListRepo.patch(userId, id, patch)
    if (!n) throw new ApiError(404, 'SMARTLIST_NOT_FOUND')
    return SmartListRepo.findById(userId, id)
  },

  async remove(userId: number, id: number) {
    const n = await SmartListRepo.remove(userId, id)
    if (!n) throw new ApiError(404, 'SMARTLIST_NOT_FOUND')
    return true
  },

  async run(userId: number, id: number, opt: { cursor?: string | null; pageSize: number }) {
    const sl = await SmartListRepo.findById(userId, id)
    if (!sl) throw new ApiError(404, 'SMARTLIST_NOT_FOUND')
    const rule = JSON.parse(sl.query_json || '{}')
    const result = await TaskService.queryByRule(userId, rule, { pageSize: opt.pageSize, cursor: opt.cursor })
    return result
  }
}
