import path from 'path'
import { applyTestEnv } from './utils/testEnv'

export default async function globalSetup() {
  applyTestEnv()
  const { db } = await import('../src/db/knex')
  await db.migrate.latest({ directory: path.resolve(__dirname, '../migrations') })
}
