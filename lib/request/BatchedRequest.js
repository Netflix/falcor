var Request = require("falcor/request/Request");

function BatchedRequest(subscribe) {
    Request.call(this, subscribe);
}

BatchedRequest.create = Request.create;

BatchedRequest.prototype = Object.create(Request.prototype);
BatchedRequest.prototype.constructor = BatchedRequest;

BatchedRequest.prototype.getSourceObservable = function getSourceObservable() {
    if(this.refCountedObservable) {
        return this.refCountedObservable;
    }
    this.pending = true;
    var index = this.index;
    return (this.refCountedObservable = this
        .publish()
        .refCount()
        .map(function(envelope) {
            debugger;
            return {
                index: index,
                jsonGraph: (envelope.jsonGraph ||
                    envelope.jsong  ||
                    envelope.values ||
                    envelope.value)
            };
        })
    );
};

module.exports = BatchedRequest;