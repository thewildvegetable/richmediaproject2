"use strict";

var handlePasswordChange = function handlePasswordChange(e) {
    e.preventDefault();

    $("#errorMessage").text("");

    if ($("#pass").val() == '' || $("#pass2").val() == '') {
        handleError("All fields are required");
        return false;
    }

    if ($("#pass").val() === $("#pass2").val()) {
        handleError("New Password can't be the same as the old password");
        return false;
    }

    sendAjax('POST', $("#passwordForm").attr("action"), $("#passwordForm").serialize(), redirect);

    return false;
};

var ChangeWindow = function ChangeWindow(props) {
    return React.createElement(
        "form",
        { id: "passwordForm", name: "passwordForm",
            onSubmit: handlePasswordChange,
            action: "/change",
            method: "POST",
            className: "mainForm"
        },
        React.createElement(
            "label",
            { htmlFor: "pass" },
            "Old Password: "
        ),
        React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "password" }),
        React.createElement(
            "label",
            { htmlFor: "pass" },
            "New Password: "
        ),
        React.createElement("input", { id: "pass2", type: "password", name: "pass2", placeholder: "retype password" }),
        React.createElement("input", { name: "_csrf", type: "hidden", value: props.csrf }),
        React.createElement("input", { id: "passwordFormSubmit", type: "submit", value: "Change Password" })
    );
};

var createChangeWindow = function createChangeWindow(csrf) {
    ReactDOM.render(React.createElement(ChangeWindow, { csrf: csrf }), document.querySelector("#content"));
};

var setup = function setup(csrf) {
    getAds();
    createChangeWindow(csrf);
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
