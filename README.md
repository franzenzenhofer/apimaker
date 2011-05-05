APIMAKER
===

the apimaker transforms uri-strings to cool APIs

docu is currently alpha i would say

please see the /sample folder for some examples

installation

      >npm install apimaker
      
then

      var apimaker = require("apimaker");
      
create a GET request api 

      //var api = apimaker(uri, method, headers); 
      
      //a GET API 
      //GET is default
      var expand = apimaker("https://www.googleapis.com/urlshortener/v1/url?shortUrl=&key=&projection=");
      
      //use it
      //api(oneTimeDataObject, callback(incomingData));
      expand({'shortUrl':'http://goo.gl/ovZB'}, function(a){
        a = JSON.parse(a);
       console.log('expand: '+a.id + " --\> " +a.longUrl);
      });
      
      //GET API with additonal header
      var expand = apimaker("https://www.googleapis.com/urlshortener/v1/url?shortUrl=&key=&projection=", 'GET', {'User-Agent':'Bond, James Bond'})
      
      
      //a POST API
      var short = apimaker("https://www.googleapis.com/urlshortener/v1/url?longUrl=&key=", "POST");
      
      //google demands we send the data as JSON
      short.enableSendAsJson();
      
      //use it
      //api(oneTimeDataObject, callback(incomingData))
      short({longUrl:"http://news.ycombinator.com/"}, function(a) {
        a = JSON.parse(a);
       console.log('short: '+a.longUrl + " --\> " + a.id)
      });
      
      //PUT
      //docu soon to come
      
      //DELETE
      //docu soont to come
      
magic 

      //with an uri like
      //https://www.googleapis.com/urlshortener/v1/url?longUrl=&key=
      //you get
      
      //api.d holds all default-data
      api.d.longUrl
      api.d.key
      
      //getters in setters if you are into that kinda stuff
      //note, these set the default values
      //they stay the same with every request
      api.getLongurl(value)
      api.setLongurl(value)
      
      
      
      
other usefull functions

      //usefull to set callbacks for HTTP 404, 301, ...
      api.addStatusCodeCallback(statusCode, callback)

      //all POST data will be sent as JSON
      //plus with a Content-Type: application/json header
      api.enableSendAsJson()

      //all data will be send as RAW
      //means you have to encode it yourself
      api.enableSendAsRaw()
      
      //add additonal headers to your API requests
      api.setHeader(header, value)
  
      //a quirks arround method to overwrite the path 
      //for GET/POST mix requests 
      //lets hope you will never need it
      api.setStaticPath(path)
      
TODO

 * encoding of incoming data is currently always UTF8, should be configurable
 * PUT and DELETE examples
 * more docu about the awesome features
 * example use together with node-OAuth 
 * support HTTP AUTH (is there an API that sill uses this?)

      
      