let deck;       //the deck object gotten from the server
let mainDeck;   //the json object of the cards in the mainboard
let sideboard;  //the json object of the cards in the sideboard

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
    //get the keys
    let mainKeys = Object.keys(props.deck);
    
    //setup the mainboard
    let deckNodes = mainKeys.map(function(key) {
        let card = props.deck[key];
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
    //get the keys
    let sideKeys = Object.keys(props.side);
    
    //setup the mainboard
    let deckNodes = sideKeys.map(function(key) {
        let card = props.side[key];
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
    ReactDOM.render(
        <MainboardDisplay deck={mainDeck} />, 
        document.querySelector("#mainboard")
    );
    
    ReactDOM.render(
        <SideboardDisplay side={sideboard} />, 
        document.querySelector("#sideboard")
    );
};

const getDeck= (csrf) => {
    //get the id from window.location
    let search = window.location.search.slice(1);
    console.dir(search);
    
    sendAjax('GET', '/getDeck', search, (result) => {
        //now get the deck
        deck = result.deck[0];
        
        //set the name
        document.getElementById('deckName').textContent = deck.name;
        
        console.dir(deck);
        
        //unstringify the json objects for cards and sideboard
        mainDeck = JSON.parse(deck.cards);
        sideboard = JSON.parse(deck.sideboard);
        
        console.dir(mainDeck);
        console.dir(sideboard);
        
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