'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { describe, it, beforeEach } = exports.lab = Lab.script();
const { expect } = Code;
const Server = require('../../server');
const { getAdminAuthHeader, getUserAuthHeader } = require('../helpers/auth');

describe('User Routes', () => {

    let server;

    beforeEach(async () => {

        server = await Server.deployment();
    });

    describe('POST /user', () => {

        it('creates a new user', async () => {

            const response = await server.inject({
                method: 'post',
                url: '/user',
                payload: {
                    firstName: 'John',
                    lastName: 'Doe',
                    password: 'password123',
                    mail: 'john.doe@test.com',
                    username: 'johndoe'
                }
            });

            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(response.payload);
            expect(result).to.include(['firstName', 'lastName', 'mail', 'username']);
            expect(result.firstName).to.equal('John');
        });

        it('fails with invalid payload', async () => {

            const response = await server.inject({
                method: 'post',
                url: '/user',
                payload: {
                    firstName: 'Jo',  // too short
                    lastName: 'Doe',
                    password: 'pass',  // too short
                    mail: 'invalid-email',
                    username: 'jd'  // too short
                }
            });

            expect(response.statusCode).to.equal(400);
        });
    });

    describe('GET /users', () => {

        it('returns list of users for admin', async () => {

            const response = await server.inject({
                method: 'get',
                url: '/users',
                headers: getAdminAuthHeader()
            });

            expect(response.statusCode).to.equal(200);
            expect(JSON.parse(response.payload)).to.be.an.array();
        });

        it('returns list of users for regular user', async () => {

            const response = await server.inject({
                method: 'get',
                url: '/users',
                headers: getUserAuthHeader()
            });

            expect(response.statusCode).to.equal(200);
            expect(JSON.parse(response.payload)).to.be.an.array();
        });

        it('fails without authentication', async () => {

            const response = await server.inject({
                method: 'get',
                url: '/users'
            });

            expect(response.statusCode).to.equal(401);
        });
    });

    describe('DELETE /user/{id}', () => {

        let userId;

        beforeEach(async () => {
            // Create a test user
            const createResponse = await server.inject({
                method: 'post',
                url: '/user',
                payload: {
                    firstName: 'Delete',
                    lastName: 'Test',
                    password: 'password123',
                    mail: 'delete.test@test.com',
                    username: 'deletetest'
                }
            });
            userId = JSON.parse(createResponse.payload).id;
        });

        it('fails for non-admin users', async () => {

            const response = await server.inject({
                method: 'delete',
                url: `/user/${userId}`,
                headers: getUserAuthHeader()
            });

            expect(response.statusCode).to.equal(403);
        });
    });

    describe('PATCH /user/{id}', () => {

        let userId;

        beforeEach(async () => {
            // Create a test user
            const createResponse = await server.inject({
                method: 'post',
                url: '/user',
                payload: {
                    firstName: 'Update',
                    lastName: 'Test',
                    password: 'password123',
                    mail: 'update.test@test.com',
                    username: 'updatetest'
                }
            });
            userId = JSON.parse(createResponse.payload).id;
        });

        it('fails with invalid payload', async () => {

            const response = await server.inject({
                method: 'patch',
                url: `/user/${userId}`,
                headers: getAdminAuthHeader(),
                payload: {
                    firstName: 'Jo'  // too short
                }
            });

            expect(response.statusCode).to.equal(400);
        });
    });

    describe('POST /user/login', () => {

        beforeEach(async () => {
            // Create a test user
            await server.inject({
                method: 'post',
                url: '/user',
                payload: {
                    firstName: 'Login',
                    lastName: 'Test',
                    password: 'password123',
                    mail: 'login.test@test.com',
                    username: 'logintest'
                }
            });
        });

        it('returns token for valid credentials', async () => {

            const response = await server.inject({
                method: 'post',
                url: '/user/login',
                payload: {
                    mail: 'login.test@test.com',
                    password: 'password123'
                }
            });

            expect(response.statusCode).to.equal(200);
            const token = response.payload;
            expect(token).to.be.a.string();
            expect(token.split('.')).to.have.length(3);  // JWT format
        });

        it('fails with invalid credentials', async () => {

            const response = await server.inject({
                method: 'post',
                url: '/user/login',
                payload: {
                    mail: 'login.test@test.com',
                    password: 'wrongpassword'
                }
            });

            expect(response.statusCode).to.equal(401);
        });

        it('fails with invalid payload', async () => {

            const response = await server.inject({
                method: 'post',
                url: '/user/login',
                payload: {
                    mail: 'invalid-email',
                    password: 'pass'  // too short
                }
            });

            expect(response.statusCode).to.equal(400);
        });
    });
});
