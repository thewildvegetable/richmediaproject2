//get csrf token and check if logged in
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        //check if logged in
        if (result.loggedIn){
            //change login to logout
            let loginLink = document.getElementById('login');
            loginLink.textContent = 'Log out';
            loginLink.href = '/logout';
            
            //make logged in tabs visible
            document.querySelector('#loggedIn').style.display = 'block';
        }
    });
};

$(document).ready(function() {
    getToken();
});