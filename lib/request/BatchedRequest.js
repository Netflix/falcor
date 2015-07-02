var Rx = require("rx/dist/rx");
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

    if(this.refCountedObservable) {
        return this.refCountedObservable;
    }

    var self = this;

    return (this.refCountedObservable = this[
        "finally"](function() {
            self.refCountedObservable = undefined;
        })
        .shareReplay(null, 1, immediateScheduler));
};

module.exports = BatchedRequest;