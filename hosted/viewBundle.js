"use strict";

var deck = void 0;

//setup the mouseover event
var CardMouseover = function CardMouseover(multiverseId) {
    //get card image tag
    var imgTag = document.getElementById('card');

    //make the new src
    var newUrl = "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + multiverseId + "&type=card";

    //set the img tag's src to the new src
    imgTag.src = newUrl;
};

//display the mainboard
var MainboardDisplay = function MainboardDisplay(props) {
    //setup the mainboard
    var deckNodes = props.deck.map(function (card) {
        return React.createElement(
            "div",
            { multiverseId: card._id, className: "maindeckCard", onmouseover: function onmouseover() {
                    return CardMouseover(card._id);
                } },
            React.createElement(
                "h3",
                null,
                card.copies,
                " ",
                card.name
            )
        );
    });

    return React.createElement(
        "div",
        { className: "deckList" },
        deckNodes
    );
};

//display the sideboard
var SideboardDisplay = function SideboardDisplay(props) {
    //setup the sideboard
    var deckNodes = props.side.map(function (card) {
        return React.createElement(
            "div",
            { multiverseId: card._id, className: "sideboardCard", onmouseover: function onmouseover() {
                    return CardMouseover(card._id);
                } },
            React.createElement(
                "h3",
                null,
                card.copies,
                " ",
                card.name
            )
        );
    });

    return React.createElement(
        "div",
        { className: "sideboardList" },
        deckNodes
    );
};

var setup = function setup(csrf) {
    console.dir(deck);
    ReactDOM.render(React.createElement(MainboardDisplay, { deck: deck.cards }), document.querySelector("#mainboard"));

    ReactDOM.render(React.createElement(SideboardDisplay, { side: deck.sideboard }), document.querySelector("#sideboard"));
};

var getDeck = function getDeck(csrf) {
    //get the id from window.location
    var search = window.location.search;
    console.dir(search);

    sendAjax('GET', '/getDeck', search, function (result) {
        //now get the deck
        deck = result.deck;
        setup(csrf);
    });
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        getDeck(result.csrfToken);
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
