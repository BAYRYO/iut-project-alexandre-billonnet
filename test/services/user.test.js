'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Boom = require('@hapi/boom');

const { describe, it, beforeEach } = exports.lab = Lab.script();
const { expect } = Code;
const Server = require('../../server');

describe('User Service', () => {

    let server;
    let userService;

    beforeEach(async () => {

        server = await Server.deployment();
        userService = server.services().userService;
    });

    describe('create()', () => {

        it('creates a new user and sends welcome email', async () => {

            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                password: 'password123',
                mail: 'john.doe@test.com',
                username: 'johndoe'
            };

            const result = await userService.create(userData);

            expect(result).to.be.an.object();
            expect(result.firstName).to.equal(userData.firstName);
            expect(result.lastName).to.equal(userData.lastName);
            expect(result.mail).to.equal(userData.mail);
            expect(result.username).to.equal(userData.username);
            expect(result.roles).to.be.an.array();
            expect(result.roles).to.include('user');
        });
    });

    describe('list()', () => {

        it('returns an array of users', async () => {

            const result = await userService.list();

            expect(result).to.be.an.array();
        });
    });

    describe('delete()', () => {

        it('deletes a user by id', async () => {
            // First create a user
            const userData = {
                firstName: 'Delete',
                lastName: 'Test',
                password: 'password123',
                mail: 'delete.test@test.com',
                username: 'deletetest'
            };
            const user = await userService.create(userData);

            // Then delete it
            const result = await userService.delete(user.id);
            expect(result).to.equal(1); // Objection.js returns number of deleted rows
        });
    });


    describe('login()', () => {

        it('returns JWT token for valid credentials', async () => {
            // First create a user
            const userData = {
                firstName: 'Login',
                lastName: 'Test',
                password: 'password123',
                mail: 'login.test@test.com',
                username: 'logintest'
            };
            await userService.create(userData);

            // Then try to login
            const credentials = {
                mail: userData.mail,
                password: userData.password
            };
            const token = await userService.login(credentials);

            expect(token).to.be.a.string();
            expect(token.split('.')).to.have.length(3); // JWT has 3 parts
        });

        it('throws unauthorized for invalid credentials', async () => {

            const credentials = {
                mail: 'nonexistent@test.com',
                password: 'wrongpassword'
            };

            try {
                await userService.login(credentials);
                expect.fail('Should throw unauthorized error');
            }
            catch (err) {
                expect(err).to.be.an.error(Boom.unauthorized('Invalid credentials').output.payload.message);
            }
        });
    });

    describe('isAdminEmail()', () => {

        it('returns false for non-admin user', async () => {
            // First create a regular user
            const userData = {
                firstName: 'Regular',
                lastName: 'Test',
                password: 'password123',
                mail: 'regular.test@test.com',
                username: 'regulartest'
            };
            await userService.create(userData);

            const result = await userService.isAdminEmail(userData.mail);
            expect(result).to.be.false();
        });

        it('returns false for non-existent email', async () => {

            const result = await userService.isAdminEmail('nonexistent@test.com');
            expect(result).to.be.false();
        });
    });
});
