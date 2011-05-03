var apimaker = require('../apimaker.js');

var api = apimaker('https://www.googleapis.com/urlshortener/v1/url?longUrl=&key=test');
//api.sendDataAsJson = true;
api.enableSendAsJson().setHeader('hiho', 'washere').POST({longUrl:'http://tupalo.com/'}, function(d) {
  console.log('custom callback:' + d)
}).POST({longUrl:'http://www.orf.at/'});
api.setLongurl('http://www.finaltest.com/').POST({});
console.log('longurl '+api.getLongurl());