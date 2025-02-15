'use strict';

const { Service } = require('@hapipal/schmervice');
const Encrypt = require('@abillonnet3/iut-encrypt');
const Boom = require('@hapi/boom');

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

        return { login: 'successful' };
    }
};
