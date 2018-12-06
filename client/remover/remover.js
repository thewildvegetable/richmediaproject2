let csrf;

const removeDeck = (e) => {
    e.preventDefault();
    
    const deckForm = e.target;
    const idField = deckForm.querySelector('.idField');
    const csrfField = deckForm.querySelector('.csrfField');
    
    //build our x-www-form-urlencoded format
    const formData = `_id=${idField.value}&_csrf=${csrfField.value}`;
    
    sendAjax('POST', '/remove', formData, () => {
        loadDecksFromServer();
    });
    
    return false;
};

//change window to the edit deck window
const editDeck = (id) => {
    //build our x-www-form-urlencoded format
    const searchData = `_id=${id}`;
    
    window.location = `/editer?${searchData}`;
};

const DeckList = function(props) {
    if (props.decks.length === 0) {
        return (
            <div className="deckList">
                <h3 className="emptyDeck">No Decks present</h3>
            </div>
        );
    }
    
    const deckNodes = props.decks.map(function(deck) {
        console.dir(deck);
        return (
            <div key={deck._id} className="deck">
                <h3 className="deckName">Name: {deck.name} </h3>
                <form name="deckForm"
                      onSubmit={removeDeck}
                      action="/remove"
                      method="POST"
                      className="removeDeckForm"
                    >
                    <input name="_id" type="hidden" value={deck._id} className="idField"/>
                    <input name="_csrf" type="hidden" value={csrf} className="csrfField"/>
                    <input className="makeDeckSubmit" type="submit" value="Remove" />
                </form>
                <button className='editDeckButton' onClick={() => editDeck(deck._id)}>Edit</button>
            </div>
        );
    });
    
    return(
        <div className="deckList">
            {deckNodes}
        </div>
    );
};

const loadDecksFromServer = () => {
    sendAjax('GET', '/getDecksOwner', null, (data) => {
        ReactDOM.render(
            <DeckList decks={data.decks} />,
            document.querySelector("#decks")
        );
    });
};

const setup = function(csrfToken) {
    console.dir(csrfToken);
    csrf = csrfToken;
    
    getAds();
    ReactDOM.render(
        <DeckList decks={[]} />, 
        document.querySelector("#decks")
    );
    
    loadDecksFromServer();
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});