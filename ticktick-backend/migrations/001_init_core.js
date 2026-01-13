exports.up = async function (knex) {
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary()
    t.text('email').notNullable().unique()
    t.text('name').notNullable()
    t.text('password_hash').notNullable()
    t.text('timezone').notNullable().defaultTo('UTC')
    t.dateTime('created_at').notNullable()
    t.dateTime('updated_at').notNullable()
  })

  await knex.schema.createTable('refresh_tokens', (t) => {
    t.increments('id').primary()
    t.integer('user_id').notNullable().index()
    t.text('device_id').notNullable()
    t.text('token_hash').notNullable()
    t.dateTime('expires_at').notNullable()
    t.dateTime('created_at').notNullable()
  })

  await knex.schema.createTable('lists', (t) => {
    t.increments('id').primary()
    t.integer('user_id').notNullable().index()
    t.text('name').notNullable()
    t.text('color')
    t.integer('sort_order').notNullable().defaultTo(0)
    t.integer('is_archived').notNullable().defaultTo(0)
    t.dateTime('created_at').notNullable()
    t.dateTime('updated_at').notNullable()
  })

  await knex.schema.createTable('tasks', (t) => {
    t.increments('id').primary()
    t.integer('user_id').notNullable().index()
    t.integer('list_id').notNullable().index()
    t.text('title').notNullable()
    t.text('note')
    t.dateTime('due_at').nullable().index()
    t.dateTime('start_at').nullable()
    t.dateTime('completed_at').nullable()
    t.integer('is_completed').notNullable().defaultTo(0)
    t.integer('priority').notNullable().defaultTo(0)
    t.dateTime('reminder_at').nullable()
    t.text('repeat_rule').nullable()
    t.integer('sort_order').notNullable().defaultTo(0)
    t.dateTime('created_at').notNullable()
    t.dateTime('updated_at').notNullable()
    t.dateTime('deleted_at').nullable()
  })

  await knex.schema.createTable('subtasks', (t) => {
    t.increments('id').primary()
    t.integer('task_id').notNullable().index()
    t.text('title').notNullable()
    t.integer('is_completed').notNullable().defaultTo(0)
    t.integer('sort_order').notNullable().defaultTo(0)
    t.dateTime('created_at').notNullable()
    t.dateTime('updated_at').notNullable()
  })

  await knex.schema.createTable('sync_changes', (t) => {
    t.increments('id').primary()
    t.integer('user_id').notNullable().index()
    t.text('entity_type').notNullable()
    t.integer('entity_id').notNullable()
    t.text('op').notNullable()
    t.dateTime('changed_at').notNullable()
    t.integer('version').notNullable().index()
    t.text('payload_json')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('sync_changes')
  await knex.schema.dropTableIfExists('subtasks')
  await knex.schema.dropTableIfExists('tasks')
  await knex.schema.dropTableIfExists('lists')
  await knex.schema.dropTableIfExists('refresh_tokens')
  await knex.schema.dropTableIfExists('users')
}
