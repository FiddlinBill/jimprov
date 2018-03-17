'use strict';

const Mongoose = require('mongoose');

exports.register = async function (server, options) {

    const CardSchema = new Mongoose.Schema({
            content: String,
            bucket: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: 'Bucket'
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

