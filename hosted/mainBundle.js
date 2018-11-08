"use strict";

var DeckList = function DeckList(props) {
    if (props.decks.length === 0) {
        return React.createElement(
            "div",
            { className: "deckList" },
            React.createElement(
                "h3",
                { className: "emptyDeck" },
                "No Decks present"
            )
        );
    }

    var deckNodes = props.decks.map(function (deck) {
        console.dir(deck);
        var url = '/deckList?id=' + deck._id;
        return React.createElement(
            "div",
            { key: deck._id, className: "deck" },
            React.createElement(
                "h3",
                { className: "deckName" },
                deck.name
            )
        );
    });

    return React.createElement(
        "div",
        { className: "deckList" },
        deckNodes
    );
};

var loadDecksFromServer = function loadDecksFromServer() {
    sendAjax('GET', '/getDecks', null, function (data) {
        ReactDOM.render(React.createElement(DeckList, { decks: data.decks }), document.querySelector("#decks"));
    });
};

var setup = function setup(csrf) {
    ReactDOM.render(React.createElement("deckForm", { csrf: csrf }), document.querySelector("#decks"));

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
