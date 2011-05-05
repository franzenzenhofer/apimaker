    var AwesomeObject = function()
    {  
       var f = function() { console.log('i am awesome'); }
       var self = f;
       self.whatstuff = 'really awesome';
       self.doStuff =  function() { AwesomeObject.prototype.doStuff.apply(self,arguments); }
       return self;
    }

    AwesomeObject.prototype.doStuff = function()
    {
       var self = this;
       console.log('i did '+self.whatstuff+' stuff');
       return self;
    }

    var awesome = new AwesomeObject(); //returns the interal f object
    awesome(); // prints 'i am awesome'
    awesome.doStuff(); // throws an error
