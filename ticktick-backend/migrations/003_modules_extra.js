exports.up = async function (knex) {
  const hasTags = await knex.schema.hasTable('tags')
  if (!hasTags) {
    await knex.schema.createTable('tags', (t) => {
      t.increments('id').primary()
      t.integer('user_id').notNullable()
      t.text('name').notNullable()
      t.text('color')
      t.dateTime('created_at').notNullable()
      t.dateTime('updated_at').notNullable()
      t.unique(['user_id', 'name'])
    })
  }

  const hasTaskTags = await knex.schema.hasTable('task_tags')
  if (!hasTaskTags) {
    await knex.schema.createTable('task_tags', (t) => {
      t.integer('task_id').notNullable()
      t.integer('tag_id').notNullable()
      t.primary(['task_id', 'tag_id'])
    })
  }

  const hasHabits = await knex.schema.hasTable('habits')
  if (!hasHabits) {
    await knex.schema.createTable('habits', (t) => {
      t.increments('id').primary()
      t.integer('user_id').notNullable().index()
      t.text('name').notNullable()
      t.text('schedule').notNullable()
      t.integer('target').notNullable().defaultTo(1)
      t.text('unit')
      t.dateTime('created_at').notNullable()
      t.dateTime('updated_at').notNullable()
    })
  }

  const hasHabitLogs = await knex.schema.hasTable('habit_logs')
  if (!hasHabitLogs) {
    await knex.schema.createTable('habit_logs', (t) => {
      t.increments('id').primary()
      t.integer('habit_id').notNullable().index()
      t.text('log_date').notNullable()
      t.integer('value').notNullable().defaultTo(1)
      t.dateTime('created_at').notNullable()
      t.unique(['habit_id', 'log_date'])
    })
  }

  const hasPomoSessions = await knex.schema.hasTable('pomodoro_sessions')
  if (!hasPomoSessions) {
    await knex.schema.createTable('pomodoro_sessions', (t) => {
      t.increments('id').primary()
      t.integer('user_id').notNullable().index()
      t.integer('task_id').nullable().index()
      t.integer('focus_seconds').notNullable()
      t.integer('break_seconds').notNullable().defaultTo(0)
      t.dateTime('started_at').notNullable()
      t.dateTime('ended_at').notNullable()
      t.dateTime('created_at').notNullable()
    })
  }

  const hasPomoSettings = await knex.schema.hasTable('pomodoro_settings')
  if (!hasPomoSettings) {
    await knex.schema.createTable('pomodoro_settings', (t) => {
      t.integer('user_id').primary()
      t.integer('focus_minutes').notNullable().defaultTo(25)
      t.integer('break_minutes').notNullable().defaultTo(5)
      t.integer('long_break_minutes').notNullable().defaultTo(15)
      t.integer('cycles_before_long_break').notNullable().defaultTo(4)
      t.dateTime('updated_at').notNullable()
    })
  }

  const hasSmartLists = await knex.schema.hasTable('smart_lists')
  if (!hasSmartLists) {
    await knex.schema.createTable('smart_lists', (t) => {
      t.increments('id').primary()
      t.integer('user_id').notNullable().index()
      t.text('name').notNullable()
      t.text('query_json').notNullable()
      t.text('sort_spec')
      t.dateTime('created_at').notNullable()
      t.dateTime('updated_at').notNullable()
    })
  }
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('smart_lists')
  await knex.schema.dropTableIfExists('pomodoro_settings')
  await knex.schema.dropTableIfExists('pomodoro_sessions')
  await knex.schema.dropTableIfExists('habit_logs')
  await knex.schema.dropTableIfExists('habits')
  await knex.schema.dropTableIfExists('task_tags')
  await knex.schema.dropTableIfExists('tags')
}
