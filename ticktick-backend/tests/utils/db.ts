import { db } from '../../src/db/knex'

export async function resetDb() {
  await db('task_tags').del()
  await db('habit_logs').del()
  await db('subtasks').del()
  await db('tasks').del()
  await db('lists').del()
  await db('tags').del()
  await db('habits').del()
  await db('pomodoro_sessions').del()
  await db('pomodoro_settings').del()
  await db('smart_lists').del()
  await db('refresh_tokens').del()
  await db('sync_changes').del()
  await db('sync_user_versions').del()
  await db('users').del()
}
