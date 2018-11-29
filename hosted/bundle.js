"use strict";

var handleDeck = function handleDeck(e) {
    e.preventDefault();

    $("#errorMessage").text("");

    if ($("#deckName").val() == '' || $("#deckList").val() == '') {
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
    return React.createElement(
        "form",
        { id: "deckForm", name: "deckForm",
            onSubmit: handleDeck,
            action: "/maker",
            method: "POST",
            className: "deckForm"
        },
        React.createElement(
            "label",
            { htmlFor: "name" },
            "Name: "
        ),
        React.createElement("input", { id: "deckName", type: "text", name: "name", placeholder: "deck Name" }),
        React.createElement(
            "label",
            { htmlFor: "format" },
            "Format: "
        ),
        React.createElement(
            "select",
            { id: "format", name: "format" },
            React.createElement(
                "option",
                { value: "Standard" },
                "Standard"
            ),
            React.createElement(
                "option",
                { value: "Modern" },
                "Modern"
            ),
            React.createElement(
                "option",
                { value: "Legacy" },
                "Legacy"
            ),
            React.createElement(
                "option",
                { value: "Vintage" },
                "Vintage"
            ),
            React.createElement(
                "option",
                { value: "Commander" },
                "Commander"
            )
        ),
        React.createElement(
            "label",
            { htmlFor: "main" },
            "Mainboard: "
        ),
        React.createElement("textarea", { id: "deckList", rows: "10", name: "deckList", className: "cardForm", placeholder: "1 Forest" }),
        React.createElement(
            "label",
            { htmlFor: "sideboard", id: "sideboard" },
            "Sideboard: "
        ),
        React.createElement("textarea", { id: "sideboard", rows: "10", name: "sideboard", className: "cardForm", placeholder: "1 Forest" }),
        React.createElement("input", { name: "_csrf", type: "hidden", value: props.csrf }),
        React.createElement("input", { className: "makedeckSubmit", type: "submit", value: "Make deck" })
    );
};

var setup = function setup(csrf) {
    ReactDOM.render(React.createElement(DeckForm, { csrf: csrf }), document.querySelector("#makeDeck"));
    getAds();
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
