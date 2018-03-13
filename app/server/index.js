'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 8000,
    host: 'localhost'
});

const loadPlugins = async () => {

    await server.register([{
        plugin: require('vision'),
        options: {}
    }, {
        plugin: require('nes'),
        options: {}
    }]);
};

const start = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

start(loadPlugins);
