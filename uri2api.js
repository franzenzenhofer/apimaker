var parseuri = require("./lib/parseuri.js");
var API = function(uri_object) {
  var self = this;
  self.host = uri_object.host;
  self.password = uri_object.password;
  self.user = uri_object.password;
  self.protocol = uri_object.protocol;
  self.connector = require(self.protocol);
  self.source = uri_object.source;
  self.port = uri_object.port;
  self.path = uri_object.path;
  self.staticPath = undefined;
  self.statusCodeCallbacks = {};
  self.sendDataAsJson = false;
  self.sendDataAsRaw = false;
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
  self.p = {};
  for(var n in uri_object.queryKey) {
    var key_capitalized = n.charAt(0).toUpperCase() + n.substring(1).toLowerCase();
    self.p[n] = uri_object.queryKey[n];
    self.p["get" + key_capitalized] = function() {
      var self = this;
      return self.p[n]
    };
    self.p["set" + key_capitalized] = function(val) {
      var self = this;
      self.p[n] = val;
      return self
    }
  }
  return self
};
API.prototype.request = function(method, params, callback) {
  var self = this;
  var method = method || "GET";
  var params = params || undefined;
  var callback = callback || undefined;
  var path = self.path;
  var data = undefined;
  if(arguments.length === 2 && typeof arguments[1] === "function") {
    callback = params
  }
  for(var n in params) {
    self.p[n] = params[n]
  }
  
  if(!self.sendDataAsJson&&!self.sendDataAsRaw)
  {
  var params_string = '';
    var z = 0;
    for(var key in self.p) {
      var val = "";
      if(typeof self.p[key] !== "function") {
        var val = self.p[key];
        if(val !== undefined) {
          if(typeof self.p[key] === "object") {
            var val = JSON.stringify(self.p[key])
          }
          var glue = "&";
          if(z === 0) {
            glue = ""
          }
          params_string  = params_string + glue + key + "=" + encodeURIComponent(val);
          z++
        }
      }
    }
  }
  
  
  if(method === 'GET')
  {
    path = path + '?' + params_string;
  }
  else if(method === 'POST')
  {
    if(self.sendDataAsJson)
    {
      data = JSON.stringify(params);
    }
    else if(self.sendDataAsRaw)
    {
      data = params;
    }
    else
    {
      data = params_string;
    }
  }
  
  //overwrite any other path stuff
  if(self.staticPath)
  {
    path = self.staticPath;
  }
  
  var options = {host:self.host, port:self.port, path:path, method:method};
  //console.log(options);
 // console.log(data);
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
  if(data)
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
};
API.prototype.GET = function(params, callback) {
  var self = this;
  return self.request("GET", params, callback)
};
API.prototype.POST = function(params, callback) {
  var self = this;
  return self.request("POST", params, callback)
};
API.prototype.PUT = function(params, callback) {
  var self = this;
  return self.request("PUT", params, callback)
};
API.prototype.DELETE = function(params, callback) {
  var self = this;
  return self.request("DELETE", params, callback)
};
API.prototype.addStatusCodeCallback = function(statusCode, callback) {
  var self = this;
  self.statusCodeCallbacks[statusCode + ""] = callback;
  return self
};

API.prototype.sendJson = function(val) {
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

API.prototype.sendRaw = function(val) {
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
/*var api = createAPI("http://tupalo.com/de/api/easy/v1/spots?origin=&name=");
//console.log(api);
api.addStatusCodeCallback(404, function(e) {
  throw new Error("It's an 404");
});
api.GET({origin:"Schmalzhofgasse,Wien", name:"Biricz"}, function(d) {
  console.log(d)
});*/

var api = createAPI('https://www.googleapis.com/urlshortener/v1/url?longUrl=&key=test');
//api.sendDataAsJson = true;
api.sendJson().POST({longUrl:'http://tupalo.com/'}, function(d) {
  console.log(d)
})