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
        getToken();
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
            { htmlFor: "age" },
            "Mainboard: "
        ),
        React.createElement("textarea", { id: "deckList", rows: "25", name: "deckList", className: "cardForm", placeholder: "1 Forest" }),
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
