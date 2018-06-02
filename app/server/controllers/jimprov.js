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

        console.log('IT GETS INT EH HANDALELRLERLERLELRELRLE');
        const getCards = async (bucketId, cardsPerRound) => {

            const cards = [];

            for (let i = 0; i < cardsPerRound; i++) {

                let card = await Mongoose.model('Card')
                    .aggregate()
                    .match({ bucket: bucketId, played: { $ne: true } })
                    .sample(cardsPerRound || 1);

                if (!Array.isArray(card) || card.length !== 1) {
                    return;
                }

                card = card[0];
                await Mongoose.model('Card')
                    .update({ _id: card._id }, { played: true })

                cards.push(card);
            }

            return cards;
        };

        const gameId = request.params.gameId;
        const game = await Mongoose.model('Game')
            .findOne({ _id: gameId });
        const cardsPerRound = game.cardsPerRound || 1;

        request.server.eachSocket(async (socket) => {

            console.log('sendig cardds to client!!!!!');
            const buckets = await Mongoose.model('Bucket')
                .find({ game: gameId })
                .populate('cards');

            let cards = [];

            if (!buckets) {
                return;
            }

            buckets.forEach( async (bucket) => {

                const stuff = getCards(bucket._id, cardsPerRound);

                cards.push(stuff);
            });


            cards = await Promise.all(cards);
            cards = [].concat.apply([], cards);
            socket.publish(`/game/${gameId}/round`, { cards });

        }, { subscription: `/game/${gameId}` });

        // if the request was made with ajax, don't redirect
        if (request.isXHR) {
            return;
        }

        return reply.redirect(`/game/${request.params.gameId}`);
    }
};

exports.setCardsPerRound = {
    handler: function (request, reply) {

        const cardsPerRound = request.payload.cards;
        const gameId = request.params.gameId;

        // if it's not a number, screw them!
        if (Number.isNaN(cardsPerRound)) {
            return;
        }

        Mongoose.model('Game')
            .findOneAndUpdate({ _id: gameId }, { $set: { cardsPerRound } })

        request.server.publish(`/game/${game}/settings/cards`, { cardsPerRound });

        // if the request was made with ajax, don't redirect
        if (request.isXHR) {
            return;
        }

        return reply.redirect(`/game/${request.params.gameId}`);
    }
};
