import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.integer('total_meals').defaultTo(0).notNullable()
    table.integer('on_diet_meals').defaultTo(0).notNullable()
    table.integer('out_diet_meals').defaultTo(0).notNullable()
    table.integer('highest_on_diet_sequence').defaultTo(0).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
