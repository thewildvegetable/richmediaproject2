let csrf;

const removeDomo = (e) => {
    e.preventDefault();
    
    $("#domoMessage").animate({width:'hide'}, 350);
    
    const domoForm = e.target;
    const idField = domoForm.querySelector('.idField');
    const csrfField = domoForm.querySelector('.csrfField');
    
    //build our x-www-form-urlencoded format
    const formData = `_id=${idField.value}&_csrf=${csrfField.value}`;
    
    sendAjax('POST', '/remove', formData, () => {
        loadDomosFromServer();
    });
    
    return false;
};

const DomoList = function(props) {
    if (props.domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Domos present</h3>
            </div>
        );
    }
    
    const domoNodes = props.domos.map(function(domo) {
        console.dir(domo);
        return (
            <div key={domo._id} className="domo">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="domoName">Name: {domo.name} </h3>
                <h3 className="domoAge">Age: {domo.age} </h3>
                <h3 className="domoLevel">Level: {domo.level} </h3>
                <form name="domoForm"
                      onSubmit={removeDomo}
                      action="/remove"
                      method="POST"
                      className="removeDomoForm"
                    >
                    <input name="_id" type="hidden" value={domo._id} className="idField"/>
                    <input name="_csrf" type="hidden" value={csrf} className="csrfField"/>
                    <input className="makeDomoSubmit" type="submit" value="Remove" />

                </form>
            </div>
        );
    });
    
    return(
        <div className="domoList">
            {domoNodes}
        </div>
    );
};

const loadDomosFromServer = () => {
    sendAjax('GET', '/getDomos', null, (data) => {
        ReactDOM.render(
            <DomoList domos={data.domos} />,
            document.querySelector("#domos")
        );
    });
};

const setup = function(csrfToken) {
    console.dir(csrfToken);
    csrf = csrfToken;
    console.dir(csrf);
    
    ReactDOM.render(
        <DomoList domos={[]} />, document.querySelector("#domos")
    );
    
    loadDomosFromServer();
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});