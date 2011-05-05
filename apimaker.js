//apimaker
var parseuri = require("./lib/parseuri.js");

var debugIt=!1,enableDebug=function(a){debugIt=a||!1;return this},d=function(a){if(debugIt)if(typeof a==="function")return a();else console.log(">>>>DEBUG"),console.log(a),console.log("<<<<DEBUG")};

var createUriDataString = function(data)
{
  d(data);
  var data_string = '';
    var z = 0;
    for(var key in data) {
      var val = "";
      if(typeof data[key] !== "function") {
        var val = data[key];
        if(val !== undefined) {
          if(typeof data[key] === "object") {
            var val = JSON.stringify(data[key])
          }
          var glue = "&";
          if(z === 0) {
            glue = ""
          }
          data_string  = data_string + glue + key + "=" + encodeURIComponent(val);
          z++
        }
      }
    }
    return data_string;
}


var API = function(uri_object) {
  //var self = this;
  var f = function(data,callback,method)
  {
    return self.request(data,callback,method);
  }
  self = f;
  self.host = uri_object.host;
  self.password = uri_object.password;
  self.user = uri_object.password;
  self.protocol = uri_object.protocol;
  self.connector = require(self.protocol);
  self.source = uri_object.source;
  self.port = uri_object.port;
  self.path = uri_object.path;
  self.staticPath = undefined;
  self.callback = function(d){console.log(d);};
  self.statusCodeCallbacks = {};
  self.partialCallback = undefined;
  self.sendDataAsJson = false;
  self.sendDataAsRaw = false;
  self.headers = {};
  self.defaultMethod = 'GET';
  //console.log(self.defaultMethod);
  self.errorCallback = function(e) {
    throw new Error(e);
  };
  if(!self.port) {
    if(self.protocol === "https") {
      self.port = 443
    }else {
      self.port = 80
    }
  }
  self.data = {};
  for(var n in uri_object.queryKey) {
    var key_capitalized = n.charAt(0).toUpperCase() + n.substring(1).toLowerCase();
    self.data[n] = uri_object.queryKey[n];
    self["get" + key_capitalized] = function() {
      var key = n+'';
      return function(){  return self.data[key]; }
    }();
    //console.log(key_capitalized);
    //console.log(n);
    self["set" + key_capitalized] = function(val) {
      var key = n+'';
      return function(val){  self.data[key] = val; return self; }
    }();
  }

  //does not work, as we do not create a new F
  f.prototype = API.prototype;
  //we mixin the API prototype
  for(var i in API.prototype)
  {
    if(API.prototype.hasOwnProperty(i))
    {
      if(typeof API.prototype[i] === 'function')
      {
        //console.log('functions'+i);
        f[i]=function(){ var funcname = i+''; return function() { d(funcname); API.prototype[funcname].apply(self,arguments); } }();
      }
      else
      {
        //console.log(i);
        f[i]=API.prototype[i];
      }
    }
  }
  return f;
};
API.prototype.request = function(data, callback, method) {
  var self = this;
  //console.log(self.defaultMethod);
  var method = method || self.defaultMethod  || "GET";
  d(data);
  var data = data || {};
  var returndata_array = [];
  var callback = callback || self.callback || undefined;
  var path = self.path;
  if(arguments.length === 2 && typeof arguments[1] === "function") {
    callback = data
  }
  
  
  if(!self.sendDataAsRaw)
  {
    d("data mixin");
    d(data);
    var newdata = {};
    for(var n in self.data) {
    newdata[n] = self.data[n]
    }
    for(var n in data) {
    newdata[n] = data[n]
    }
    data = newdata;
  }
  
  if(method === 'GET' || method === 'DELETE' )
  {
    //d("GET GET GET GET GET");
    path = path + '?' + createUriDataString(data);
    d('GET path:' + path);
  }
  else if(method === 'POST' || method === 'PUT')
  {
    if(self.sendDataAsJson)
    {
      data = JSON.stringify(data);
    }
    else if(self.sendDataAsRaw)
    {
      data = data;
    }
    else
    {
      data = createUriDataString(data);
    }
  }
  
  //overwrite any other path stuff
  if(self.staticPath)
  {
    path = self.staticPath;
  }
  
  var options = {host:self.host, port:self.port, path:path, method:method};
  d(options);
  //console.log(options);
  //console.log(data);
  var req = self.connector.request(options, function(res) {
    res.setEncoding("utf8");
    if(self.statusCodeCallbacks[res.statusCode + ""]) {
      res.on("data", function(d) {
        self.statusCodeCallbacks[res.statusCode + ""](d)
      })
    }else {
      res.on("data", function(d) {
        returndata_array.push(d);
        if(self.partialCallback)
        {
          self.partialCallback(d);
        }
      });
      res.on("end", function(){
        callback(returndata_array.join(''));
      })
    }
  });
  //set additonal headers
  for(var z in  self.headers)
  {
    req.setHeader(z, self.headers[z]);
  }
  
  if(data && (method === 'POST' || method === 'PUT'))
  {
    //req.setHeader('Content-Length', data.length*2)
    /*if(self.sendDataAsJson)
    {
      req.setHeader("Content-Type",'application/json');
    }*/
    req.write(data);
  }
  req.end();
  req.on("error", function(e) {
    self.errorCallback(e)
  })
  return self;
};
API.prototype.GET = function(data, callback) {
  var self = this;
  d(self);
  d(data);
  return self.request( data, callback, "GET")
};
API.prototype.POST = function(data, callback) {
  var self = this;
  return self.request(data, callback, "POST")
};
API.prototype.PUT = function(data, callback) {
  var self = this;
  return self.request( data, callback, "PUT")
};
API.prototype.DELETE = function(data, callback) {
  var self = this;
  return self.request( data, callback, "DELETE")
};
API.prototype.addStatusCodeCallback = function(statusCode, callback) {
  var self = this;
  self.statusCodeCallbacks[statusCode + ""] = callback;
  return self
};

API.prototype.enableSendAsJson = function(val) {
  var self = this;
  self.setHeader("Content-Type",'application/json');
  if(val === false)
  {
    self.sendDataAsJson = false;
  }
  else
  {
    self.sendDataAsJson = true;
  }
  return self;
};

API.prototype.enableSendAsRaw = function(val) {
  var self = this;
  if(val === false)
  {
    self.sendDataAsRaw = false;
  }
  else
  {
    self.sendDataAsRaw = true;
  }
  return self;
};

API.prototype.setHeader = function(header, value)
{
  var self = this;
  self.headers[header]=value;
  return self;
}

//this stupid overwrite method is necessary for mixed (GET parameters and POST data) requests
API.prototype.setStaticPath = function(path)
{
  var self = this;
  self.staticPath = path;
  return self;
}

var createAPI = function(uri_string, method, headers) {
  var uri_string = uri_string;
  var method = method || undefined;
  var headers = headers || undefined;
  var uri_object = {};
  if(uri_string && typeof uri_string === "string") {
    uri_object = parseuri(uri_string)
  }
  for(var n in uri_object) {
    if(uri_object[n] === "") {
      uri_object[n] = undefined
    }
  }
  for(var n in uri_object.queryKey) {
    var val = uri_object.queryKey[n];
    if(val === "") {
      uri_object.queryKey[n] = undefined
    }else {
      uri_object.queryKey[n] = decodeURIComponent(uri_object.queryKey[n])
    }
  }
  var a = new API(uri_object);
  if(method && typeof method === 'string')
  {
    a.defaultMethod = method.toUpperCase();
  }
  if(headers)
  {
    a.headers = headers;
  }
  a.prototype = API.prototype;
  return a;
};


module.exports = createAPI;
module.exports.create = module.exports;
module.exports.enableDebug = enableDebug;


/*var api = createAPI("http://tupalo.com/de/api/easy/v1/spots?origin=&name=", 'GET', {'fakeheader':'i am an fake header'});
//console.log(api);
enableDebug(false);
//console.log(api.defaultMethod);
//api();
//api.GET();
//api.addStatusCodeCallback(404, function(e) {
//  throw new Error("It's an 404");
//});
//console.log(api.prototype);
//api.GET();
api.port=80;
api({origin:"Schmalzhofgasse,Wien", name:"Biricz"}, function(d) {
  console.log(d)
});*/
//console.log(api.defaultMethod);

