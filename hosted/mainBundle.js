'use strict';

var csrf = void 0;
var deckNodes = []; //all the decks from the server as react elements
var pageNum = 1; //what page of decks are we on?
var maxPageNum = 1; //how many pages are there
var previousButton = void 0; //previous page button
var nextButton = void 0; //next page button

//send to the server a request to view a specific decklist
var ViewDeck = function ViewDeck(e) {

    var deckForm = e.target;
    var idField = deckForm.querySelector('.idField');
    var csrfField = deckForm.querySelector('.csrfField');

    //build our x-www-form-urlencoded format
    var formData = '_id=' + idField.value;

    window.location = '/deck?' + formData;
};

//make the react elements for each deck
var DeckList = function DeckList(props) {
    if (props.decks.length === 0) {
        document.querySelector("#deckPages").style.display = 'none';

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

    //setup all the decks
    deckNodes = props.decks.map(function (deck) {
        console.dir(deck);
        var url = '/deckList?id=' + deck._id;
        return React.createElement(
            'div',
            { key: deck._id, className: 'deck' },
            React.createElement(
                'h3',
                { className: 'deckName' },
                deck.name
            ),
            React.createElement(
                'form',
                { name: 'deckForm',
                    onSubmit: ViewDeck,
                    action: '/deck',
                    method: 'GET',
                    className: 'viewDeckForm'
                },
                React.createElement('input', { name: '_id', type: 'hidden', value: deck._id, className: 'idField' }),
                React.createElement('input', { name: '_csrf', type: 'hidden', value: csrf, className: 'csrfField' }),
                React.createElement('input', { className: 'makeDeckSubmit', type: 'submit', value: 'View' })
            )
        );
    });

    //get max number of pages
    maxPageNum = Math.ceil(deckNodes.length / 20.0);

    if (maxPageNum === 1) {
        document.getElementById("deckPages").style.display = 'none';
    }

    //seperate out the first 20 decks to put on page 1
    var displayDecks = deckNodes.slice(0, 19);

    return React.createElement(
        'div',
        { className: 'deckList' },
        displayDecks
    );
};

//load a new page
var LoadNewPage = function LoadNewPage(props) {
    //update page
    return React.createElement(
        'div',
        { className: 'deckList' },
        props.decks
    );
};

//move to a new page
var MoveNewPage = function MoveNewPage(num) {
    //update pageNumber
    pageNum += num;

    //verify new page exists
    if (pageNum < 1) {
        pageNum = 1;
        //hide previous button
        previousButton.style.display = 'none';
        return;
    }
    if (pageNum > maxPageNum) {
        pageNum = maxPageNum;
        //hide next button
        nextButton.style.display = 'none';
        return;
    }

    //make both buttons visible
    previousButton.style.display = 'block';
    nextButton.style.display = 'block';

    //seperate out the 20 decks on the new page
    var start = 20 * (pageNum - 1);
    var end = 19 * pageNum;
    var displayDecks = deckNodes.slice(start, end);

    //render the new page
    ReactDOM.render(React.createElement(LoadNewPage, { decks: displayDecks }), document.querySelector("#decks"));
};

//load all the decks from the server
var loadDecksFromServer = function loadDecksFromServer() {
    sendAjax('GET', '/getDecks', null, function (data) {
        ReactDOM.render(React.createElement(DeckList, { decks: data.decks }), document.querySelector("#decks"));
    });
};

//setup the react page
var setup = function setup(csrf) {
    ReactDOM.render(React.createElement('deckForm', { csrf: csrf }), document.querySelector("#decks"));
    getAds();
    //get the next button and the previous button
    previousButton = document.getElementById('previous');
    nextButton = document.getElementById('next');

    //add onclick events
    previousButton.onclick = function () {
        MoveNewPage(-1);
    };
    nextButton.onclick = function () {
        MoveNewPage(1);
    };

    loadDecksFromServer();
};

//get csrf token
var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        csrf = result.csrfToken;

        //check if logged in
        if (result.loggedIn) {
            //change login to logout
            var loginLink = document.getElementById('login');
            loginLink.textContent = 'Log out';
            loginLink.href = '/logout';

            //make logged in tabs visible
            document.querySelector('#loggedIn').style.display = 'block';
        }
        setup(csrf);
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
