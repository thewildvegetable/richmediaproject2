'use strict';

var csrf = void 0;

var removeDeck = function removeDeck(e) {
    e.preventDefault();

    var deckForm = e.target;
    var idField = deckForm.querySelector('.idField');
    var csrfField = deckForm.querySelector('.csrfField');

    //build our x-www-form-urlencoded format
    var formData = '_id=' + idField.value + '&_csrf=' + csrfField.value;

    sendAjax('POST', '/remove', formData, function () {
        loadDecksFromServer();
    });

    return false;
};

var DeckList = function DeckList(props) {
    if (props.decks.length === 0) {
        return React.createElement(
            'div',
            { className: 'deckList' },
            React.createElement(
                'h3',
                { className: 'emptyDeck' },
                'No Decks present'
            )
        );
    }

    var deckNodes = props.decks.map(function (deck) {
        console.dir(deck);
        return React.createElement(
            'div',
            { key: deck._id, className: 'deck' },
            React.createElement(
                'h3',
                { className: 'deckName' },
                'Name: ',
                deck.name,
                ' '
            ),
            React.createElement(
                'form',
                { name: 'deckForm',
                    onSubmit: removeDeck,
                    action: '/remove',
                    method: 'POST',
                    className: 'removeDeckForm'
                },
                React.createElement('input', { name: '_id', type: 'hidden', value: deck._id, className: 'idField' }),
                React.createElement('input', { name: '_csrf', type: 'hidden', value: csrf, className: 'csrfField' }),
                React.createElement('input', { className: 'makeDeckSubmit', type: 'submit', value: 'Remove' })
            )
        );
    });

    return React.createElement(
        'div',
        { className: 'deckList' },
        deckNodes
    );
};

var loadDecksFromServer = function loadDecksFromServer() {
    sendAjax('GET', '/getDecksOwner', null, function (data) {
        ReactDOM.render(React.createElement(DeckList, { decks: data.decks }), document.querySelector("#decks"));
    });
};

var setup = function setup(csrfToken) {
    console.dir(csrfToken);
    csrf = csrfToken;
    console.dir(csrf);

    ReactDOM.render(React.createElement(DeckList, { decks: [] }), document.querySelector("#decks"));

    loadDecksFromServer();
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
"use strict";

var handleError = function handleError(message) {
    $("#errorMessage").text(message);
};

var redirect = function redirect(response) {
    $("#errorMessage").text("");
    window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};
