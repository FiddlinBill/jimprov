'use strict';

//MODALS
/* eslint-disable complexity */
(function () {

    function closeModal () {

        const close = new Event('modal-close');
        const modal = document.getElementsByClassName('c-modal is-visible')[0];
        const backdrop = document.getElementsByClassName('c-modal-backdrop')[0];

        if (!modal) {
            throw new Error('There is no active modal to close! You should feel bad!');
        }

        // If viewing an open-by-default modal, redirect to company profile upon closing
        if (modal.classList.contains('js-show-modal-by-default')) {
            const closeButton = modal.getElementsByClassName('js-modal-close')[0];

            if (closeButton) {
                window.location.replace(closeButton.getAttribute('href'));
            }

        }

        toggleModal(modal, backdrop);
        modal.dispatchEvent(close);
    }

    // pass the name of the modal to open and optionally some context
    // @ TODO reduce complexity
    function openModal (modalName, modalContext) {

        if (!modalName) {
            return;
        }

        const open = new Event('modal-open');
        const backdrop = document.getElementsByClassName('c-modal-backdrop')[0];
        const targetModal = document.getElementsByClassName(modalName);
        const activeModals = document.getElementsByClassName('c-modal is-visible');

        // add context to dynamic divs (i.e. where 1 div serves multiple objects,  i.e. availabilities)
        open.modalContext = modalContext;

        if (!targetModal[0]) {
            throw new Error('The modal ' + modalName + ' cannot be found! You should feel bad!');
        }

        // there can be no more than 1 target modal!
        if (targetModal.length > 1) {
            throw new Error('The modal ' + modalName + ' has been rendered multiple times. There should be only 1!!!');
        }

        // if there is already a modal open, hide it and leave the backdrop visible
        if (activeModals && activeModals.length) {
            [].forEach.call(activeModals, function (modal) {

                modal.classList.toggle('is-visible');
            });

            targetModal[0].classList.toggle('is-visible');
            targetModal[0].dispatchEvent(open);
            return;
        }

        toggleModal(targetModal[0], backdrop);
        targetModal[0].dispatchEvent(open);
    }

    // pass the element that controls the modal (i.e. a button)
    // It then reads the target attribute of the controlling element to determine which modal to open
    function toggleModal (modal, backdrop) {

        modal.classList.toggle('is-visible');
        backdrop.classList.toggle('is-visible');
        document.body.classList.toggle('h-no-scrolling');
    }

    // buttons that open and close modals
    const modalToggleButtons = document.getElementsByClassName('js-toggle-modal');
    const modals = document.getElementsByClassName('c-modal');
    const shownByDefaultModals = document.getElementsByClassName('js-show-modal-by-default');
    const backdrop = document.getElementsByClassName('c-modal-backdrop')[0];

    // open modal if it has the class js-show-modal-by-default
    if (shownByDefaultModals && shownByDefaultModals.length) {
        if (shownByDefaultModals.length > 1) {
            throw new Error('There can be only one modal displayed by default');
        }

        openModal(shownByDefaultModals[0].dataset.target, null);
    }

    // Attach listener to open modal buttons
    if (modalToggleButtons && modalToggleButtons.length) {
        [].forEach.call(modalToggleButtons, function (button) {

            button.addEventListener('click', function (e) {

                const context = this.dataset.modalContext || this.closest('.c-object') && this.closest('.c-object').dataset.modalContext || undefined;
                e.preventDefault();
                e.stopPropagation();
                openModal(this.dataset.target, context);
            });
        });
    }

    // Attach listener to modals
    if (modals && modals.length) {
        [].forEach.call(modals, function (modal) {

            modal.openModal = openModal;

            modal.addEventListener('click', function (e) {

                if (e.target && (e.target.matches('.js-modal-close') || e.target.parentNode.matches('.js-modal-close'))) {
                    e.stopPropagation();
                    closeModal();
                }
            });
        });
    }

    // Attach toggle modal listener to background
    if (backdrop) {
        backdrop.addEventListener('click', function (e) {

            e.stopPropagation();
            closeModal();
        });
    }
})();
/* eslint-enable complexity */
