'use strict';

const Mongoose = require('mongoose');

exports.register = async function (server, options) {

    const CardSchema = new Mongoose.Schema({
            content: String,
            played: Boolean,
            bucket: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: 'Bucket',
                required: true
            },
            game: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: 'Game',
                required: true
            }

        },
        {
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            }
        });

    Mongoose.model('Card', CardSchema);
}

exports.name = 'card-model';

