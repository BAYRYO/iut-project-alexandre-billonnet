'use strict';

module.exports = {
    method: 'get',
    path: '/user',
    options: { },
    handler: (request, h) =>  {

        return { firstName: 'John', lastName: 'Doe' };
    }
};
