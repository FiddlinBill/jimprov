'use strict';

(function () {

    const client = new window.nes.Client('ws://0.0.0.0:8000');

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

        const updateSettings = (update, flags) => {

            const cardsPerRound = document.querySelector('.js-cards-per-round');

            console.log('blabble!!!');
            if (!cardsPerRound) {
                return;
            }

            cardsPerRound.value = update.cardsPerRound;
        };

        const showCards = (update, flags) => {

            const backdrop = document.getElementsByClassName('c-modal-backdrop')[0];
            const showCardsModal = document.getElementsByClassName('js-show-cards-modal')[0];

            showCardsModal.classList.add('is-visible');
            backdrop.classList.add('is-visible');

            showCardsModal.querySelector('.js-show-card-modal-content').innerHTML = Handlebars.partials.card(update);
        };

        const buckets = document.getElementsByClassName('js-bucket');
        const startGameButtons = document.querySelectorAll('.js-start-round');
        // get the game id from the url
        const url = window.location.href;
        const gameSubstring = url.match(/game\/[a-f\d]{24}$/i);
        const gameId = gameSubstring && gameSubstring[0].match(/[a-f\d]{24}$/i)[0];

        if (gameId) {
            // subscribe to game channel (bucket creation)
            client.subscribe(`/game/${gameId}`, createNewBucket);
            // subscribe to game countdown channel
            client.subscribe(`/game/${gameId}/start`, (update) => {

                if (startGameButtons.length) {
                    [].forEach.call(startGameButtons, function (button) {

                        button.querySelector('.c-action__text').innerHTML = update.timeRemaining;
                    });

                    return;
                }

                if (update.timeRemaining === 'Start Round') {
                    // reset timer
                    [].forEach.call(startGameButtons, function (button) {

                        button.classList.remove('is-counting-down');
                    });

                    document.querySelector('.js-time-remaining').value = '5';
                    return;
                }

                [].forEach.call(startGameButtons, function (button) {

                    button.classList.add('is-counting-down');
                });
            });
            client.subscribe(`/game/${gameId}/round`, showCards);
            client.subscribe(`/game/${gameId}/settings`, updateSettings);
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
