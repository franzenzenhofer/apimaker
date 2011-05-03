var https = require("https");
var http = require("http");
var parseuri = require("./lib/parseuri.js");

var API = function(path_array, params_object, parent)
{
  var self = this;
  self.childname = path_array.shift();
  self.parent = parent || null;
  self.name = undefined;
  
  //set own name
  if(self&&self.parent&&self.parent.childname)
  {
    self.name=self.parent.childname;
  }
  console.log(self.name);
  
  //set protocoll // http or https
  if(self.name&&!self.parent.name)
  {
      self.protocoll=require(self.name);
  }
  if(!self.protocoll&&self.parent&&self.parent.protocoll)
  {
    self.protocoll=self.parent.protocoll;
  }
  
  //if there is a next child
  //create child
  if(self.childname)
  {
    self[self.childname] = new API(path_array, params_object, self);
  }
  else //if there are no more childs, apply the params object
  {
    self.p = params_object;
  }
  return self;
}

API.prototype.request = function(method, params, callback){
  var self = this;
  var params = params || undefined;
  var callback = params || undefined;
  if(arguments.length===2&&typeof arguments[1] === 'function')
  { callback = params; }
  for(var n in params)
  {
    self.p[n]=params[n];
  }
  
  var options = {
    host: 'www.google.com',
    port: 80,
    path: '/upload',
    method: 'POST'
  };
  
};

API.prototype.get = function(params, callback){ return self.request('GET', params, callback); };
API.prototype.post = function(params, callback){ return self.request('POST', params, callback);};
API.prototype.put = function(params, callback){ return self.request('PUT', params, callback);};
API.prototype.delete = function(params, callback){ return self.request('DELETE', params, callback);};

//parameter object
var Params = function(parameters_array)
{
  var self = this;
  parameters_array.forEach(function(e){
    var key_value_array = e.split('=');
    self[key_value_array[0]]=decodeURIComponent(key_value_array[1]);
    var key_capitalized = key_value_array[0].charAt(0).toUpperCase() + key_value_array[0].substring(1).toLowerCase();
    self['get'+key_capitalized]=function(){ return self[key_value_array[0]]; };
    self['set'+key_capitalized]=function(val){ return self[key_value_array[0]]=decodeURIComponent(val); };
  });
}

//create API (and parameters) object
var createAPI = function (uri_string)
{
  var uri_string = uri_string;
  var path_array = undefined;
  var parameters_array = undefined;
  if(uri_string && typeof uri_string === 'string')
  {
    var uo=parseuri(uri_string);
  //  var path_par_array = uri_string.split('?');
    var path_array = uo.path.split(/\//);
    if(!uo.port){if(uo.protocol==='https'){uo.port='443';}else{uo.port='80';}}
    path_array.unshift(uo.port);
    path_array.unshift(uo.host);
    path_array.unshift(uo.protocol);
    var parameters_array = uo.query.split('&');
  }
  return new API(path_array, new Params(parameters_array));
}

var api = createAPI("https://ajax.googleapis.com/ajax/services/language/detect?v=1.0&q=test");
//console.log(a);
console.log(api.https['ajax.googleapis.com']["443"].ajax.services.language.detect.p.getQ());

