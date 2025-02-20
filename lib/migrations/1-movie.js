'use strict';

module.exports = {
    up: async (knex) => {

        await knex.schema.createTable('movie', (table) => {

            table.increments('id').primary();
            table.string('title').notNull();
            table.text('description').notNull();
            table.date('releaseDate').notNull();
            table.string('director').notNull();
            table.timestamp('createdAt').notNull().defaultTo(knex.fn.now());
            table.timestamp('updatedAt').notNull().defaultTo(knex.fn.now());
        });

        await knex.schema.createTable('favorite', (table) => {

            table.increments('id').primary();
            table.integer('userId').unsigned().notNull().references('id').inTable('user').onDelete('CASCADE');
            table.integer('movieId').unsigned().notNull().references('id').inTable('movie').onDelete('CASCADE');
            table.unique(['userId', 'movieId']);
            table.timestamp('createdAt').notNull().defaultTo(knex.fn.now());
        });
    },

    down: async (knex) => {

        await knex.schema.dropTableIfExists('favorite');
        await knex.schema.dropTableIfExists('movie');
    }
};
