'use strict';

const Mongoose = require('mongoose');

exports.register = async function (server, options) {

    const GameSchema = new Mongoose.Schema({ },
        {
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            }
        });

    GameSchema.virtual('buckets', {
        ref: 'Bucket',
        localField: '_id',
        foreignField: 'game'
    });

    Mongoose.model('Game', GameSchema);
}

exports.name = 'game-model';

