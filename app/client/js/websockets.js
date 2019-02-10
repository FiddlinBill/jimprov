'use strict';

(function () {

    const client = new window.nes.Client((location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host);
    const url = window.location.href;
    const gameSubstring = url.match(/game\/[a-f\d]{24}$/i);
    const gameId = gameSubstring && gameSubstring[0].match(/[a-f\d]{24}$/i)[0];
    let countdown;
    // allows other clients to stop your timer
    let stopTimer = false;
    const countDownForm = document.querySelector('.js-game-countdown');
    const mainContainer = document.querySelector('.js-main');

    if (!countDownForm || !mainContainer) {
        return;
    }

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

            if (!cardsPerRound) {
                return;
            }

            cardsPerRound.value = update.cardsPerRound;
        };

        const showCards = (update, flags) => {

            const backdrop = document.getElementsByClassName('c-modal-backdrop')[0];
            const showCardsModal = document.getElementsByClassName('js-show-cards-modal')[0];

            document.body.classList.add('h-no-scrolling');
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
            client.subscribe(`/game/${gameId}/next-card`, showCards);
            // subscribe to game countdown channel
            client.subscribe(`/game/${gameId}/start`, (update) => {

                if (update.timeRemaining === 'Start Round') {
                    stopTimer = true;
                }
            });
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

    function sendForm (form, action) {

        const XHR = new XMLHttpRequest();

        // get the form data from the form element
        const FD = new FormData(form);

        // error handling
        XHR.addEventListener('error', function (event) {

            console.log(event);
        });

        XHR.open('POST', action);

        // let server know that this is an ajax request
        XHR.setRequestHeader('Accept', 'application/json');
        XHR.send(FD);
    }

    // starts and stops timer
    function timer (duration, form, action) {

        const timeRemainingInput = form.querySelector('.js-time-remaining');
        let timer = duration;
        timer = duration;

        // Stop timer. Still submit the form to reset other clients' timers
        if (timeRemainingInput.value === 'stop') {
            timeRemainingInput.value = 'Start Round';

            if (countdown) {
                clearInterval(countdown);
            }

            const startButtons = document.querySelectorAll('.js-start-round');

            [].forEach.call(startButtons, function (el) {

                el.classList.remove('is-counting-down');
            });

            sendForm(form, action);
            return;
        }

        countdown = setInterval(function () {

            timeRemainingInput.value = timer;

            if (timer === 0) {
                timeRemainingInput.value = 'Jimprov!';
            }

            if (timer < 0 || stopTimer) {

                const startButtons = document.querySelectorAll('.js-start-round');
                timeRemainingInput.value = 'Start Round';
                timer = duration;
                clearInterval(countdown);
                client.request(document.querySelector('.js-next-card') ? `/game/${gameId}/next-card` : `/game/${gameId}/round`);

                [].forEach.call(startButtons, function (el) {

                    el.classList.remove('is-counting-down');
                });
            }

            sendForm(form, action);
            timer--;
        }, 1000);
    };

    mainContainer.addEventListener('click', function (e) {

        let parent = e.target.closest('.js-next-card');

        // don't start timer if the presentor just wants a new card. Get the cards immediately
        if (e.target.classList.contains('js-next-card') || parent) {
            client.request(`/game/${gameId}/next-card`);
            return;
        }

        // if the click wasn't intended to start a buckets game, we are done here
        parent = e.target.closest('.js-start-round');
        if (!e.target.classList.contains('js-start-round') && !parent) {
            return;
        }

        e.preventDefault();
        const action = countDownForm.getAttribute('action');

        if (document.querySelectorAll('.is-counting-down').length) {
            document.querySelector('.js-time-remaining').value = 'stop';
            timer(5, countDownForm, action);
            return;
        }

        [].forEach.call(document.querySelectorAll('.js-start-round'), function (button) {

            button.classList.add('is-counting-down');
        });

        stopTimer = false;
        timer(5, countDownForm, action);
    });

    start();
})();
