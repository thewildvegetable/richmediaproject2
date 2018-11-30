'use strict';

//get csrf token and check if logged in
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
