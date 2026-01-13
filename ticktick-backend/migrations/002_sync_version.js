exports.up = async function (knex) {
  await knex.schema.createTable('sync_user_versions', (t) => {
    t.integer('user_id').primary()
    t.integer('last_version').notNullable().defaultTo(0)
    t.dateTime('updated_at').notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('sync_user_versions')
}
