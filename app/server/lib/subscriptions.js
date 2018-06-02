'use strict';

const Hoek = require('hoek');

exports.register = async function (server, options) {

    server.subscription('/game/{gameId}/bucket/{bucketId}');
    server.subscription('/game/{gameId}');
    server.subscription('/game/{gameId}/start');
    server.subscription('/game/{gameId}/round');
};

exports.name = 'subscriptions';
