'use strict';

const Mongoose = require('mongoose');
const cardsPerRoundDefault = 1;

exports.index = {
    handler: function (request, reply) {

        return reply.view('index');
    }
};

exports.newGame = {
    handler: async function (request, reply) {

        const game = await Mongoose.model('Game')
            .create({});

        return reply.redirect(`/game/${game._id}`);
    }
};

exports.countDown = {
    handler: async function (request, reply) {

        const gameId = request.params.gameId;
        const timeRemaining = request.payload.timeRemaining;

        if (timeRemaining) {
            request.server.publish(`/game/${gameId}/start`, { timeRemaining });
        }

        if (request.headers.accept === 'application/json') {
            return null;
        }

        return reply.redirect(`/game/${gameId}`);
    }
};

exports.viewGame = {
    handler: async function (request, reply) {

        const game = await Mongoose.model('Game')
            .findOne({ _id: request.params.gameId })
            .populate({ path : 'buckets', populate : { path : 'cards' } });

        game.cardsPerRound = game.cardsPerRound || cardsPerRoundDefault;

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

        return reply.redirect(request.path);
    }
};

exports.createCard = {
    handler: function (request, reply) {

        const content = request.payload.content;
        const bucket = request.params.bucketId;
        const game = request.params.gameId;

        // if the card is empty, do nothing
        if (!content) {
            return reply.redirect(request.path);
        }

        Mongoose.model('Card')
            .create({
                game: request.params.gameId,
                bucket: request.params.bucketId,
                content
            });

        request.server.publish(`/game/${game}/bucket/${bucket}`, { bucket });

        // if the request was made with ajax, don't redirect
        if (request.isXHR) {
            return;
        }

        return reply.redirect(`/game/${request.params.gameId}`);
    }
};

exports.newRound = {
    handler: async function (request, reply) {

        const gameId = request.params.gameId;
        const game = await Mongoose.model('Game')
            .findOne({ _id: gameId });
        const cardsPerRound = game.cardsPerRound || cardsPerRoundDefault;

        request.server.eachSocket(async (socket) => {

            const buckets = await Mongoose.model('Bucket')
                .find({ game: gameId })
                .populate({ path: 'cards' });

            const payload = { buckets: [] };
            const promises = [];

            if (!buckets) {
                return;
            }


            buckets.forEach(async (bucket) => {
                
                let cards = bucket.cards.filter((c) => !c.played);
                let playedCards = bucket.cards.filter((c) => c.played);

                if (!bucket.cards.length) {
                    return;
                }

                bucket.cards = [];

                for (let i = 0; i < cardsPerRound; i++) {

                    // reshuffle used cards if there are no unused cards to pick
                    if (!cards.length) {
                        cards = playedCards;
                        const card = cards[Math.floor(Math.random()*cards.length)];
                        const update = Mongoose.model('Card')
                            .update({ $and: [{ bucket: bucket._id }, { _id: { $ne: card._id } }] }, { $unset: { played: true } }, { multi: true });

                        promises.push(update);
                        bucket.cards.push(card);
                        cards = cards.filter(item => !item._id.equals(card._id));
                        continue;
                    }

                    const card = cards[Math.floor(Math.random()*cards.length)];

                    // mark cards as played
                    const update = Mongoose.model('Card')
                        .update({ _id: card._id }, { played: true });

                    promises.push(update);
                    bucket.cards.push(card);
                    cards = cards.filter(item => !item._id.equals(card._id));
                }
    
                payload.buckets.push(bucket);
            });

            await Promise.all(promises);

            socket.publish(`/game/${gameId}/round`, payload);

        }, { subscription: `/game/${gameId}` });

        // if the request was made with ajax, don't redirect
        if (request.isXHR) {
            return;
        }

        return reply.redirect(`/game/${request.params.gameId}`);
    }
};

exports.setCardsPerRound = {
    handler: async function (request, reply) {

        const cardsPerRound = request.payload.cardsPerRound;
        const gameId = request.params.gameId;

        // if it's not a number, screw them!
        if (Number.isNaN(cardsPerRound)) {
            return;
        }

        await Mongoose.model('Game')
            .findOneAndUpdate({ _id: gameId }, { $set: { cardsPerRound } })

        request.server.publish(`/game/${gameId}/settings`, { cardsPerRound });

        // if the request was made with ajax, don't redirect
        if (request.isXHR) {
            return;
        }

        return reply.redirect(`/game/${request.params.gameId}`);
    }
};
