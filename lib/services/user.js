'use strict';

const { Service } = require('@hapipal/schmervice');
const Encrypt = require('@abillonnet3/iut-encrypt');
const Boom = require('@hapi/boom');
const Jwt = require('@hapi/jwt');

module.exports = class UserService extends Service {

    create(user) {

        const { User } = this.server.models();

        return User.query().insertAndFetch(user);
    }

    list() {

        const { User } = this.server.models();

        return User.query();
    }

    delete(id) {

        const { User } = this.server.models();

        return User.query().deleteById(id);
    }

    update(id, user) {

        const { User } = this.server.models();

        return User.query().patchAndFetchById(id, user);
    }

    async login(credentials) {

        const { User } = this.server.models();

        const user = await User.query().findOne({ mail: credentials.mail });

        if (!user || Encrypt.compareSha1(credentials.password, user.password) === false) {
            throw Boom.unauthorized('Invalid credentials');
        }

        const token = Jwt.token.generate(
            {
                aud: 'urn:audience:iut',
                iss: 'urn:issuer:iut',
                firstName: user.firstName,
                lastName: user.lastName,
                mail: user.mail
            },
            {
                key: 'random_string',
                algorithm: 'HS512'
            },
            {
                ttlSec: 14400
            }
        );

        return token;
    }
};
