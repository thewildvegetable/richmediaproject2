"use strict";

var deck = void 0; //the deck object gotten from the server
var mainDeck = void 0; //the json object of the cards in the mainboard
var sideboard = void 0; //the json object of the cards in the sideboard
var csrf = void 0; //the csrf token

var handleDeck = function handleDeck(e) {
    e.preventDefault();

    $("#errorMessage").text("");

    if ($("#deckList").val() == '') {
        handleError("All fields are required");
        return false;
    }

    console.dir($("#deckForm").serialize());

    sendAjax('POST', $("#deckForm").attr("action"), $("#deckForm").serialize(), function () {
        window.location = '/';
    });

    return false;
};

var DeckForm = function DeckForm(props) {
    //get the keys
    var mainKeys = Object.keys(props.main);
    var sideKeys = Object.keys(props.side);

    //variables to hold the decklist texts
    var mainList = '';
    var sideList = '';

    //fill the lists
    for (var i = 0; i < mainKeys.length - 1; i++) {
        mainList += props.main[mainKeys[i]].copies + " " + props.main[mainKeys[i]].name + "\r\n";
    }
    mainList += props.main[mainKeys[mainKeys.length - 1]].copies + " " + props.main[mainKeys[mainKeys.length - 1]].name; //done to avoid an extra \r\n
    for (var _i = 0; _i < sideKeys.length - 1; _i++) {
        sideList += props.side[sideKeys[_i]].copies + " " + props.side[sideKeys[_i]].name + "\r\n";
    }
    sideList += props.side[sideKeys[sideKeys.length - 1]].copies + " " + props.side[sideKeys[sideKeys.length - 1]].name; //done to avoid an extra \r\n

    return React.createElement(
        "form",
        { id: "deckForm", name: "deckForm",
            onSubmit: handleDeck,
            action: "/editer",
            method: "POST",
            className: "deckForm"
        },
        React.createElement(
            "label",
            { htmlFor: "name", id: "editName" },
            deck.name
        ),
        React.createElement(
            "label",
            { htmlFor: "main" },
            "Mainboard: "
        ),
        React.createElement(
            "textarea",
            { id: "deckList", rows: "10", name: "deckList", className: "cardForm" },
            mainList
        ),
        React.createElement(
            "label",
            { htmlFor: "sideboard", id: "sideboard" },
            "Sideboard: "
        ),
        React.createElement(
            "textarea",
            { id: "sideboard", rows: "10", name: "sideboard", className: "cardForm" },
            sideList
        ),
        React.createElement("input", { name: "_csrf", type: "hidden", value: csrf }),
        React.createElement("input", { name: "_id", type: "hidden", value: deck._id, className: "idField" }),
        React.createElement("input", { className: "makedeckSubmit", type: "submit", value: "Make deck" })
    );
};

var setup = function setup(csrf) {
    ReactDOM.render(React.createElement(DeckForm, { csrf: csrf, main: mainDeck, side: sideboard }), document.querySelector("#makeDeck"));
    getAds();
};

var getDeck = function getDeck() {
    //get the id from window.location
    var search = window.location.search.slice(1);
    console.dir(search);

    sendAjax('GET', '/getDeck', search, function (result) {
        //now get the deck
        deck = result.deck[0];

        console.dir(deck);

        //unstringify the json objects for cards and sideboard
        mainDeck = JSON.parse(deck.cards);
        sideboard = JSON.parse(deck.sideboard);

        console.dir(mainDeck);
        console.dir(sideboard);

        setup(csrf);
    });
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        csrf = result.csrfToken;
        getDeck();
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
