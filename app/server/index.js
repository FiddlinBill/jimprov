'use strict';

const Hapi = require('hapi');
const Path = require('path');
const mongoose = require('mongoose');

const internals = {};
const server = Hapi.server({
    host: '0.0.0.0',
    port: 8000
});
const viewPath = Path.join(process.cwd(), 'app/server/views')

internals.viewConfig = {
    engines: { html: require('handlebars') },
    relativeTo: __dirname,
    layoutPath: './views/_layout',
    layout: 'default',
    partialsPath: ['./views/_partials'],
    path: './views'
};

const loadPlugins = async () => {

    return await server.register([
        require('vision'),
        require('nes'),
        require('inert'),
        require('./models/bucket.js'),
        require('./models/game.js'),
        require('./models/card.js'),
        require('./lib/subscriptions.js')
    ]);
}

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/jimprov');


loadPlugins().then(() => {

    server.views(internals.viewConfig);
    server.route(require('./routes.js'));
    server.start();
    console.log(`Server running at: ${server.info.uri}`);
})


process.on('unhandledRejection', (err) => {

    server.log(err);
    process.exit(1);
});
