"use strict";

var deck = void 0; //the deck object gotten from the server
var mainDeck = void 0; //the json object of the cards in the mainboard
var sideboard = void 0; //the json object of the cards in the sideboard

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
    //get the keys
    var mainKeys = Object.keys(props.deck);

    //setup the mainboard
    var deckNodes = mainKeys.map(function (key) {
        var card = props.deck[key];
        return React.createElement(
            "div",
            { multiverseId: card.multiverseid, className: "maindeckCard", onMouseOver: function onMouseOver() {
                    return CardMouseover(card.multiverseid);
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
    //get the keys
    var sideKeys = Object.keys(props.side);

    //setup the mainboard
    var deckNodes = sideKeys.map(function (key) {
        var card = props.side[key];
        return React.createElement(
            "div",
            { multiverseId: card.multiverseid, className: "sideboardCard", onMouseOver: function onMouseOver() {
                    return CardMouseover(card.multiverseid);
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
    ReactDOM.render(React.createElement(MainboardDisplay, { deck: mainDeck }), document.querySelector("#mainboardList"));

    ReactDOM.render(React.createElement(SideboardDisplay, { side: sideboard }), document.querySelector("#sideboardList"));
    getAds();
};

var getDeck = function getDeck(csrf) {
    //get the id from window.location
    var search = window.location.search.slice(1);
    console.dir(search);

    sendAjax('GET', '/getDeck', search, function (result) {
        //now get the deck
        deck = result.deck[0];

        //set the name
        document.getElementById('deckListName').textContent = deck.name;

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
        //check if logged in
        if (result.loggedIn) {
            //change login to logout
            var loginLink = document.getElementById('login');
            loginLink.textContent = 'Log out';
            loginLink.href = '/logout';

            //make logged in tabs visible
            document.querySelector('#loggedIn').style.display = 'block';
        }
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
