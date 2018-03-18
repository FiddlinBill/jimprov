'use strict';

const Mongoose = require('mongoose');

exports.register = async function (server, options) {

    const BucketSchema = new Mongoose.Schema({
            name: String,
            game: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: 'Game'
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

    BucketSchema.virtual('cards', {
        ref: 'Card',
        localField: '_id',
        foreignField: 'bucket'
    });

    BucketSchema.virtual('numberOfCards').get(function(){

        if (this.cards && this.cards.length) {
            return this.cards.length;
        }

        return 0;
    });

    Mongoose.model('Bucket', BucketSchema);
}

exports.name = 'bucket-model';

