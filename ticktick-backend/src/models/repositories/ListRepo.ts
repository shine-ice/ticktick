import { db, unwrapInsertedId } from '../../db/knex'

export const ListRepo = {
  async list(userId: number) {
    return db('lists').where({ user_id: userId }).orderBy('sort_order', 'asc').orderBy('id', 'asc')
  },

  async listByUser(userId: number) {
    return this.list(userId)
  },

  async findById(userId: number, id: number) {
    return db('lists').where({ user_id: userId, id }).first()
  },

  async create(userId: number, payload: { name: string; color?: string; sortOrder?: number }) {
    const now = new Date().toISOString()
    const ret = await db('lists').insert({
      user_id: userId,
      name: payload.name,
      color: payload.color || null,
      sort_order: payload.sortOrder ?? 0,
      is_archived: 0,
      created_at: now,
      updated_at: now
    })
    const id = unwrapInsertedId(ret)
    return db('lists').where({ id }).first()
  },

  async patch(userId: number, id: number, patch: any) {
    const now = new Date().toISOString()
    return db('lists').where({ id, user_id: userId }).update({ ...patch, updated_at: now })
  },

  async remove(userId: number, id: number) {
    return db('lists').where({ id, user_id: userId }).del()
  }
}
