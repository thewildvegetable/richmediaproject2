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

//change window to the edit deck window
var editDeck = function editDeck(id) {
    //build our x-www-form-urlencoded format
    var searchData = '_id=' + id;

    window.location = '/editer?' + searchData;
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
            ),
            React.createElement(
                'button',
                { className: 'editDeckButton', onClick: function onClick() {
                        return editDeck(deck._id);
                    } },
                'Edit'
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

    getAds();
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

var getAds = function getAds() {
    sendAjax('GET', '/getAds', null, function (data) {
        //get the 2 ad containers
        var ad1Img = document.getElementById('ad1');
        var ad2Img = document.getElementById('ad2');

        //change their srcs
        ad1Img.src = "/assets/ads/" + data.ad1;
        ad2Img.src = "/assets/ads/" + data.ad2;

        //reposition ad2
        //ad2Img.top = document.height - ad2Img.height;
    });
};
