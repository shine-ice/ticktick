import { db, unwrapInsertedId } from '../../db/knex'

export const SmartListRepo = {
  async list(userId: number) {
    return db('smart_lists').where({ user_id: userId }).orderBy('id', 'desc')
  },

  async findById(userId: number, id: number) {
    return db('smart_lists').where({ user_id: userId, id }).first()
  },

  async create(userId: number, payload: { name: string; queryJson: any; sortSpec?: string }) {
    const now = new Date().toISOString()
    const ret = await db('smart_lists').insert({
      user_id: userId,
      name: payload.name,
      query_json: JSON.stringify(payload.queryJson),
      sort_spec: payload.sortSpec || null,
      created_at: now,
      updated_at: now
    })
    const id = unwrapInsertedId(ret)
    return db('smart_lists').where({ id }).first()
  },

  async patch(userId: number, id: number, patch: any) {
    const now = new Date().toISOString()
    const p: any = { ...patch, updated_at: now }
    if (patch.queryJson) {
      p.query_json = JSON.stringify(patch.queryJson)
      delete p.queryJson
    }
    return db('smart_lists').where({ user_id: userId, id }).update(p)
  },

  async remove(userId: number, id: number) {
    return db('smart_lists').where({ user_id: userId, id }).del()
  }
}
