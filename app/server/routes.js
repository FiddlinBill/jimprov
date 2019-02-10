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
    },
    {
        method: 'GET',
        path: '/game/{gameId}/round',
        config: Jimprov.newRound
    },
    {
        method: 'GET',
        path: '/game/{gameId}/next-card',
        config: Jimprov.nextCard
    },
    {
        method: 'POST',
        path: '/game/{gameId}/countdown',
        config: Jimprov.countDown
    },
    {
        method: 'POST',
        path: '/game/{gameId}/settings',
        config: Jimprov.setCardsPerRound
    },
    {
        method: 'POST',
        path: '/game/{gameId}/bucket/{bucketId}',
        config: Jimprov.createCard
    }
];

module.exports = internals.routes;
