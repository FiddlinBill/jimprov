'use strict';
// prevent forms from submitting, use ajax instead

(function () {

    const url = window.location.href;
    const gameSubstring = url.match(/game\/[a-f\d]{24}$/i);
    const gameId = gameSubstring && gameSubstring[0].match(/[a-f\d]{24}$/i)[0];
    let countdown;
    // allows other clients to stop your timer
    let stopTimer = false;

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
            console.log('wtf!!');
            timeRemainingInput.value = 'Start Round';

            if (countdown) {
                clearInterval(countdown);
            }

            form.querySelector('.js-start-round').classList.remove('is-counting-down');
            sendForm(form, action);
            return;
        }

        countdown = setInterval(function () {

            console.log('yaya!!');
            timeRemainingInput.value = timer;

            if (timer === 0) {
                timeRemainingInput.value = 'Jimprov!';
            }

            if (timer < 0 || stopTimer) {
                timeRemainingInput.value = 'Start Round';
                timer = duration;
                clearInterval(countdown);
                fetch(`/game/${gameId}/round`);
                form.querySelector('.js-start-round').classList.remove('is-counting-down');
            }

            sendForm(form, action);
            timer--;
        }, 1000);
    };

    const client = new window.nes.Client('ws://localhost:8000');

    const start = async () => {

        await client.connect();

        if (gameId) {
            // subscribe to game countdown channel
            client.subscribe(`/game/${gameId}/start`, (update) => {

                if (update.timeRemaining === 'Start Round') {
                    stopTimer = true;
                }
            });
        }

    };

    start();

    const countDownForm = document.querySelector('.js-game-countdown');

    if (countDownForm) {

        countDownForm.querySelector('.js-start-round').addEventListener('click', function (e) {

            e.preventDefault();
            const action = countDownForm.getAttribute('action');

            if (this.classList.contains('is-counting-down')) {
                countDownForm.querySelector('.js-time-remaining').value = 'stop';
            }

            if (!this.classList.contains('is-counting-down')) {
                this.classList.add('is-counting-down');
                stopTimer = false;
            }

            timer(5, countDownForm, action);
        });
    }
})();
