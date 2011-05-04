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
  var self = this;
  self.host = uri_object.host;
  self.dataassword = uri_object.password;
  self.user = uri_object.password;
  self.datarotocol = uri_object.protocol;
  self.connector = require(self.datarotocol);
  self.source = uri_object.source;
  self.dataort = uri_object.port;
  self.dataath = uri_object.path;
  self.staticPath = undefined;
  self.callback = function(d){console.log(d);};
  self.statusCodeCallbacks = {};
  self.sendDataAsJson = false;
  self.sendDataAsRaw = false;
  self.headers = {};
  self.errorCallback = function(e) {
    throw new Error(e);
  };
  if(!self.dataort) {
    if(self.datarotocol === "https") {
      self.dataort = 443
    }else {
      self.dataort = 80
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
  return self;
};
API.prototype.request = function(method, data, callback) {
  var self = this;
  var method = method || "GET";
  d(data);
  var data = data || {};
  var callback = callback || self.callback || undefined;
  var path = self.dataath;
  if(arguments.length === 2 && typeof arguments[1] === "function") {
    callback = params
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
  
  var options = {host:self.host, port:self.dataort, path:path, method:method};
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
        callback(d)
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
    if(self.sendDataAsJson)
    {
      req.setHeader("Content-Type",'application/json');
    }
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
  return self.request("GET", data, callback)
};
API.prototype.POST = function(data, callback) {
  var self = this;
  return self.request("POST", data, callback)
};
API.prototype.PUT = function(data, callback) {
  var self = this;
  return self.request("PUT", data, callback)
};
API.prototype.DELETE = function(data, callback) {
  var self = this;
  return self.request("DELETE", data, callback)
};
API.prototype.addStatusCodeCallback = function(statusCode, callback) {
  var self = this;
  self.statusCodeCallbacks[statusCode + ""] = callback;
  return self
};

API.prototype.enableSendAsJson = function(val) {
  var self = this;
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

var createAPI = function(uri_string) {
  var uri_string = uri_string;
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
  return new API(uri_object)
};


module.exports = createAPI;
module.exports.create = module.exports;
module.exports.enableDebug = enableDebug;


/*var api = createAPI("http://tupalo.com/de/api/easy/v1/spots?origin=&name=");
//console.log(api);
api.addStatusCodeCallback(404, function(e) {
  throw new Error("It's an 404");
});
api.GET({origin:"Schmalzhofgasse,Wien", name:"Biricz"}, function(d) {
  console.log(d)
});*/

