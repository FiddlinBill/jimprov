'use strict';

exports.index = {
    handler: function (request, reply) {

        return reply.view(`index`);
    }
};

