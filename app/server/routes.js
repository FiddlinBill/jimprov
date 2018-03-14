'use strict';

const Jimprov = require('./controllers/jimprov.js');

console.log('sloobidoO!!!');
const internals = {};
internals.routes = [
    {
        method: 'GET',
        path: '/{param*}',
        handler: { directory: { path: './public' } } },
    {
    	method: 'GET',
    	path: '/',
        config: Jimprov.index

    },
    {
        method: 'GET',
        path: '/favicon.ico',
        handler: (request, reply) => reply.redirect('/images/favicon.ico')
    }
];

module.exports = internals.routes;
