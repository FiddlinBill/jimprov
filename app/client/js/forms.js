'use strict';
// prevent forms from submitting, use ajax instead

(function () {

    function sendForm (form, action) {

        const XHR = new XMLHttpRequest();

        // Bind the FormData object and the form element
        const FD = new FormData(form);

        // After successful submit, clear the inputs
        XHR.addEventListener('load', function (event) {

            const bucketName = form.querySelector('.js-bucket-name');
            const card = form.querySelector('.js-card');

            if (bucketName) {
                bucketName.value = '';
            }

            if (card) {
                card.value = '';
            }
        });

        // Define what happens in case of error
        XHR.addEventListener('error', function (event) {

            console.log(event);
        });

        XHR.open('POST', action);
        XHR.send(FD);
    }

    document.addEventListener('submit', function (e) {

        const action = e.target.getAttribute('action');

        if (action) {
            e.preventDefault();
            sendForm(e.target, action);
        }
    });
})();
