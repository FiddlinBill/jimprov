'use strict';

(function () {

    const client = new window.nes.Client('ws://localhost:8000');

    const start = async () => {

        await client.connect();
        const createNewBucket = (update, flags) => {

            console.log(update);
            //Handlebars.partials.bucket({  })
        };

        const createNewCard = (update, flags) => {

            console.log(update);
            // update -> { id: 5, status: 'complete' }
            // Second publish is not received (doesn't match)
        };

        // get the game and bucket ids from the url
        const url = window.location.href;
        const gameSubstring = url.match(/game\/[a-f\d]{24}$/i);
        const gameId = gameSubstring && gameSubstring[0].match(/[a-f\d]{24}$/i)[0];
        const bucketSubstring = url.match(/bucket\/[a-f\d]{24}$/i);
        const bucketId = bucketSubstring && bucketSubstring[0].match(/[a-f\d]{24}$/i)[0];

        if (gameId) {
            console.log(`/game/${gameId}`);
            client.subscribe(`/game/${gameId}`, createNewBucket);
        }

        if (gameId && bucketId) {
            console.log(`/game/${gameId}/${bucketId}`);
            client.subscribe(`/game/${gameId}/${bucketId}`, createNewCard);
        }
    };

    start();
})();
