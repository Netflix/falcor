var collapse = require("falcor/support/collapse")
var BatchedRequest = require("falcor/request/BatchedRequest");

function GetRequest(subscribe) {
    BatchedRequest.call(this, subscribe);
}

GetRequest.create = BatchedRequest.create;

GetRequest.prototype = Object.create(BatchedRequest.prototype);
GetRequest.prototype.constructor = GetRequest;

GetRequest.prototype.getSourceMethod = function getSourceMethod() {
    return "get";
};

GetRequest.prototype.getSourceArgs = function getSourceArgs() {
    debugger;
    return collapse(this.pathmap);
};

module.exports = GetRequest;