import { ApiError } from '../utils/errors'
import { ListRepo } from '../models/repositories/ListRepo'

export const ListService = {
  async list(userId: number) {
    return ListRepo.list(userId)
  },

  async create(userId: number, payload: { name: string; color?: string }) {
    return ListRepo.create(userId, payload)
  },

  async patch(userId: number, id: number, patch: any) {
    const updated = await ListRepo.patch(userId, id, patch)
    if (!updated) throw new ApiError(404, 'LIST_NOT_FOUND')
    return ListRepo.findById(userId, id)
  },

  async remove(userId: number, id: number) {
    const n = await ListRepo.remove(userId, id)
    if (!n) throw new ApiError(404, 'LIST_NOT_FOUND')
    return true
  }
}
