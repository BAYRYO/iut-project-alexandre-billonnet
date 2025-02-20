'use strict';

const Jwt = require('@hapi/jwt');

const generateToken = (user, scope = ['user']) => {

    const artifact = {
        decoded: {
            header: {
                alg: 'HS512',
                typ: 'JWT'
            },
            payload: {
                aud: 'urn:audience:iut',
                iss: 'urn:issuer:iut',
                id: user.id || 1,
                firstName: user.firstName || 'Test',
                lastName: user.lastName || 'User',
                mail: user.mail || 'test@example.com',
                scope,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 14400
            }
        }
    };

    const token = Jwt.token.generate(
        artifact.decoded.payload,
        {
            key: 'random_string',
            algorithm: 'HS512'
        }
    );

    return token;
};

const generateAdminToken = () => {

    return generateToken(
        {
            id: 999,
            firstName: 'Admin',
            lastName: 'User',
            mail: 'admin@example.com'
        },
        ['admin', 'user']
    );
};

const generateUserToken = () => {

    return generateToken(
        {
            id: 888,
            firstName: 'Regular',
            lastName: 'User',
            mail: 'user@example.com'
        },
        ['user']
    );
};

const getAuthHeader = (token) => {

    return { authorization: `Bearer ${token}` };
};

const getAdminAuthHeader = () => {

    return getAuthHeader(generateAdminToken());
};

const getUserAuthHeader = () => {

    return getAuthHeader(generateUserToken());
};

module.exports = {
    generateToken,
    generateAdminToken,
    generateUserToken,
    getAuthHeader,
    getAdminAuthHeader,
    getUserAuthHeader
};
