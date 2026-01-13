import { ApiError } from '../utils/errors'
import { TagRepo } from '../models/repositories/TagRepo'

export const TagService = {
  async list(userId: number) {
    return TagRepo.list(userId)
  },

  async create(userId: number, payload: { name: string; color?: string }) {
    const exist = await TagRepo.findByName(userId, payload.name)
    if (exist) throw new ApiError(409, 'VALIDATION_ERROR', 'TAG_EXISTS')
    return TagRepo.create(userId, payload)
  },

  async patch(userId: number, id: number, patch: any) {
    const n = await TagRepo.patch(userId, id, patch)
    if (!n) throw new ApiError(404, 'TAG_NOT_FOUND')
    return TagRepo.findById(userId, id)
  },

  async remove(userId: number, id: number) {
    const n = await TagRepo.remove(userId, id)
    if (!n) throw new ApiError(404, 'TAG_NOT_FOUND')
    return true
  }
}
