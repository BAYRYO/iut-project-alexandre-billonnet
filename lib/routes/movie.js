'use strict';

const Joi = require('joi');
const Boom = require('@hapi/boom');

module.exports = [
    {
        method: 'post',
        path: '/movie',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    title: Joi.string().required().min(1).example('Inception'),
                    description: Joi.string().required().min(10),
                    releaseDate: Joi.date().required(),
                    director: Joi.string().required().min(3)
                })
            }
        },
        handler: async (request, h) => {

            const { movieService } = request.services();
            return await movieService.create(request.payload);
        }
    },
    {
        method: 'get',
        path: '/movie/{id}',
        options: {
            auth: {
                scope: ['admin', 'user']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            }
        },
        handler: async (request, h) => {

            const { movieService } = request.services();
            const movie = await movieService.get(request.params.id);

            if (!movie) {
                throw Boom.notFound('Movie not found');
            }

            return movie;
        }
    },
    {
        method: 'get',
        path: '/movies',
        options: {
            auth: {
                scope: ['admin', 'user']
            },
            tags: ['api']
        },
        handler: async (request, h) => {

            const { movieService } = request.services();
            return await movieService.list();
        }
    },
    {
        method: 'patch',
        path: '/movie/{id}',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                }),
                payload: Joi.object({
                    title: Joi.string().min(1),
                    description: Joi.string().min(10),
                    releaseDate: Joi.date(),
                    director: Joi.string().min(3)
                })
            }
        },
        handler: async (request, h) => {

            const { movieService } = request.services();
            return await movieService.update(request.params.id, request.payload);
        }
    },
    {
        method: 'delete',
        path: '/movie/{id}',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            }
        },
        handler: async (request, h) => {

            const { movieService } = request.services();
            await movieService.delete(request.params.id);
            return '';
        }
    },
    {
        method: 'post',
        path: '/movies/favorites/{movieId}',
        options: {
            auth: {
                scope: ['user', 'admin']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    movieId: Joi.number().integer().required()
                })
            }
        },
        handler: async (request, h) => {

            try {
                const { movieService } = request.services();
                const userId = request.auth.credentials.id;

                if (!userId) {
                    throw Boom.unauthorized('User not authenticated properly');
                }

                // First check if movie exists
                const movie = await movieService.get(request.params.movieId);
                if (!movie) {
                    throw Boom.notFound('Movie not found');
                }

                const result = await movieService.addToFavorites(userId, request.params.movieId);
                return h.response(result).code(200);
            }
            catch (error) {
                request.log(['error', 'favorites'], error);
                if (error.isBoom) {
                    throw error;
                }

                throw Boom.internal('Failed to add favorite');
            }
        }
    },
    {
        method: 'delete',
        path: '/movies/favorites/{movieId}',
        options: {
            auth: {
                scope: ['user', 'admin']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    movieId: Joi.number().integer().required()
                })
            }
        },
        handler: async (request, h) => {

            try {
                const { movieService } = request.services();
                const userId = request.auth.credentials.id;

                if (!userId) {
                    throw Boom.unauthorized('User not authenticated properly');
                }

                const result = await movieService.removeFromFavorites(userId, request.params.movieId);
                return h.response(result).code(200);
            }
            catch (error) {
                request.log(['error', 'favorites'], error);
                if (error.isBoom) {
                    throw error;
                }

                throw Boom.internal('Failed to remove favorite');
            }
        }
    },
    {
        method: 'get',
        path: '/movies/favorites',
        options: {
            auth: {
                scope: ['user', 'admin']
            },
            tags: ['api']
        },
        handler: async (request, h) => {

            try {
                const { movieService } = request.services();
                const userId = request.auth.credentials.id;

                if (!userId) {
                    throw Boom.unauthorized('User not authenticated properly');
                }

                const favorites = await movieService.listFavorites(userId);
                return h.response(favorites).code(200);
            }
            catch (error) {
                request.log(['error', 'favorites'], error);
                if (error.isBoom) {
                    throw error;
                }

                throw Boom.internal('Failed to list favorites');
            }
        }
    },
    {
        method: 'post',
        path: '/movies/export',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            description: 'Export movies to CSV and send to authenticated admin email'
        },
        handler: async (request, h) => {

            const { movieService } = request.services();
            const adminEmail = request.auth.credentials.mail;

            try {
                await movieService.exportMoviesToCsv(adminEmail);
                return { message: 'Export started. You will receive an email shortly.' };
            }
            catch (error) {
                request.log(['error', 'export'], error);
                throw error;
            }
        }
    }
];
