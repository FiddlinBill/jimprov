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

            const cardNumberElement = document.querySelector(`.js-cards-${update.bucket}`);
            const cardNumber = cardNumberElement && parseInt(cardNumberElement.innerHTML, 10) + 1;

            if (cardNumber) {
                cardNumberElement.innerHTML = cardNumber;
            }
        };

        const startRound = (update, flags) => {

            console.log('WIOOOOPWPWPWWPPWP');
            const backdrop = document.getElementsByClassName('c-modal-backdrop')[0];
            const showCardsModal = document.getElementsByClassName('js-show-cards-modal')[0];

            showCardsModal.classList.add('is-visible');
            backdrop.classList.add('is-visible');

            showCardsModal.querySelector('.js-show-card-modal-content').innerHTML = JSON.stringify(update);
        };

        const buckets = document.getElementsByClassName('js-bucket');
        const startGameButton = document.querySelector('.js-start-round');
        // get the game id from the url
        const url = window.location.href;
        const gameSubstring = url.match(/game\/[a-f\d]{24}$/i);
        const gameId = gameSubstring && gameSubstring[0].match(/[a-f\d]{24}$/i)[0];

        if (gameId) {
            // subscribe to game channel (bucket creation)
            client.subscribe(`/game/${gameId}`, createNewBucket);
            // subscribe to game countdown channel
            client.subscribe(`/game/${gameId}/start`, (update) => {

                if (startGameButton) {
                    startGameButton.querySelector('.c-action__text').innerHTML = update.timeRemaining;
                }

                if (update.timeRemaining === 'Start Round') {
                    // reset timer
                    document.querySelector('.js-start-round').classList.remove('is-counting-down');
                    document.querySelector('.js-time-remaining').value = '5';
                    return;
                }

                document.querySelector('.js-start-round').classList.add('is-counting-down');
            });
            client.subscribe(`/game/${gameId}/round`, startRound);
        }

        // subscribe to all previously existing bucket channels
        if (buckets && buckets.length) {
            [].forEach.call(buckets, function (bucket) {

                const action = bucket.getAttribute('action');

                if (action) {
                    client.subscribe(action, createNewCard);
                }
            });
        }
    };

    start();
})();
