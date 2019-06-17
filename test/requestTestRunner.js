var _ = require("lodash");
var Rx = require("rx");
var testRunner = require("./testRunner");

function toObservable(request, queue, onNext) {
    return Rx.Observable.create(function(observer) {
        return queue.get([request]).subscribe({
            onNext: function(x) {
                observer.onNext(x);
                onNext && onNext.call(this, x);
            },
            onError: observer.onError.bind(observer),
            onCompleted: observer.onCompleted.bind(observer)
        });
    });
}

module.exports = function(expected, queue, onNext) {
    return toObservable(expected.getPathValues.query[0], queue, onNext);
};
