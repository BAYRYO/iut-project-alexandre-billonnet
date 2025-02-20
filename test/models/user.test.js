'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Encrypt = require('@abillonnet3/iut-encrypt');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

const User = require('../../lib/models/user');

describe('User Model', () => {

    it('validates tableName', () => {

        expect(User.tableName).to.equal('user');
    });

    describe('joiSchema', () => {

        const schema = User.joiSchema;

        it('validates a valid user', () => {

            const user = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                password: 'password123',
                mail: 'john.doe@example.com',
                username: 'johndoe',
                roles: ['user'],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const { error } = schema.validate(user);
            expect(error).to.not.exist();
        });

        it('requires firstName with minimum length', () => {

            const user = {
                lastName: 'Doe',
                password: 'password123',
                mail: 'john.doe@example.com',
                username: 'johndoe'
            };

            const { error } = schema.validate(user);
            expect(error).to.exist();
            expect(error.details[0].message).to.equal('"firstName" is required');
        });

        it('requires valid email format', () => {

            const user = {
                firstName: 'John',
                lastName: 'Doe',
                password: 'password123',
                mail: 'invalid-email',
                username: 'johndoe'
            };

            const { error } = schema.validate(user);
            expect(error).to.exist();
            expect(error.details[0].message).to.contain('"mail" must be a valid email');
        });
    });

    describe('$beforeInsert', () => {

        it('sets default values and encrypts password', () => {

            const user = new User();
            user.password = 'password123';

            user.$beforeInsert();

            expect(user.createdAt).to.be.instanceOf(Date);
            expect(user.updatedAt).to.equal(user.createdAt);
            expect(user.password).to.equal(Encrypt.sha1('password123'));
            expect(user.roles).to.equal(['user']);
        });
    });

    describe('$beforeUpdate', () => {

        it('updates timestamp and encrypts password', () => {

            const user = new User();
            user.password = 'newpassword123';

            user.$beforeUpdate();

            expect(user.updatedAt).to.be.instanceOf(Date);
            expect(user.password).to.equal(Encrypt.sha1('newpassword123'));
        });
    });

    describe('jsonAttributes', () => {

        it('includes roles in json attributes', () => {

            expect(User.jsonAttributes).to.equal(['roles']);
        });
    });
});
