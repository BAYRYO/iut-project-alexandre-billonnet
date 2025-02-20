'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class Movie extends Model {

    static get tableName() {

        return 'movie';
    }

    static get relationMappings() {

        const User = require('./user');

        return {
            favorites: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'movie.id',
                    through: {
                        from: 'favorite.movie_id',
                        to: 'favorite.user_id'
                    },
                    to: 'user.id'
                }
            }
        };
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            title: Joi.string().min(1).required().example('Inception').description('Movie title'),
            description: Joi.string().min(10).required().example('A thief who steals corporate secrets...').description('Movie description'),
            releaseDate: Joi.date().required().example('2010-07-16').description('Movie release date'),
            director: Joi.string().min(3).required().example('Christopher Nolan').description('Movie director'),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert(queryContext) {

        this.createdAt = new Date();
        this.updatedAt = this.createdAt;
    }

    $beforeUpdate(opt, queryContext) {

        this.updatedAt = new Date();
    }
};
