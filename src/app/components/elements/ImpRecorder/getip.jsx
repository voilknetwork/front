require("isomorphic-fetch")

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;

      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

const getData = () => {
    var result;
    return new Promise(function(resolve, reject) {
        //
        //http://www.geoplugin.net/json.gp
        getJSON("https://api.ipify.org?format=json", function(err, data){ 
           result = data; 
           resolve(result);
        })
    })
}

const getIP = () => {
    return getData().then(result => result.ip)
}

export { getData, getIP };