'use strict';
// prevent forms from submitting, use ajax instead

(function () {

    function sendForm (form, action) {

        const XHR = new XMLHttpRequest();

        // get the form data from the form element
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

        // error handling
        XHR.addEventListener('error', function (event) {

            console.log(event);
        });

        XHR.open('POST', action);
        // let server know that this is an ajax request
        XHR.setRequestHeader('Accept', 'application/json');
        XHR.send(FD);
    }

    const bucketContainer = document.querySelector('.js-bucket-list');
    const newBucketForm = document.querySelector('js-new-bucket');

    if (bucketContainer) {
        bucketContainer.addEventListener('submit', function (e) {

            const action = e.target.getAttribute('action');

            if (action) {
                e.preventDefault();
                sendForm(e.target, action);
            }
        });
    }

    if (newBucketForm) {
        newBucketForm.addEventListener('submit', function (e) {

            const action = this.getAttribute('action');

            if (action) {
                e.preventDefault();
                sendForm(e.target, action);
            }
        });
    }
})();
