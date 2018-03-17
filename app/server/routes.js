'use strict';

const Jimprov = require('./controllers/jimprov.js');
const internals = {};

internals.routes = [
    {
        method: 'GET',
        path: '/{param*}',
        handler: { directory: { path: './public' } } 
    },
    {
    	method: 'GET',
    	path: '/',
        config: Jimprov.index
    },
    {
        method: 'GET',
        path: '/favicon.ico',
        handler: (request, reply) => reply.redirect('/images/favicon.ico')
    },
    {
        method: 'GET',
        path: '/newgame',
        config: Jimprov.newGame
    },
    {
        method: 'GET',
        path: '/game/{gameId}',
        config: Jimprov.viewGame
    },
    {
        method: 'POST',
        path: '/game/{gameId}',
        config: Jimprov.createBucket
    }
];

module.exports = internals.routes;
