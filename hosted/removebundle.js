'use strict';

var csrf = void 0;

var removeDomo = function removeDomo(e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    var domoForm = e.target;
    var idField = domoForm.querySelector('.idField');
    var csrfField = domoForm.querySelector('.csrfField');

    //build our x-www-form-urlencoded format
    var formData = '_id=' + idField.value + '&_csrf=' + csrfField.value;

    sendAjax('POST', '/remove', formData, function () {
        loadDomosFromServer();
    });

    return false;
};

var DomoList = function DomoList(props) {
    if (props.domos.length === 0) {
        return React.createElement(
            'div',
            { className: 'domoList' },
            React.createElement(
                'h3',
                { className: 'emptyDomo' },
                'No Domos present'
            )
        );
    }

    var domoNodes = props.domos.map(function (domo) {
        console.dir(domo);
        return React.createElement(
            'div',
            { key: domo._id, className: 'domo' },
            React.createElement('img', { src: '/assets/img/domoface.jpeg', alt: 'domo face', className: 'domoFace' }),
            React.createElement(
                'h3',
                { className: 'domoName' },
                'Name: ',
                domo.name,
                ' '
            ),
            React.createElement(
                'h3',
                { className: 'domoAge' },
                'Age: ',
                domo.age,
                ' '
            ),
            React.createElement(
                'h3',
                { className: 'domoLevel' },
                'Level: ',
                domo.level,
                ' '
            ),
            React.createElement(
                'form',
                { name: 'domoForm',
                    onSubmit: removeDomo,
                    action: '/remove',
                    method: 'POST',
                    className: 'removeDomoForm'
                },
                React.createElement('input', { name: '_id', type: 'hidden', value: domo._id, className: 'idField' }),
                React.createElement('input', { name: '_csrf', type: 'hidden', value: csrf, className: 'csrfField' }),
                React.createElement('input', { className: 'makeDomoSubmit', type: 'submit', value: 'Remove' })
            )
        );
    });

    return React.createElement(
        'div',
        { className: 'domoList' },
        domoNodes
    );
};

var loadDomosFromServer = function loadDomosFromServer() {
    sendAjax('GET', '/getDomos', null, function (data) {
        ReactDOM.render(React.createElement(DomoList, { domos: data.domos }), document.querySelector("#domos"));
    });
};

var setup = function setup(csrfToken) {
    console.dir(csrfToken);
    csrf = csrfToken;
    console.dir(csrf);

    ReactDOM.render(React.createElement(DomoList, { domos: [] }), document.querySelector("#domos"));

    loadDomosFromServer();
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
    $("#domoMessage").animate({ width: 'toggle' }, 350);
};

var redirect = function redirect(response) {
    $("#domoMessage").animate({ width: 'hide' }, 350);
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
