let deck;

//setup the mouseover event
const CardMouseover = (multiverseId) => {
    //get card image tag
    const imgTag = document.getElementById('card');
    
    //make the new src
    let newUrl = `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${multiverseId}&type=card`;
    
    //set the img tag's src to the new src
    imgTag.src = newUrl;
};

//display the mainboard
const MainboardDisplay = (props) => {
    //setup the mainboard
    let deckNodes = props.deck.map(function(card) {
        return (
            <div multiverseId={card._id} className="maindeckCard" onmouseover={() => CardMouseover(card._id)}>
                <h3>{card.copies} {card.name}</h3>
            </div>
        );
    });

    return(
        <div className="deckList">
            {deckNodes}
        </div>
    );
};

//display the sideboard
const SideboardDisplay = (props) => {
    //setup the sideboard
    let deckNodes = props.side.map(function(card) {
        return (
            <div multiverseId={card._id} className="sideboardCard" onmouseover={() => CardMouseover(card._id)}>
                <h3>{card.copies} {card.name}</h3>
            </div>
        );
    });

    return(
        <div className="sideboardList">
            {deckNodes}
        </div>
    );
};

const setup = function(csrf) {
    console.dir(deck);
    ReactDOM.render(
        <MainboardDisplay deck={deck.cards} />, 
        document.querySelector("#mainboard")
    );
    
    ReactDOM.render(
        <SideboardDisplay side={deck.sideboard} />, 
        document.querySelector("#sideboard")
    );
};

const getDeck= (csrf) => {
    //get the id from window.location
    let search = window.location.search;
    console.dir(search);
    
    sendAjax('GET', '/getDeck', search, (result) => {
        //now get the deck
        deck = result.deck;
        setup(csrf);
    });
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        getDeck(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});