var apimaker = require("../apimaker.js");
//implementation of the google url shortener API
//http://code.google.com/apis/urlshortener/v1/getting_started.html
var short = apimaker("https://www.googleapis.com/urlshortener/v1/url?longUrl=&key=", "POST").enableSendAsJson();

var expand = apimaker("https://www.googleapis.com/urlshortener/v1/url?shortUrl=&key=&projection=");

//needs an OAuth
//will look into node OAuth and how it will work together with apimaker
//var userHistory = apimaker('https://www.googleapis.com/urlshortener/v1/url/history', 'GET');

short({longUrl:"http://news.ycombinator.com/"}, function(a) {
  a = JSON.parse(a);
  console.log('short: '+a.longUrl + " --\> " + a.id)
});


expand({'shortUrl':'http://goo.gl/ovZB'}, function(a){
  a = JSON.parse(a);
  console.log('expand: '+a.id + " --\> " +a.longUrl);
});

//with analytics data
expand({
  shortUrl:'http://goo.gl/ovZB',
  projection:'FULL'
}, function(a){
  a = JSON.parse(a);
  console.log('expand: '+a.id + " ("+ a.analytics.allTime.shortUrlClicks +" clicks) --\> " +a.longUrl + " ("+ a.analytics.allTime.longUrlClicks  +" clicks)");
});





