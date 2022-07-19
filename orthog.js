const request = require('request');
var rp = require('request-promise');
const urlencode = require('urlencode');

exports.test = (ress,text) => {
   /* request('https://speller.yandex.net/services/spellservice.json/checkText?text='+urlencode(text),  function (error, response, body) {
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        body = JSON.parse(body);
        console.log('body:', body); // Print the HTML for the Google homepage.
        ress.send({"result":body});
      });*/
       rp('https://speller.yandex.net/services/spellservice.json/checkText?text='+urlencode(text))
      .then(function (body) {
          body = JSON.parse(body);
          console.log('body:', body); // Print the HTML for the Google homepage.
          ress.send({"result":body});        
          return body
      })
      .catch(function (err) {
         console.log(err);
      });
      
   } 

 


  

