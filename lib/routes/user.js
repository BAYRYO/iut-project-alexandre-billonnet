'use strict';

const Joi = require('joi');

module.exports = [
    {
        method: 'post',
        path: '/user',
        options: {
            tags: ['api'],
            auth: false,
            validate: {
                payload: Joi.object({
                    firstName: Joi.string().required().min(3).example('John').description('Firstname of the user'),
                    lastName: Joi.string().required().min(3).example('Doe').description('Lastname of the user'),
                    password: Joi.string().required().min(8).example('password').description('Password of the user'),
                    mail: Joi.string().required().email().min(8).example('john.doe@example.com').description('Mail of the user'),
                    username: Joi.string().required().min(3).example('johndoe').description('Username of the user')
                })
            }
        },
        handler: async (request, h) =>  {

            const { userService } = request.services();

            return await userService.create(request.payload);
        }
    },

    {
        method: 'get',
        path: '/users',
        options: {
            tags: ['api']
        },
        handler: async (request, h) => {

            const { userService } = request.services();

            return await userService.list();
        }
    },

    {
        method: 'delete',
        path: '/user/{id}',
        options: {
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('User ID')
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();

            await userService.delete(request.params.id);

            return '';
        }
    },

    {
        method: 'patch',
        path: '/user/{id}',
        options: {
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('User ID')
                }),
                payload: Joi.object({
                    firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
                    lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
                    password: Joi.string().min(8).example('password').description('Password of the user'),
                    mail: Joi.string().email().min(8).example('john.doe@example.com').description('Mail of the user'),
                    username: Joi.string().min(3).example('johndoe').description('Username of the user')
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();

            return await userService.update(request.params.id, request.payload);
        }
    },

    {
        method: 'post',
        path: '/user/login',
        options: {
            tags: ['api'],
            auth: false,
            validate: {
                payload: Joi.object({
                    mail: Joi.string().required().email().min(8).example('john.doe@example.com').description('Mail of the user'),
                    password: Joi.string().required().min(8).example('password').description('Password of the user')
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();

            return await userService.login(request.payload);
        }
    }
];
