const handleError = (message) => {
    $("#errorMessage").text(message);
};

const redirect = (response) => {
    $("#errorMessage").text("");
    window.location = response.redirect;
};

const sendAjax = (type, action, data, success) => {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function(xhr, status, error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};

const getAds = () => {
    sendAjax('GET', '/getAds', null, (data) => {
        //get the 2 ad containers
        let ad1Img = document.getElementById('ad1');
        let ad2Img = document.getElementById('ad2');
        
        //change their srcs
        ad1Img.src = `/assets/ads/${data.ad1}`;
        ad2Img.src = `/assets/ads/${data.ad2}`;
        
        //reposition ad2
        //ad2Img.top = document.height - ad2Img.height;
    });
};