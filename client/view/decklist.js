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
    
};

//display the sideboard
const SideboardDisplay = (props) => {
    
};

const getDeck = () => {
    
};

const setup = function(csrf) {
    ReactDOM.render(
        <MainboardDisplay csrf={csrf} />, 
        document.querySelector("#mainboard")
    );
    
    ReactDOM.render(
        <SideboardDisplay csrf={csrf} />, 
        document.querySelector("#sideboard")
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