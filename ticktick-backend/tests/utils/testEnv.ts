import path from 'path'

export const TEST_DB_FILE = path.resolve(process.cwd(), '.test.sqlite3')

export function applyTestEnv() {
  process.env.NODE_ENV = 'test'
  process.env.DB_CLIENT = 'sqlite3'
  process.env.SQLITE_FILE = TEST_DB_FILE
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test'
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3600'
  process.env.REFRESH_EXPIRES_DAYS = process.env.REFRESH_EXPIRES_DAYS || '7'
}
