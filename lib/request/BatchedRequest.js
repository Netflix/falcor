var Request = require("falcor/request/Request");

function BatchedRequest(subscribe) {
    Request.call(this, subscribe);
}

BatchedRequest.create = Request.create;

BatchedRequest.prototype = Object.create(Request.prototype);
BatchedRequest.prototype.constructor = BatchedRequest;

BatchedRequest.prototype.getSourceObservable = function getSourceObservable() {

    if(this.connectedObservable) {
        return this.connectedObservable;
    }

    this.pending = true;
    var index = this.index;
    var connectable = (this
        .map(function(envelope) {
            return {
                index: index,
                jsonGraph: (envelope.jsonGraph ||
                    envelope.jsong  ||
                    envelope.values ||
                    envelope.value)
            };
        })
        .replay(null, 1));

    connectable.connect();

    return (this.connectedObservable = connectable);
};

module.exports = BatchedRequest;