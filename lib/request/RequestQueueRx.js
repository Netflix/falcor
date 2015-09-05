var RequestQueue = require("./RequestQueue");
var RequestQueueV2 = require("./RequestQueueV2");

function RequestQueueRx(model, scheduler) {
    this.model = model;
    this.scheduler = scheduler;
    this.requests = this._requests = [];
}

// RX MONKEY PATCH
RequestQueueRx.prototype.get = RequestQueueV2.prototype.get;
RequestQueueRx.prototype.removeRequest = RequestQueueV2.prototype.removeRequest;

RequestQueueRx.prototype.set = RequestQueue.prototype.set;
RequestQueueRx.prototype.call = RequestQueue.prototype.call;

module.exports = RequestQueueRx;
