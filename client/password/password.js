const handlePasswordChange = (e) => {
    e.preventDefault();
    
    $("#errorMessage").text("");
    
    if($("#pass").val() == '' || $("#pass2").val() == ''){
        handleError("All fields are required");
        return false;
    }
    
    if($("#pass").val() === $("#pass2").val()){
        handleError("New Password can't be the same as the old password");
        return false;
    }
    
    sendAjax('POST', $("#passwordForm").attr("action"), $("#passwordForm").serialize(), redirect);
    
    return false;
};

const ChangeWindow = (props) => {
    return(
        <form id="passwordForm" name="passwordForm"
              onSubmit={handlePasswordChange}
              action="/change"
              method="POST"
              className="mainForm"
            >
            <label htmlFor="pass">Old Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <label htmlFor="pass">New Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="retype password" />
            <input name="_csrf" type="hidden" value={props.csrf} />
            <input id="passwordFormSubmit" type="submit" value="Change Password" />
            
        </form>
    );
};

const createChangeWindow = (csrf) => {
    ReactDOM.render(
        <ChangeWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

const setup = (csrf) => {
    getAds();
    createChangeWindow(csrf);
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});