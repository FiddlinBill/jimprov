'use strict';
// prevent forms from submitting, use ajax instead

(function () {

    function sendForm (form, action) {

        const XHR = new XMLHttpRequest();

        // Bind the FormData object and the form element
        const FD = new FormData(form);

        // Define what happens on successful data submission
        XHR.addEventListener('load', function (event) {

            // 
            form.querySelector('.js-bucket-name').value = '';
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
            event.preventDefault();
            sendForm(e.target, action);
        }
    });
})();
