import { db, unwrapInsertedId } from '../../db/knex'

export type UserRow = {
  id: number
  email: string
  name: string
  password_hash: string
  created_at: string
}

export const UserRepo = {
  async findByEmail(email: string) {
    return db<UserRow>('users').where({ email }).first()
  },

  async findById(id: number) {
    return db<UserRow>('users').where({ id }).first()
  },

  async create(data: { email: string; name: string; passwordHash: string }) {
    const ret = await db('users').insert({
      email: data.email,
      name: data.name,
      password_hash: data.passwordHash
    })
    return { id: unwrapInsertedId(ret) }
  },

  async insert(user: any) {
    const ret = await db('users').insert(user)
    return { ...user, id: unwrapInsertedId(ret) }
  }
}
