'use strict';

const Hapi = require('hapi');
const Path = require('path');
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
    path: './views'
};

const loadPlugins = async () => {

    return await server.register([
        {
            plugin: require('vision'),
            options: {}
        },
        {
            plugin: require('nes'),
            options: {}
        },
        {
            plugin: require('inert'),
            options: {}
        }
    ]);
}


loadPlugins().then(() => {

    server.views(internals.viewConfig);
    server.route(require('./routes.js'));
    server.start();
    console.log(`Server running at: ${server.info.uri}`);
})


process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});
