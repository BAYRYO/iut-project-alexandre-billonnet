'use strict';

module.exports = {

    up: async (knex) => {

        await knex.schema.createTable('user', (table) => {

            table.increments('id').primary();
            table.string('firstName').notNull();
            table.string('lastName').notNull();

            table.timestamp('createdAt').notNull().defaultTo(knex.fn.now());
            table.timestamp('updatedAt').notNull().defaultTo(knex.fn.now());
        });
    },

    down: async (knex) => {

        await knex.schema.dropTableIfExists('user');
    }
};
