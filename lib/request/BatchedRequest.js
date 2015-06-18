var Rx = require("rx/dist/rx");;
var Observer = Rx.Observer;
var immediateScheduler = Rx.Scheduler.immediate;

var Request = require("falcor/request/Request");

function BatchedRequest() {
    Request.call(this);
}

BatchedRequest.create = Request.create;

BatchedRequest.prototype = Object.create(Request.prototype);
BatchedRequest.prototype.constructor = BatchedRequest;

BatchedRequest.prototype.getSourceObservable = function getSourceObservable() {
    return this.refCountedObservable || (this.refCountedObservable = this.shareReplay(null, 1, immediateScheduler));
};

module.exports = BatchedRequest;