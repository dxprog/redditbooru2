var processIdent = '[' + process.env.LISTEN_PORT + '] ',
    Response = function(req, res) {
        this._start = Date.now();
        this._res = res;
        this._req = req;
    };

Response.prototype.writeJSON = function(obj) {
    this._res.jsonp(obj);
    this.logResponse();
};

Response.prototype.write = function(obj, end) {
    
};

Response.prototype.render = function(template, data) {
    this._res.render(template, data);
    this.logResponse();
};

Response.prototype.end = function() {
    this._res.end();
    this.logResponse();
};

Response.prototype.logResponse = function() {
    console.log(processIdent + this._req.originalUrl + ' served in ' + ((Date.now() - this._start) / 1000) + 's');
};

module.exports = Response;