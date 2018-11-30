const handleDeck = (e) => {
    e.preventDefault();
    
    $("#errorMessage").text("");
    
    if($("#deckName").val() == '' || $("#deckList").val() == ''){
        handleError("All fields are required");
        return false;
    }
    
    console.dir($("#deckForm").serialize());
    
    sendAjax('POST', $("#deckForm").attr("action"), $("#deckForm").serialize(), function() {
        window.location = '/';
    });
    
    return false;
};

const DeckForm = (props) => {
    return(
        <form id="deckForm" name="deckForm"
              onSubmit={handleDeck}
              action="/maker"
              method="POST"
              className="deckForm"
            >
            <label htmlFor="name">Name: </label>
            <input id="deckName" type="text" name="name" placeholder="deck Name" />
            <label htmlFor="format">Format: </label>
            <select id='format' name='format'>
                <option value="Standard">Standard</option>
                <option value="Modern">Modern</option>
                <option value="Legacy">Legacy</option>
                <option value="Commander">Commander</option>
            </select>
            <label htmlFor="main">Mainboard: </label>
            <textarea id="deckList" rows="10" name="deckList" className="cardForm" placeholder="1 Forest"></textarea>
            <label htmlFor="sideboard" id="sideboard">Sideboard: </label>
            <textarea id="sideboard" rows="10" name="sideboard" className="cardForm" placeholder="1 Forest"></textarea>
            <input name="_csrf" type="hidden" value={props.csrf} />
            <input className="makedeckSubmit" type="submit" value="Make deck" />
            
            
        </form>
    );
};

const setup = function(csrf) {
    ReactDOM.render(
        <DeckForm csrf={csrf} />, 
        document.querySelector("#makeDeck")
    );
    getAds();
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});