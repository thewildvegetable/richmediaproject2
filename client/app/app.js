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
        let url = '/deckList?id=' + deck._id;
        return (
            <div key={deck._id} className="deck">
                <h3 className="deckName">{deck.name}</h3>
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
    sendAjax('GET', '/getDecks', null, (data) => {
        ReactDOM.render(
            <DeckList decks={data.decks} />,
            document.querySelector("#decks")
        );
    });
};

const setup = function(csrf) {
    ReactDOM.render(
        <deckForm csrf={csrf} />,
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