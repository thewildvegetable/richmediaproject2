let csrf;
let deckNodes = [];     //all the decks from the server as react elements
let pageNum = 1;        //what page of decks are we on?
let maxPageNum = 1;     //how many pages are there
let previousButton;     //previous page button
let nextButton;         //next page button
let standardButton;     //standard format button
let modernButton;       //modern format button
let legacyButton;       //legacy format button
let commanderButton;    //commander format button
let allButton;          //all formats button
let formatDisplay;      //the div contianing the format currently displayed

//send to the server a request to view a specific decklist
const ViewDeck = (e) => {
    const deckForm = e.target;
    const idField = deckForm.querySelector('.idField');
    const csrfField = deckForm.querySelector('.csrfField');
    
    //build our x-www-form-urlencoded format
    const formData = `_id=${idField.value}`;
    
    window.location = `/deck?${formData}`;
};

//make the react elements for each deck
const DeckList = function(props) {
    if (props.decks.length === 0) {
        document.querySelector("#deckPages").style.display = 'none';
        
        return (
            <div className="deckList">
                <h3 className="emptyDeck">No Decks present</h3>
            </div>
        );
    }
    
    //setup all the decks
    deckNodes = props.decks.map(function(deck) {
        console.dir(deck);
        let url = '/deckList?id=' + deck._id;
        return (
            <div key={deck._id} className="deck">
                <h3 className="deckName">{deck.name}</h3>
                <form name="deckForm"
                      onSubmit={ViewDeck}
                      action="/deck"
                      method="GET"
                      className="viewDeckForm"
                    >
                    <input name="_id" type="hidden" value={deck._id} className="idField"/>
                    <input name="_csrf" type="hidden" value={csrf} className="csrfField"/>
                    <input className="makeDeckSubmit" type="submit" value="View" />
                </form>
            </div>
        );
    });
    
    //get max number of pages
    maxPageNum = Math.ceil(deckNodes.length / 20.0);
    
    if (maxPageNum === 1){
        document.getElementById("deckPages").style.display = 'none';
    }
    
    //seperate out the first 20 decks to put on page 1
    const displayDecks = deckNodes.slice(0, 19);
    
    return(
        <div className="deckList">
            {displayDecks}
        </div>
    );
};

//load a new page
const LoadNewPage = (props) => {
    //update page
    return(
        <div className="deckList">
            {props.decks}
        </div>
    );
};

//move to a new page
const MoveNewPage = (num) => {
    //update pageNumber
    pageNum += num;
    
    //verify new page exists
    if (pageNum < 1) {
        pageNum = 1;
        //hide previous button
        previousButton.style.display = 'none';
        return;
    }
    if (pageNum > maxPageNum){
        pageNum = maxPageNum;
        //hide next button
        nextButton.style.display = 'none';
        return;
    }
    
    //make both buttons visible
    previousButton.style.display = 'block';
    nextButton.style.display = 'block';
    
    //seperate out the 20 decks on the new page
    let start = 20 * (pageNum-1);
    let end = 19 * pageNum;
    const displayDecks = deckNodes.slice(start, end);
    
    //render the new page
    ReactDOM.render(
        <LoadNewPage decks={displayDecks} />,
        document.querySelector("#decks")
    );
}

//load all the decks from the server
const loadDecksFromServer = () => {
    sendAjax('GET', '/getDecks', null, (data) => {
        formatDisplay.textContent = "All Formats";
        ReactDOM.render(
            <DeckList decks={data.decks} />,
            document.querySelector("#decks")
        );
    });
};

//load all the decks of a specific format from the server
const loadFormatDecksFromServer = (formatName) => {
    let formatInfo = `format=${formatName}`;
    sendAjax('GET', '/getDecksFormat', formatInfo, (data) => {
        formatDisplay.textContent = formatName;
        ReactDOM.render(
            <DeckList decks={data.decks} />,
            document.querySelector("#decks")
        );
    });
};

//setup the react page
const setup = function(csrf) {
    ReactDOM.render(
        <deckForm csrf={csrf} />,
        document.querySelector("#decks")
    );
    getAds();
    //get the buttons
    previousButton = document.getElementById('previous');
    nextButton = document.getElementById('next');
    standardButton = document.getElementById('standard');
    modernButton = document.getElementById('modern');
    legacyButton = document.getElementById('legacy');
    commanderButton = document.getElementById('commander');
    allButton = document.getElementById('all');
    
    //add onclick events
    previousButton.onclick = () => {
        MoveNewPage(-1);
    };
    nextButton.onclick = () => {
        MoveNewPage(1);
    };
    standardButton.onclick = () => {
        loadFormatDecksFromServer("Standard");
    };
    modernButton.onclick = () => {
        loadFormatDecksFromServer("Modern");
    };
    legacyButton.onclick = () => {
        loadFormatDecksFromServer("Legacy");
    };
    commanderButton.onclick = () => {
        loadFormatDecksFromServer("Commander");
    };
    allButton.onclick = loadDecksFromServer;
    
    //get format display
    formatDisplay = document.getElementById("currentFormat");
    
    loadFormatDecksFromServer("Standard");
};

//get csrf token
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        csrf = result.csrfToken;
        
        //check if logged in
        if (result.loggedIn){
            //change login to logout
            let loginLink = document.getElementById('login');
            loginLink.textContent = 'Log out';
            loginLink.href = '/logout';
            
            //make logged in tabs visible
            document.querySelector('#loggedIn').style.display = 'block';
        }
        setup(csrf);
    });
};

$(document).ready(function() {
    getToken();
});