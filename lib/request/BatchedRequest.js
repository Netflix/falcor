var Rx = require("rx/dist/rx");
var Observer = Rx.Observer;
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

var Request = require("./../request/Request");

function BatchedRequest() {
    Request.call(this);
}

BatchedRequest.create = Request.create;

BatchedRequest.prototype = Object.create(Request.prototype);
BatchedRequest.prototype.constructor = BatchedRequest;

BatchedRequest.prototype.getSourceObservable = function getSourceObservable() {

    if (this.refCountedObservable) {
        return this.refCountedObservable;
    }

    var count = 0;
    var source = this;
    var subject = new Rx.ReplaySubject(null, null, immediateScheduler);
    var connection = null;

    return (this.refCountedObservable = Observable.create(function subscribe(observer) {
        if (++count === 1 && !connection) {
            connection = source.subscribe(subject);
        }
        var subscription = subject.subscribe(observer);
        return function dispose() {
            subscription.dispose();
            if (--count === 0) {
                connection.dispose();
            }
        }
    }));
};

module.exports = BatchedRequest;