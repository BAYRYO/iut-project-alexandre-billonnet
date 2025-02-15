'use strict';

module.exports = {

    async up(knex) {

        await knex.schema.alterTable('user', (table) => {

            table.string('mail').notNull();
            table.string('username').notNull();
            table.string('password').notNull();
        });
    },

    async down(knex) {

        await knex.schema.alterTable('user', (table) => {

            table.dropColumn('mail');
            table.dropColumn('username');
            table.dropColumn('password');
        });
    }
};
