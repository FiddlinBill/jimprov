'use strict';

(function () {

    const client = new window.nes.Client('ws://localhost:8000');

    const start = async () => {

        await client.connect();
        const createNewBucket = (update, flags) => {

            // bucketList <--- hahahahaha
            const bucketList = document.querySelector('.js-bucket-list');
            if (!bucketList) {
                return;
            }

            // Add new bucket! Turn html string into html! Ahhhgg!
            const temp = document.createElement('div');
            temp.innerHTML = Handlebars.partials.bucket(update);
            const bucket = temp.firstChild;
            bucketList.appendChild(bucket);

            // subscribe to newly created bucket channel
            client.subscribe(`/game/${update.game}/bucket/${update._id}`, createNewCard);
        };

        const createNewCard = (update, flags) => {

            console.log(update);
            const cardNumberElement = document.querySelector(`.js-cards-${update.bucket}`);
            const cardNumber = cardNumberElement && parseInt(cardNumberElement.innerHTML, 10) + 1;

            if (cardNumber) {
                cardNumberElement.innerHTML = cardNumber;
            }
        };

        const buckets = document.getElementsByClassName('js-bucket');
        // get the game id from the url
        const url = window.location.href;
        const gameSubstring = url.match(/game\/[a-f\d]{24}$/i);
        const gameId = gameSubstring && gameSubstring[0].match(/[a-f\d]{24}$/i)[0];

        // subscribe to game channel (bucket creation)
        if (gameId) {
            console.log(`/game/${gameId}`);
            client.subscribe(`/game/${gameId}`, createNewBucket);
        }

        // subscribe to all previously existing bucket channels
        if (buckets && buckets.length) {
            [].forEach.call(buckets, function (bucket) {

                const action = bucket.getAttribute('action');

                console.log(action);
                if (action) {
                    client.subscribe(action, createNewCard);
                }
            });
        }
    };

    start();
})();
