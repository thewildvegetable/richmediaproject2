

const setup = function(csrf) {
    ReactDOM.render(
        <deckForm csrf={csrf} />, 
        document.querySelector("#decks")
    );
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});