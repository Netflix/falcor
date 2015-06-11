var collapse = require("falcor/support/collapse")
var BatchedRequest = require("falcor/request/BatchedRequest");

function GetRequest(subscribe) {
    BatchedRequest.call(this, subscribe);
}

GetRequest.prototype = Object.create(BatchedRequest.prototype);

GetRequest.prototype.getSourceMethod = function getSourceMethod() {
    return "get";
};

GetRequest.prototype.getSourceArgs = function getSourceArgs() {
    debugger;
    return collapse(this.pathmap);
};

module.exports = GetRequest;