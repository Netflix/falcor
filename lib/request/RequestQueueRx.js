var Rx = require("rx/dist/rx");
var RequestQueue = require("./RequestQueue");
var RequestQueueV2 = require("./RequestQueueV2");

function RequestQueueRx(model, scheduler) {
    this.model = model;
    this.scheduler = scheduler;
    this.requests = this._requests = [];
}

// RX MONKEY PATCH
var getRequest = RequestQueueV2.prototype.get;
RequestQueueRx.prototype.get = function(paths) {
    var self = this;
    return Rx.Observable.create(function(observer) {
        getRequest.call(self, paths, paths, function() {
            observer.onNext();
            observer.onCompleted();
        });
    });
};

RequestQueueRx.prototype.set = RequestQueue.prototype.set;
RequestQueueRx.prototype.call = RequestQueue.prototype.call;
RequestQueueRx.prototype.removeRequest = RequestQueueV2.prototype.removeRequest;

module.exports = RequestQueueRx;
