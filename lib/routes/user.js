'use strict';

module.exports = {
    method: 'get',
    path: '/user',
    options: {
        tags: ['api']
    },
    handler: (request, h) =>  {

        return { firstName: 'John', lastName: 'Doe' };
    }
};
