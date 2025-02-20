'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');
const Encrypt = require('@abillonnet3/iut-encrypt');

module.exports = class User extends Model {

    static get tableName() {

        return 'user';
    }

    static get relationMappings() {

        const Movie = require('./movie');

        return {
            favoriteMovies: {
                relation: Model.ManyToManyRelation,
                modelClass: Movie,
                join: {
                    from: 'user.id',
                    through: {
                        from: 'favorite.userId',
                        to: 'favorite.movieId'
                    },
                    to: 'movie.id'
                }
            }
        };
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            firstName: Joi.string().min(3).required().example('John').description('Firstname of the user'),
            lastName: Joi.string().min(3).required().example('Doe').description('Lastname of the user'),
            password: Joi.string().min(8).required().example('password').description('Password of the user'),
            mail: Joi.string().email().min(8).required().example('john.doe@example.com').description('Mail of the user'),
            username: Joi.string().min(3).required().example('johndoe').description('Username of the user'),
            roles: Joi.array().items(Joi.string()).default(['user']),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert(queryContext) {

        this.createdAt = new Date();
        this.updatedAt = this.createdAt;
        this.password = Encrypt.sha1(this.password);
        this.roles = ['user'];
    }

    $beforeUpdate(opt, queryContext) {

        this.updatedAt = new Date();
        this.password = Encrypt.sha1(this.password);
    }

    static get jsonAttributes() {

        return ['roles'];
    }
};
