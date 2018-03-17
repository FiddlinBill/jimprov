'use strict';

const Hoek = require('hoek');

exports.register = async function (server, options) {

    server.subscription('/game/{gameId}/bucket/{bucketId}');
    server.subscription('/game/{gameId}');
};

exports.name = 'subscriptions';
