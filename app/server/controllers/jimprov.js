'use strict';

const Mongoose = require('mongoose');

exports.index = {
    handler: function (request, reply) {

        return reply.view('index');
    }
};

exports.newGame = {
    handler: async function (request, reply) {

        const game = await Mongoose.model('Game')
            .create({});

        console.log(game);
        return reply.redirect(`/game/${game._id}`);
    }
};

exports.viewGame = {
    handler: async function (request, reply) {

        const game = await Mongoose.model('Game')
            .findOne({ _id: request.params.gameId })
            .populate('buckets');

        return reply.view('game', game);
    }
};

exports.createBucket = {
    handler: async function (request, reply) {

        const name = request.payload.name;

        // if they didn't give the bucket a name, do nothing
        if (!name) {
            return reply.redirect(request.path);
        }

        const bucket = await Mongoose.model('Bucket')
            .create({
                game: request.params.gameId,
                name
            });

        request.server.publish(`/game/${request.params.gameId}`, bucket);

        // if the request was made with ajax, don't redirect
        if (request.isXHR) {
            return;
        }

        console.log('BEEPP BOOOOPPP');
        return reply.redirect(request.path);
    }
};