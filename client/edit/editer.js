let deck;       //the deck object gotten from the server
let mainDeck;   //the json object of the cards in the mainboard
let sideboard;  //the json object of the cards in the sideboard
let csrf;       //the csrf token

const handleDeck = (e) => {
    e.preventDefault();
    
    $("#errorMessage").text("");
    
    if($("#deckList").val() == ''){
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
    //get the keys
    let mainKeys = Object.keys(props.main);
    let sideKeys = Object.keys(props.side);
    
    //variables to hold the decklist texts
    let mainList = '';
    let sideList = '';
    
    //fill the lists
    for (let i = 0; i < mainKeys.length-1; i++){
        mainList += `${props.main[mainKeys[i]].copies} ${props.main[mainKeys[i]].name}\r\n`;
    }
    mainList += `${props.main[mainKeys[mainKeys.length-1]].copies} ${props.main[mainKeys[mainKeys.length-1]].name}`;   //done to avoid an extra \r\n
    for (let i = 0; i < sideKeys.length-1; i++){
        sideList += `${props.side[sideKeys[i]].copies} ${props.side[sideKeys[i]].name}\r\n`;
    }
    sideList += `${props.side[sideKeys[sideKeys.length-1]].copies} ${props.side[sideKeys[sideKeys.length-1]].name}`;   //done to avoid an extra \r\n
    
    return(
        <form id="deckForm" name="deckForm"
              onSubmit={handleDeck}
              action="/editer"
              method="POST"
              className="deckForm"
            >
            <label htmlFor="name" id="editName">{deck.name}</label>
            <label htmlFor="main">Mainboard: </label>
            <textarea id="deckList" rows="10" name="deckList" className="cardForm">{mainList}</textarea>
            <label htmlFor="sideboard" id="sideboard">Sideboard: </label>
            <textarea id="sideboard" rows="10" name="sideboard" className="cardForm">{sideList}</textarea>
            <input name="_csrf" type="hidden" value={csrf} />
            <input name="_id" type="hidden" value={deck._id} className="idField"/>
            <input className="makedeckSubmit" type="submit" value="Make deck" />

        </form>
    );
};

const setup = function(csrf) {
    ReactDOM.render(
        <DeckForm csrf={csrf} main={mainDeck} side={sideboard}/>, 
        document.querySelector("#makeDeck")
    );
    getAds();
};

const getDeck= () => {
    //get the id from window.location
    let search = window.location.search.slice(1);
    console.dir(search);
    
    sendAjax('GET', '/getDeck', search, (result) => {
        //now get the deck
        deck = result.deck[0];
        
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
        csrf = result.csrfToken;
        getDeck();
    });
};

$(document).ready(function() {
    getToken();
});