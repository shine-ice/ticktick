import { db, unwrapInsertedId } from '../../db/knex'

export const TagRepo = {
  async list(userId: number) {
    return db('tags').where({ user_id: userId }).orderBy('name', 'asc')
  },

  async listByUser(userId: number) {
    return this.list(userId)
  },

  async findById(userId: number, id: number) {
    return db('tags').where({ user_id: userId, id }).first()
  },

  async findByName(userId: number, name: string) {
    return db('tags').where({ user_id: userId, name }).first()
  },

  async create(userId: number, payload: { name: string; color?: string }) {
    const now = new Date().toISOString()
    const ret = await db('tags').insert({
      user_id: userId,
      name: payload.name,
      color: payload.color || null,
      created_at: now,
      updated_at: now
    })
    const id = unwrapInsertedId(ret)
    return db('tags').where({ id }).first()
  },

  async patch(userId: number, id: number, patch: any) {
    const now = new Date().toISOString()
    return db('tags').where({ user_id: userId, id }).update({ ...patch, updated_at: now })
  },

  async remove(userId: number, id: number) {
    await db('task_tags').where({ tag_id: id }).del()
    return db('tags').where({ user_id: userId, id }).del()
  }
}
